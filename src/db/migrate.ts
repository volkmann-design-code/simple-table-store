import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "./index";

export const MIGRATIONS_DIR = join(process.cwd(), "src", "db", "migrations");

async function ensureMigrationsTable() {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
	const result = await pool.query(
		"SELECT version FROM schema_migrations ORDER BY version",
	);
	return new Set(result.rows.map((r: { version: string }) => r.version));
}

async function applyMigration(version: string, sql: string) {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		await client.query(sql);
		await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [
			version,
		]);
		await client.query("COMMIT");
		console.log(`✓ Applied migration: ${version}`);
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

export async function migrate(): Promise<{
	applied: string[];
	skipped: string[];
}> {
	await ensureMigrationsTable();
	const applied = await getAppliedMigrations();

	const files = await readdir(MIGRATIONS_DIR);
	const migrations = files.filter((f) => f.endsWith(".sql")).sort();

	const appliedMigrations: string[] = [];
	const skippedMigrations: string[] = [];

	for (const file of migrations) {
		const version = file.replace(".sql", "");
		if (!applied.has(version)) {
			const sql = await readFile(join(MIGRATIONS_DIR, file), "utf-8");
			await applyMigration(version, sql);
			appliedMigrations.push(version);
		} else {
			skippedMigrations.push(version);
		}
	}

	console.log("✓ All migrations applied");
	return { applied: appliedMigrations, skipped: skippedMigrations };
}

// Run if called directly
if (import.meta.main) {
	migrate()
		.then(() => process.exit(0))
		.catch((e) => {
			console.error("Migration failed:", e);
			process.exit(1);
		});
}
