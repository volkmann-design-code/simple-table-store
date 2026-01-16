import { deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

/**
 * Middleware to prevent Set-Cookie headers for API key requests
 * This allows responses to be cached by browsers/proxies
 *
 * This middleware should run AFTER languageDetector but BEFORE routes
 * to remove any cookies that were set by language detection
 */
export const preventCookiesForApiKeys = createMiddleware(async (c, next) => {
	// Check if this is an API key request (simple check without DB lookup for performance)
	const apiKey = c.req.header("X-API-Key") || c.req.query("api_key");

	if (apiKey) {
		// Mark as potential API key request
		c.set("isApiKeyRequest", true);
	}

	await next();

	// After response is prepared, remove Set-Cookie headers if it's an API key request
	if (c.get("isApiKeyRequest")) {
		// Delete the language cookie that was set by languageDetector
		deleteCookie(c, "language");

		// Also remove from response headers directly
		// Set-Cookie can appear multiple times (one per cookie), not comma-separated
		const headers = c.res.headers;

		// Get all Set-Cookie headers (they can appear multiple times)
		const setCookieHeaders: string[] = [];
		headers.forEach((value, key) => {
			if (key.toLowerCase() === "set-cookie") {
				setCookieHeaders.push(value);
			}
		});

		// Filter out language cookie
		const filteredCookies = setCookieHeaders.filter(
			(cookie) => !cookie.startsWith("language="),
		);

		// Remove all Set-Cookie headers
		headers.delete("Set-Cookie");

		// Re-add only non-language cookies
		for (const cookie of filteredCookies) {
			headers.append("Set-Cookie", cookie);
		}
	}
});
