import type { DataStore } from "../types";
import { isOriginAllowed, parseCorsOrigins } from "./validation";

// Helper to get CORS header value (returns the origin if allowed, null otherwise)
export function getCorsOriginHeader(
	requestOrigin: string | undefined,
	datastore: DataStore | null,
): string | null {
	if (!requestOrigin) {
		return null;
	}

	if (!datastore) {
		return null;
	}

	const allowedOrigins = parseCorsOrigins(datastore.allowed_cors_origins);
	if (allowedOrigins && isOriginAllowed(requestOrigin, allowedOrigins)) {
		return requestOrigin;
	}

	return null;
}

// Helper to set CORS headers for API key requests
export function setCorsHeaders(
	c: {
		header: (name: string, value: string) => void;
		req: { header: (name: string) => string | undefined };
	},
	datastore: DataStore,
): void {
	const requestOrigin = c.req.header("Origin");
	console.log("[CORS] Request origin:", requestOrigin || "none");

	const corsOrigin = getCorsOriginHeader(requestOrigin, datastore);
	if (corsOrigin) {
		console.log(
			"[CORS] Origin allowed, setting Access-Control-Allow-Origin header",
		);
		c.header("Access-Control-Allow-Origin", corsOrigin);
	} else {
		console.log(
			"[CORS] Origin not allowed or no allowed origins configured, not setting CORS headers",
		);
	}
}

// Helper to set CORS preflight headers
export function setCorsPreflightHeaders(
	c: {
		header: (name: string, value: string) => void;
		req: { header: (name: string) => string | undefined };
	},
	datastore: DataStore | null,
): void {
	const requestOrigin = c.req.header("Origin");
	console.log("[CORS Preflight] Request origin:", requestOrigin || "none");

	if (!requestOrigin) {
		console.log("[CORS Preflight] No Origin header, skipping CORS headers");
		return;
	}

	if (!datastore) {
		console.log("[CORS Preflight] No datastore found, skipping CORS headers");
		return;
	}

	const allowedOrigins = parseCorsOrigins(datastore.allowed_cors_origins);
	console.log("[CORS Preflight] Allowed origins:", allowedOrigins || "none");

	if (isOriginAllowed(requestOrigin, allowedOrigins)) {
		console.log("[CORS Preflight] Origin allowed, setting CORS headers");
		c.header("Access-Control-Allow-Origin", requestOrigin);
		c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
		c.header("Access-Control-Allow-Headers", "X-API-Key, Content-Type");
		c.header("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
	} else {
		console.log(
			"[CORS Preflight] Origin not allowed, not setting CORS headers",
		);
	}
}
