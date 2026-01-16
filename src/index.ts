import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { languageDetector } from "hono/language";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { preventCookiesForApiKeys } from "./middleware/api-cache";
import { adminRoutes } from "./routes/admin";
import { apiRoutes } from "./routes/api";
import { authRoutes } from "./routes/auth";
import { fileRoutes } from "./routes/files";
import { viewRoutes } from "./routes/views";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
	"*",
	languageDetector({
		supportedLanguages: ["en", "de"],
		fallbackLanguage: "en",
	}),
);
// Remove cookies for API key requests to allow caching
app.use("/api/*", preventCookiesForApiKeys);

// Static files
app.use("/dist/*", serveStatic({ root: "./" }));

// Routes
app.route("/admin", adminRoutes);
app.route("/auth", authRoutes);
app.route("/api", apiRoutes);
app.route("/api", fileRoutes);
app.route("/", viewRoutes);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

const port = parseInt(process.env.PORT || "3000", 10);
console.log(`🚀 Datastore App running on http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
