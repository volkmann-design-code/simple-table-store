import { createMiddleware } from "hono/factory";
import { tFromContext } from "../i18n";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
	console.warn(
		"WARNING: ADMIN_TOKEN not set. Admin API will reject all requests.",
	);
}

export const adminAuth = createMiddleware(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return c.json({ error: tFromContext(c, "errors.missingAuthHeader") }, 401);
	}

	const token = authHeader.slice(7);

	if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
		return c.json({ error: tFromContext(c, "errors.invalidAdminToken") }, 401);
	}

	await next();
});
