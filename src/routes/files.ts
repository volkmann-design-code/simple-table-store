import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { withApiKeyContext, withUserContext } from "../db";
import { tFromContext } from "../i18n";
import { sessionAuth } from "../middleware/session";
import type { DataStore, File, FileReference } from "../types";
import { getCachedFile } from "../utils/file-cache";
import { deleteFile, S3_BUCKET, uploadFile } from "../utils/s3";

// Helper to get API key datastore ID from context
async function getApiKeyDatastoreId(c: {
	req: {
		header: (name: string) => string | undefined;
		query: (name: string) => string | undefined;
	};
}): Promise<string | null> {
	// Check header first, then query parameter
	const apiKeyRaw = c.req.header("X-API-Key") || c.req.query("api_key");
	console.log(
		"[Files API Key] Raw API key from header/query:",
		apiKeyRaw ? `${apiKeyRaw.substring(0, 10)}...` : "none",
	);

	if (!apiKeyRaw) {
		console.log("[Files API Key] No API key found in header or query");
		return null;
	}

	// Trim whitespace to handle trailing spaces in URLs
	const apiKey = apiKeyRaw.trim();
	if (!apiKey) {
		console.log("[Files API Key] API key is empty after trimming");
		return null;
	}

	const { hashApiKey } = await import("../utils/apikey");
	const { adminQueryOne } = await import("../db");
	const keyHash = hashApiKey(apiKey);
	console.log("[Files API Key] Key hash:", keyHash.substring(0, 8) + "...");

	const key = await adminQueryOne<{
		datastore_id: string;
		expires_at: Date | null;
	}>("SELECT datastore_id, expires_at FROM api_keys WHERE key_hash = $1", [
		keyHash,
	]);

	if (!key) {
		console.log("[Files API Key] API key not found in database");
		return null;
	}

	if (key.expires_at && new Date(key.expires_at) < new Date()) {
		console.log("[Files API Key] API key expired at", key.expires_at);
		return null;
	}

	console.log(
		"[Files API Key] Valid API key found, datastore_id:",
		key.datastore_id,
	);
	return key.datastore_id;
}

export const fileRoutes = new Hono();

// Upload file - session auth only
fileRoutes.post("/datastores/:slug/files", sessionAuth, async (c) => {
	const session = c.get("session");
	const slug = c.req.param("slug");

	if (!S3_BUCKET) {
		return c.json(
			{ error: tFromContext(c, "errors.fileUploadsNotConfigured") },
			503,
		);
	}

	const formData = await c.req.formData();
	const file = formData.get("file") as File | null;

	if (!file || !(file instanceof File)) {
		return c.json({ error: tFromContext(c, "errors.noFileProvided") }, 400);
	}

	const result = await withUserContext<{
		datastore: DataStore | null;
		fileRecord: File | null;
	}>(session.userId, session.orgId, async (client) => {
		// Get datastore
		const dsResult = await client.query(
			"SELECT * FROM datastores WHERE slug = $1",
			[slug],
		);
		const datastore = dsResult.rows[0] || null;

		if (!datastore) {
			return { datastore: null, fileRecord: null };
		}

		// Read file bytes
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Generate object key
		const fileId = randomUUID();
		const objectKey = `datastores/${datastore.id}/${fileId}`;

		// Upload to S3
		await uploadFile(objectKey, buffer, file.type);

		// Create file record
		const fileResult = await client.query(
			`INSERT INTO files (id, datastore_id, object_key, filename, content_type, size_bytes, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
			[
				fileId,
				datastore.id,
				objectKey,
				file.name,
				file.type,
				buffer.length,
				session.userId,
			],
		);

		return {
			datastore: datastore as DataStore,
			fileRecord: fileResult.rows[0] as File,
		};
	});

	if (!result.datastore) {
		return c.json({ error: tFromContext(c, "errors.datastoreNotFound") }, 404);
	}

	if (!result.fileRecord) {
		return c.json(
			{ error: tFromContext(c, "errors.failedToCreateFileRecord") },
			500,
		);
	}

	// Return file reference
	const fileRef: FileReference = {
		file_id: result.fileRecord.id,
		filename: result.fileRecord.filename,
		content_type: result.fileRecord.content_type,
		size: result.fileRecord.size_bytes,
		url: `/api/files/${result.fileRecord.id}`,
	};

	return c.json(fileRef, 201);
});

// Handle CORS preflight requests for files endpoint
fileRoutes.options("/files/:id", async (c) => {
	const fileId = c.req.param("id");
	console.log("[OPTIONS] Preflight request for file:", fileId);

	const apiKeyDatastoreId = await getApiKeyDatastoreId(c);

	if (!apiKeyDatastoreId) {
		// Not an API key request, return 200 with no CORS headers
		console.log(
			"[OPTIONS] No API key found, returning 200 without CORS headers",
		);
		return c.text("", 200);
	}

	// Get file to find its datastore_id
	const file = await withApiKeyContext<File | null>(
		apiKeyDatastoreId,
		async (client) => {
			const result = await client.query("SELECT * FROM files WHERE id = $1", [
				fileId,
			]);
			return result.rows[0] || null;
		},
	);

	if (!file) {
		// File not found or not accessible, but still respond to preflight
		console.log("[OPTIONS] File not found, returning 200 without CORS headers");
		return c.text("", 200);
	}

	// Verify file belongs to the API key's datastore
	if (file.datastore_id !== apiKeyDatastoreId) {
		console.log(
			"[OPTIONS] File datastore mismatch, returning 200 without CORS headers",
		);
		return c.text("", 200);
	}

	// Set CORS headers for preflight - allow any origin for file access
	c.header("Access-Control-Allow-Origin", "*");
	c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
	c.header("Access-Control-Allow-Headers", "X-API-Key, Content-Type");
	c.header("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours

	console.log("[OPTIONS] Preflight response sent");
	return c.text("", 200);
});

// Download file - supports session auth or API key auth
fileRoutes.get("/files/:id", async (c) => {
	const fileId = c.req.param("id");
	console.log("[Files GET] Request for file:", fileId);
	console.log("[Files GET] Request URL:", c.req.url);
	console.log("[Files GET] Query params:", c.req.query());

	let file: File | null = null;
	let accessedViaApiKey = false;

	// Check session auth first
	const { getCookie } = await import("hono/cookie");
	const token = getCookie(c, "session");

	if (token) {
		const { verifySessionToken } = await import("../utils/jwt");
		const session = await verifySessionToken(token);

		if (session) {
			file = await withUserContext<File | null>(
				session.userId,
				session.orgId,
				async (client) => {
					const result = await client.query(
						"SELECT * FROM files WHERE id = $1",
						[fileId],
					);
					return result.rows[0] || null;
				},
			);
		}
	}

	// Check API key auth
	if (!file) {
		const apiKeyDatastoreId = await getApiKeyDatastoreId(c);
		console.log(
			"[Files GET] API key datastore ID:",
			apiKeyDatastoreId || "none",
		);
		if (apiKeyDatastoreId) {
			accessedViaApiKey = true;
			console.log(
				"[Files GET] API key authentication detected, accessedViaApiKey = true",
			);
			file = await withApiKeyContext<File | null>(
				apiKeyDatastoreId,
				async (client) => {
					const result = await client.query(
						"SELECT * FROM files WHERE id = $1",
						[fileId],
					);
					return result.rows[0] || null;
				},
			);
			console.log(
				"[Files GET] File found via API key:",
				file ? `yes (${file.id})` : "no",
			);
		} else {
			console.log("[Files GET] No API key found, accessedViaApiKey = false");
		}
	} else {
		console.log(
			"[Files GET] File found via session auth, accessedViaApiKey = false",
		);
	}

	if (!file) {
		return c.json(
			{ error: tFromContext(c, "errors.fileNotFoundOrAccessDenied") },
			404,
		);
	}

	// Get file from cache or S3
	const cached = await getCachedFile(file.object_key);
	if (!cached) {
		return c.json(
			{ error: tFromContext(c, "errors.fileNotFoundInStorage") },
			404,
		);
	}

	// Build response headers
	const headers: Record<string, string> = {
		"Content-Type": cached.contentType,
		"Content-Disposition": `inline; filename="${file.filename}"`,
	};

	console.log(
		"[Files GET] accessedViaApiKey before setting headers:",
		accessedViaApiKey,
	);

	// Set CORS headers for API key requests - allow any origin for file access
	if (accessedViaApiKey) {
		console.log("[Files GET] Setting CORS headers for API key request");
		headers["Cross-Origin-Resource-Policy"] = "cross-origin";
		headers["Access-Control-Allow-Origin"] = "*";
		headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
		headers["Access-Control-Max-Age"] = "86400";
		console.log("[Files GET] Headers set:", Object.keys(headers).join(", "));
		console.log(
			"[Files GET] CORP header value:",
			headers["Cross-Origin-Resource-Policy"],
		);
		console.log(
			"[Files GET] CORS header value:",
			headers["Access-Control-Allow-Origin"],
		);
		console.log("[Files GET] All headers:", JSON.stringify(headers, null, 2));
	} else {
		console.log(
			"[Files GET] NOT setting CORS headers - accessedViaApiKey is false",
		);
		console.log(
			"[Files GET] Headers without CORS:",
			Object.keys(headers).join(", "),
		);
	}

	// Return file with headers
	console.log(
		"[Files GET] Final headers being sent:",
		JSON.stringify(headers, null, 2),
	);
	const response = new Response(new Uint8Array(cached.body), {
		headers,
	});

	// CRITICAL: Override any CORP header set by secureHeaders middleware
	// This must be done on the Response object itself
	if (accessedViaApiKey) {
		response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
		console.log(
			"[Files GET] Overriding CORP header on Response object to:",
			response.headers.get("Cross-Origin-Resource-Policy"),
		);
	}

	console.log(
		"[Files GET] Final Response headers:",
		Array.from(response.headers.entries())
			.map(([k, v]) => `${k}: ${v}`)
			.join(", "),
	);
	return response;
});

// Delete file - session auth only
fileRoutes.delete("/files/:id", sessionAuth, async (c) => {
	const session = c.get("session");
	const fileId = c.req.param("id");

	const result = await withUserContext<{ file: File | null; deleted: boolean }>(
		session.userId,
		session.orgId,
		async (client) => {
			// Get file
			const fileResult = await client.query(
				"SELECT * FROM files WHERE id = $1",
				[fileId],
			);
			const file = fileResult.rows[0] || null;

			if (!file) {
				return { file: null, deleted: false };
			}

			// Delete from S3
			try {
				await deleteFile(file.object_key);
			} catch (error) {
				console.error("Failed to delete file from S3:", error);
				// Continue with DB deletion even if S3 deletion fails
			}

			// Delete from database
			await client.query("DELETE FROM files WHERE id = $1", [fileId]);

			return { file: file as File, deleted: true };
		},
	);

	if (!result.deleted) {
		return c.json({ error: tFromContext(c, "errors.fileNotFound") }, 404);
	}

	return c.body(null, 204);
});
