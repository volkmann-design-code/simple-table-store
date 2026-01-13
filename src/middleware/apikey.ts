import { createMiddleware } from "hono/factory";
import { adminQueryOne } from "../db";
import { tFromContext } from "../i18n";
import type { ApiKey } from "../types";
import { hashApiKey } from "../utils/apikey";

declare module "hono" {
	interface ContextVariableMap {
		apiKeyDatastoreId?: string;
	}
}

// Helper to get API key from header or query parameter
function getApiKey(c: {
	req: {
		header: (name: string) => string | undefined;
		query: (name: string) => string | undefined;
	};
}): string | undefined {
	return c.req.header("X-API-Key") || c.req.query("api_key");
}

// Helper to validate API key and return datastore ID
async function validateApiKey(
	apiKey: string,
): Promise<{ datastoreId: string } | null> {
	const keyHash = hashApiKey(apiKey);
	const key = await adminQueryOne<ApiKey>(
		`SELECT * FROM api_keys WHERE key_hash = $1`,
		[keyHash],
	);

	if (!key) {
		return null;
	}

	if (key.expires_at && new Date(key.expires_at) < new Date()) {
		return null;
	}

	return { datastoreId: key.datastore_id };
}

// Middleware that allows either session OR API key auth
export const apiKeyOrSessionAuth = createMiddleware(async (c, next) => {
	const apiKey = getApiKey(c);

	if (apiKey) {
		const result = await validateApiKey(apiKey);

		if (!result) {
			return c.json({ error: tFromContext(c, "errors.invalidApiKey") }, 401);
		}

		c.set("apiKeyDatastoreId", result.datastoreId);
		await next();
		return;
	}

	// Fall through to check session (handled by route-level middleware)
	await next();
});

// Middleware that ONLY allows API keys (for strict read-only access)
export const apiKeyAuth = createMiddleware(async (c, next) => {
	const apiKey = getApiKey(c);

	if (!apiKey) {
		return c.json({ error: tFromContext(c, "errors.apiKeyRequired") }, 401);
	}

	const result = await validateApiKey(apiKey);

	if (!result) {
		return c.json({ error: "Invalid or expired API key" }, 401);
	}

	c.set("apiKeyDatastoreId", result.datastoreId);
	await next();
});

// Check that API key has access to a specific datastore
export function verifyApiKeyDatastoreAccess(
	datastoreId: string,
	apiKeyDatastoreId?: string,
): boolean {
	if (!apiKeyDatastoreId) return true; // Not using API key auth
	return datastoreId === apiKeyDatastoreId;
}
