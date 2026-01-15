import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { withUserContext } from "../db";
import { getLanguage } from "../i18n";
import type {
	ColumnDefinition,
	DataRecord,
	DataStore,
	Organization,
	UserPublic,
} from "../types";
import { enrichRecordWithFileUrls } from "../utils/file-enrichment";
import { verifySessionToken } from "../utils/jwt";
import { DashboardPage } from "../views/DashboardPage";
import { DatastorePage } from "../views/DatastorePage";
import { LoginPage } from "../views/LoginPage";
import { OrgPage } from "../views/OrgPage";

export const viewRoutes = new Hono();

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
		? `r.data->>'${sortField}' ${sortOrder}`
		: `r.${sortField} ${sortOrder}`;

	return { orderBy, sortField, sortOrder };
}

// Get branding configuration from environment variables
const getBrandingConfig = () => {
	const logoUrl = process.env.LOGO_URL || "";
	const appTitle = process.env.APP_TITLE || "simple-table-store";
	return { logoUrl, appTitle };
};

// Login page
viewRoutes.get("/login", (c) => {
	const error = c.req.query("error");
	const lang = getLanguage(c);
	const branding = getBrandingConfig();
	return c.html(
		<LoginPage
			error={error}
			lang={lang}
			logoUrl={branding.logoUrl}
			appTitle={branding.appTitle}
		/>,
	);
});

// Handle form logout
viewRoutes.post("/auth/logout", async (c) => {
	const { clearSessionCookie } = await import("../middleware/session");
	clearSessionCookie(c);
	return c.redirect("/login");
});

// Dashboard (requires auth)
viewRoutes.get("/", async (c) => {
	const token = getCookie(c, "session");

	if (!token) {
		return c.redirect("/login");
	}

	const session = await verifySessionToken(token);

	if (!session) {
		return c.redirect("/login");
	}

	const datastores = await withUserContext<DataStore[]>(
		session.userId,
		session.orgId,
		async (client) => {
			const result = await client.query(
				"SELECT * FROM datastores ORDER BY name ASC",
			);
			return result.rows;
		},
	);

	const lang = getLanguage(c);
	const branding = getBrandingConfig();
	return c.html(
		<DashboardPage
			session={session}
			datastores={datastores}
			lang={lang}
			logoUrl={branding.logoUrl}
			appTitle={branding.appTitle}
		/>,
	);
});

// Organization view
viewRoutes.get("/org", async (c) => {
	const token = getCookie(c, "session");

	if (!token) {
		return c.redirect("/login");
	}

	const session = await verifySessionToken(token);

	if (!session) {
		return c.redirect("/login");
	}

	// Check if user has org_id
	if (!session.orgId) {
		return c.redirect("/");
	}

	const result = await withUserContext<{
		organization: Organization | null;
		members: UserPublic[];
	}>(session.userId, session.orgId, async (client) => {
		// Get organization
		const orgResult = await client.query(
			"SELECT * FROM organizations WHERE id = $1",
			[session.orgId],
		);
		const organization = orgResult.rows[0] || null;

		if (!organization) {
			return { organization: null, members: [] };
		}

		// Get all members
		const membersResult = await client.query(
			"SELECT id, org_id, email, created_at, updated_at FROM users WHERE org_id = $1 ORDER BY created_at ASC",
			[session.orgId],
		);

		return {
			organization,
			members: membersResult.rows,
		};
	});

	if (!result.organization) {
		return c.redirect("/");
	}

	const lang = getLanguage(c);
	const branding = getBrandingConfig();
	return c.html(
		<OrgPage
			session={session}
			organization={result.organization}
			members={result.members}
			lang={lang}
			logoUrl={branding.logoUrl}
			appTitle={branding.appTitle}
		/>,
	);
});

// Datastore detail view
viewRoutes.get("/datastores/:slug", async (c) => {
	const token = getCookie(c, "session");

	if (!token) {
		return c.redirect("/login");
	}

	const session = await verifySessionToken(token);

	if (!session) {
		return c.redirect("/login");
	}

	const slug = c.req.param("slug");
	const page = parseInt(c.req.query("page") || "1", 10);
	const limit = 50;
	const sortParam = c.req.query("sort");
	const orderParam = c.req.query("order");

	const result = await withUserContext<{
		datastore: DataStore | null;
		records: DataRecord[];
		total: number;
		sortField: string;
		sortOrder: string;
	}>(session.userId, session.orgId, async (client) => {
		const dsResult = await client.query(
			"SELECT * FROM datastores WHERE slug = $1",
			[slug],
		);
		const datastore = dsResult.rows[0] || null;

		if (!datastore) {
			return {
				datastore: null,
				records: [],
				total: 0,
				sortField: "created_at",
				sortOrder: "DESC",
			};
		}

		const { orderBy, sortField, sortOrder } = buildOrderByClause(
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
			[datastore.id, limit, (page - 1) * limit],
		);

		const countResult = await client.query(
			"SELECT COUNT(*) as count FROM records WHERE datastore_id = $1",
			[datastore.id],
		);

		return {
			datastore,
			records: recordsResult.rows,
			total: parseInt(countResult.rows[0].count, 10),
			sortField,
			sortOrder,
		};
	});

	if (!result.datastore) {
		return c.notFound();
	}

	// Enrich records with file URLs for display
	const enrichedRecords = result.records.map((record) =>
		enrichRecordWithFileUrls(record, result.datastore!, null),
	);

	const lang = getLanguage(c);
	const branding = getBrandingConfig();
	return c.html(
		<DatastorePage
			session={session}
			datastore={result.datastore}
			records={enrichedRecords}
			pagination={{
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit),
			}}
			sort={{
				field: result.sortField,
				order: result.sortOrder.toLowerCase() as "asc" | "desc",
			}}
			lang={lang}
			logoUrl={branding.logoUrl}
			appTitle={branding.appTitle}
		/>,
	);
});
