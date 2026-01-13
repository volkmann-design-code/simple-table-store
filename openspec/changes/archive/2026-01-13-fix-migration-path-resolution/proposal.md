# Change: Fix Migration Path Resolution

## Why
Migration file paths are resolved incorrectly in containerized environments. The code uses `import.meta.dir` which resolves to the compiled file location in `dist/`, but migration files are located in `src/db/migrations/`. This causes migration endpoints to fail in production containers while working correctly in development.

## What Changes
- Replace `import.meta.dir`-based path resolution with `process.cwd()`-based resolution for migration files
- Update both `src/db/migrate.ts` and `src/routes/admin.ts` to use consistent path resolution
- Ensure migrations resolve correctly in both development and containerized environments
- Add path resolution utility to centralize this logic if needed

## Impact
- Affected specs: `admin-api` (migration endpoints)
- Affected code: `src/db/migrate.ts`, `src/routes/admin.ts`
- Breaking changes: None (internal path resolution only)
