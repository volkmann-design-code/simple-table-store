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
	const apiKey = c.req.header("X-API-Key") || c.req.query("api_key");
	if (!apiKey) return null;

	const { hashApiKey } = await import("../utils/apikey");
	const { adminQueryOne } = await import("../db");
	const keyHash = hashApiKey(apiKey);
	const key = await adminQueryOne<{
		datastore_id: string;
		expires_at: Date | null;
	}>("SELECT datastore_id, expires_at FROM api_keys WHERE key_hash = $1", [
		keyHash,
	]);

	if (!key) return null;
	if (key.expires_at && new Date(key.expires_at) < new Date()) return null;

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

// Download file - supports session auth or API key auth
fileRoutes.get("/files/:id", async (c) => {
	const fileId = c.req.param("id");

	let file: File | null = null;

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
		if (apiKeyDatastoreId) {
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
		}
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

	// Set headers and return file
	return new Response(new Uint8Array(cached.body), {
		headers: {
			"Content-Type": cached.contentType,
			"Content-Disposition": `inline; filename="${file.filename}"`,
		},
	});
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
