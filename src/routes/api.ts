import { Hono } from "hono";
import { adminQueryOne, withApiKeyContext, withUserContext } from "../db";
import { getLanguage, tFromContext } from "../i18n";
import { sessionAuth } from "../middleware/session";
import type {
	ApiKey,
	ColumnDefinition,
	DataRecord,
	DataStore,
	PaginatedResponse,
} from "../types";
import { hashApiKey } from "../utils/apikey";
import { enrichRecordWithFileUrls } from "../utils/file-enrichment";
import { deleteFile, S3_BUCKET } from "../utils/s3";
import { validateRecordData } from "../utils/validation";

export const apiRoutes = new Hono();

// System fields that can be sorted on
const SYSTEM_SORT_FIELDS = ["created_at", "updated_at"];

// Build ORDER BY clause with validation against allowed columns
function buildOrderByClause(
	sortParam: string | undefined,
	orderParam: string | undefined,
	columnDefinitions: ColumnDefinition[],
): { orderBy: string; sortField: string; sortOrder: string } {
	const allowedColumns = [
		...SYSTEM_SORT_FIELDS,
		...columnDefinitions.map((c) => c.technical_name),
	];

	const sortField =
		sortParam && allowedColumns.includes(sortParam) ? sortParam : "created_at";
	const sortOrder =
		orderParam && ["asc", "desc"].includes(orderParam.toLowerCase())
			? orderParam.toUpperCase()
			: "DESC";

	// For data columns, sort by JSONB field; for system fields, sort directly
	const isDataColumn = columnDefinitions.some(
		(c) => c.technical_name === sortField,
	);
	const orderBy = isDataColumn
		? `data->>'${sortField}' ${sortOrder}`
		: `${sortField} ${sortOrder}`;

	return { orderBy, sortField, sortOrder };
}

// Helper to check API key and get datastore ID
async function getApiKeyDatastoreId(c: {
	req: {
		header: (name: string) => string | undefined;
		query: (name: string) => string | undefined;
	};
}): Promise<string | null> {
	// Check header first, then query parameter
	const apiKey = c.req.header("X-API-Key") || c.req.query("api_key");
	if (!apiKey) return null;

	const keyHash = hashApiKey(apiKey);
	const key = await adminQueryOne<ApiKey>(
		"SELECT * FROM api_keys WHERE key_hash = $1",
		[keyHash],
	);

	if (!key) return null;
	if (key.expires_at && new Date(key.expires_at) < new Date()) return null;

	return key.datastore_id;
}

// List datastores for current user's org
apiRoutes.get("/datastores", sessionAuth, async (c) => {
	const session = c.get("session");

	const datastores = await withUserContext<DataStore[]>(
		session.userId,
		session.orgId,
		async (client) => {
			const result = await client.query(
				"SELECT * FROM datastores ORDER BY created_at DESC",
			);
			return result.rows;
		},
	);

	return c.json({ data: datastores });
});

// Get single datastore by slug
apiRoutes.get("/datastores/:slug", sessionAuth, async (c) => {
	const session = c.get("session");
	const slug = c.req.param("slug");

	const datastore = await withUserContext<DataStore | null>(
		session.userId,
		session.orgId,
		async (client) => {
			const result = await client.query(
				"SELECT * FROM datastores WHERE slug = $1",
				[slug],
			);
			return result.rows[0] || null;
		},
	);

	if (!datastore) {
		return c.json({ error: tFromContext(c, "errors.datastoreNotFound") }, 404);
	}

	return c.json(datastore);
});

// List records - supports both session and API key auth
apiRoutes.get("/datastores/:slug/records", async (c) => {
	const slug = c.req.param("slug");
	const page = parseInt(c.req.query("page") || "1", 10);
	const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);
	const offset = (page - 1) * limit;
	const sortParam = c.req.query("sort");
	const orderParam = c.req.query("order");

	// Check for API key first
	const apiKey = c.req.header("X-API-Key") || c.req.query("api_key");
	const apiKeyDatastoreId = await getApiKeyDatastoreId(c);

	if (apiKeyDatastoreId) {
		// API key auth - use API key context
		const result = await withApiKeyContext<{
			records: DataRecord[];
			total: number;
			datastore: DataStore | null;
		}>(apiKeyDatastoreId, async (client) => {
			// Verify the slug matches the API key's datastore
			const dsResult = await client.query(
				"SELECT * FROM datastores WHERE id = $1 AND slug = $2",
				[apiKeyDatastoreId, slug],
			);
			const datastore = dsResult.rows[0] || null;

			if (!datastore) {
				return { records: [], total: 0, datastore: null };
			}

			const { orderBy } = buildOrderByClause(
				sortParam,
				orderParam,
				datastore.column_definitions,
			);

			const recordsResult = await client.query(
				`SELECT r.*, 
					uc.email as created_by_email, 
					uu.email as updated_by_email
				FROM records r
				LEFT JOIN users uc ON r.created_by = uc.id
				LEFT JOIN users uu ON r.updated_by = uu.id
				WHERE r.datastore_id = $1 
				ORDER BY ${orderBy} 
				LIMIT $2 OFFSET $3`,
				[apiKeyDatastoreId, limit, offset],
			);

			const countResult = await client.query(
				"SELECT COUNT(*) as count FROM records WHERE datastore_id = $1",
				[apiKeyDatastoreId],
			);

			return {
				records: recordsResult.rows,
				total: parseInt(countResult.rows[0].count, 10),
				datastore: datastore as DataStore,
			};
		});

		if (!result.datastore) {
			return c.json({ error: tFromContext(c, "errors.forbidden") }, 403);
		}

		// Enrich records with file URLs (include API key in URLs)
		const enrichedRecords = result.records.map((record) =>
			enrichRecordWithFileUrls(record, result.datastore!, apiKey || undefined),
		);

		return c.json({
			data: enrichedRecords,
			total: result.total,
			page,
			limit,
			totalPages: Math.ceil(result.total / limit),
		} as PaginatedResponse<DataRecord>);
	}

	// Session auth - check cookie
	const { getCookie } = await import("hono/cookie");
	const token = getCookie(c, "session");

	if (!token) {
		return c.json(
			{ error: tFromContext(c, "errors.authenticationRequired") },
			401,
		);
	}

	const { verifySessionToken } = await import("../utils/jwt");
	const session = await verifySessionToken(token);

	if (!session) {
		return c.json({ error: tFromContext(c, "errors.invalidSession") }, 401);
	}

	const result = await withUserContext<{
		records: DataRecord[];
		total: number;
		datastore: DataStore | null;
	}>(session.userId, session.orgId, async (client) => {
		// Get datastore by slug
		const dsResult = await client.query(
			"SELECT * FROM datastores WHERE slug = $1",
			[slug],
		);

		if (dsResult.rows.length === 0) {
			return { records: [], total: 0, datastore: null };
		}

		const datastore = dsResult.rows[0] as DataStore;
		const datastoreId = datastore.id;

		const { orderBy } = buildOrderByClause(
			sortParam,
			orderParam,
			datastore.column_definitions,
		);

		const recordsResult = await client.query(
			`SELECT r.*, 
				uc.email as created_by_email, 
				uu.email as updated_by_email
			FROM records r
			LEFT JOIN users uc ON r.created_by = uc.id
			LEFT JOIN users uu ON r.updated_by = uu.id
			WHERE r.datastore_id = $1 
			ORDER BY ${orderBy} 
			LIMIT $2 OFFSET $3`,
			[datastoreId, limit, offset],
		);

		const countResult = await client.query(
			"SELECT COUNT(*) as count FROM records WHERE datastore_id = $1",
			[datastoreId],
		);

		return {
			records: recordsResult.rows,
			total: parseInt(countResult.rows[0].count, 10),
			datastore,
		};
	});

	if (!result.datastore) {
		return c.json({ error: "DataStore not found" }, 404);
	}

	// Enrich records with file URLs
	const enrichedRecords = result.records.map((record) =>
		enrichRecordWithFileUrls(record, result.datastore!, null),
	);

	return c.json({
		data: enrichedRecords,
		total: result.total,
		page,
		limit,
		totalPages: Math.ceil(result.total / limit),
	} as PaginatedResponse<DataRecord>);
});

// Create record - session auth only
apiRoutes.post("/datastores/:slug/records", sessionAuth, async (c) => {
	const session = c.get("session");
	const slug = c.req.param("slug");
	const body = await c.req.json<{ data: Record<string, unknown> }>();

	if (!body.data) {
		return c.json({ error: tFromContext(c, "errors.dataFieldRequired") }, 400);
	}

	const result = await withUserContext<{
		record: DataRecord | null;
		errors?: { field: string; message: string }[];
	}>(session.userId, session.orgId, async (client) => {
		// Get datastore with columns
		const dsResult = await client.query(
			"SELECT * FROM datastores WHERE slug = $1",
			[slug],
		);

		if (dsResult.rows.length === 0) {
			return { record: null };
		}

		const datastore = dsResult.rows[0] as DataStore;

		// Validate data against column definitions
		const lang = getLanguage(c);
		const errors = validateRecordData(
			body.data,
			datastore.column_definitions,
			lang,
		);
		if (errors.length > 0) {
			return { record: null, errors };
		}

		// Insert record with created_by
		const recordResult = await client.query(
			`INSERT INTO records (datastore_id, data, created_by) 
			 VALUES ($1, $2, $3) 
			 RETURNING *, 
			   (SELECT email FROM users WHERE id = $3) as created_by_email`,
			[datastore.id, JSON.stringify(body.data), session.userId],
		);

		const record = recordResult.rows[0] as DataRecord;
		return { record: enrichRecordWithFileUrls(record, datastore, null) };
	});

	if (result.errors) {
		return c.json(
			{
				error: tFromContext(c, "errors.validationFailed"),
				details: result.errors,
			},
			400,
		);
	}

	if (!result.record) {
		return c.json({ error: "DataStore not found" }, 404);
	}

	return c.json(result.record, 201);
});

// Update record - session auth only
apiRoutes.patch("/datastores/:slug/records/:id", sessionAuth, async (c) => {
	const session = c.get("session");
	const slug = c.req.param("slug");
	const recordId = c.req.param("id");
	const body = await c.req.json<{ data: Record<string, unknown> }>();

	if (!body.data) {
		return c.json({ error: tFromContext(c, "errors.dataFieldRequired") }, 400);
	}

	const result = await withUserContext<{
		record: DataRecord | null;
		errors?: { field: string; message: string }[];
		notFound?: boolean;
	}>(session.userId, session.orgId, async (client) => {
		// Get datastore
		const dsResult = await client.query(
			"SELECT * FROM datastores WHERE slug = $1",
			[slug],
		);

		if (dsResult.rows.length === 0) {
			return { record: null, notFound: true };
		}

		const datastore = dsResult.rows[0] as DataStore;

		// Get existing record
		const existingResult = await client.query(
			"SELECT * FROM records WHERE id = $1 AND datastore_id = $2",
			[recordId, datastore.id],
		);

		if (existingResult.rows.length === 0) {
			return { record: null, notFound: true };
		}

		const existing = existingResult.rows[0] as DataRecord;

		// Merge data
		const mergedData = { ...existing.data, ...body.data };

		// Validate merged data
		const lang = getLanguage(c);
		const errors = validateRecordData(
			mergedData,
			datastore.column_definitions,
			lang,
		);
		if (errors.length > 0) {
			return { record: null, errors };
		}

		// Update record with updated_by
		const recordResult = await client.query(
			`UPDATE records 
			 SET data = $1, updated_at = NOW(), updated_by = $3 
			 WHERE id = $2 
			 RETURNING *, 
			   (SELECT email FROM users WHERE id = created_by) as created_by_email,
			   (SELECT email FROM users WHERE id = $3) as updated_by_email`,
			[JSON.stringify(mergedData), recordId, session.userId],
		);

		const record = recordResult.rows[0] as DataRecord;
		return { record: enrichRecordWithFileUrls(record, datastore, null) };
	});

	if (result.errors) {
		return c.json(
			{
				error: tFromContext(c, "errors.validationFailed"),
				details: result.errors,
			},
			400,
		);
	}

	if (result.notFound || !result.record) {
		return c.json({ error: tFromContext(c, "errors.recordNotFound") }, 404);
	}

	return c.json(result.record);
});

// Delete record - session auth only
apiRoutes.delete("/datastores/:slug/records/:id", sessionAuth, async (c) => {
	const session = c.get("session");
	const slug = c.req.param("slug");
	const recordId = c.req.param("id");

	const deleted = await withUserContext<boolean>(
		session.userId,
		session.orgId,
		async (client) => {
			// Get datastore
			const dsResult = await client.query(
				"SELECT id FROM datastores WHERE slug = $1",
				[slug],
			);

			if (dsResult.rows.length === 0) {
				return false;
			}

			const datastoreId = dsResult.rows[0].id;

			// Get record data to find associated files
			const recordResult = await client.query(
				"SELECT data FROM records WHERE id = $1 AND datastore_id = $2",
				[recordId, datastoreId],
			);

			if (recordResult.rows.length === 0) {
				return false;
			}

			const record = recordResult.rows[0] as DataRecord;
			const datastoreResult = await client.query(
				"SELECT * FROM datastores WHERE id = $1",
				[datastoreId],
			);
			const datastore = datastoreResult.rows[0] as DataStore;

			// Delete associated files
			if (S3_BUCKET && datastore) {
				for (const column of datastore.column_definitions) {
					if (column.type === "file") {
						const fileValue = record.data[column.technical_name];
						if (
							fileValue &&
							typeof fileValue === "object" &&
							"file_id" in fileValue
						) {
							const fileId = (fileValue as { file_id: string }).file_id;
							const fileResult = await client.query(
								"SELECT object_key FROM files WHERE id = $1",
								[fileId],
							);
							if (fileResult.rows.length > 0) {
								const objectKey = fileResult.rows[0].object_key;
								try {
									await deleteFile(objectKey);
								} catch (error) {
									console.error("Failed to delete file from S3:", error);
								}
								await client.query("DELETE FROM files WHERE id = $1", [fileId]);
							}
						}
					}
				}
			}

			// Delete record
			const result = await client.query(
				"DELETE FROM records WHERE id = $1 AND datastore_id = $2 RETURNING id",
				[recordId, datastoreId],
			);

			return result.rows.length > 0;
		},
	);

	if (!deleted) {
		return c.json({ error: tFromContext(c, "errors.recordNotFound") }, 404);
	}

	return c.body(null, 204);
});
