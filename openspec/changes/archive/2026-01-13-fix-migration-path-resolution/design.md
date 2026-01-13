# Design: Migration Path Resolution

## Context
The application runs migrations in two contexts:
1. **Development**: Code runs directly from `src/` using Bun's hot reload
2. **Production/Container**: Code is compiled to `dist/` but source files (including migrations) are copied to `src/` in the container

The current implementation uses `import.meta.dir` which resolves to the directory of the executing file. In production, this points to `dist/db/` but migrations are in `src/db/migrations/`, causing path resolution failures.

## Goals / Non-Goals
- **Goals**:
  - Migration files resolve correctly in both dev and production environments
  - Path resolution is consistent across all migration-related code
  - Solution works with existing Dockerfile and build process
- **Non-Goals**:
  - Changing the Dockerfile structure (migrations stay in `src/`)
  - Changing the build process
  - Supporting custom migration paths (use env var if needed later)

## Decisions
- **Decision**: Use `process.cwd()` as the base path and resolve migrations relative to project root
  - **Rationale**: `process.cwd()` is consistent across environments (project root in dev, `/app` in container)
  - **Alternatives considered**:
    1. Environment variable: Adds configuration complexity
    2. Copy migrations to `dist/` during build: Changes build process
    3. Use `import.meta.url` with file URL parsing: More complex, same issue
- **Decision**: Resolve migrations as `src/db/migrations` relative to `process.cwd()`
  - **Rationale**: Works in both environments without changes to Dockerfile
  - **Path resolution**: `join(process.cwd(), 'src', 'db', 'migrations')`

## Risks / Trade-offs
- **Risk**: If `process.cwd()` changes unexpectedly, migrations won't resolve
  - **Mitigation**: This is standard practice and matches how most Node.js apps resolve paths
- **Trade-off**: Slightly less "magic" than `import.meta.dir` but more explicit and reliable

## Migration Plan
1. Update `src/db/migrate.ts` to use `process.cwd()`-based resolution
2. Update `src/routes/admin.ts` migration status endpoint to use same resolution
3. Test in both dev and container environments
4. No database or deployment changes required

## Open Questions
None - straightforward path resolution fix.
