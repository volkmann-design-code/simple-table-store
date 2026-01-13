## 1. Implementation
- [x] 1.1 Update `src/db/migrate.ts` to resolve migrations using `process.cwd()` instead of `import.meta.dir`
- [x] 1.2 Update `src/routes/admin.ts` migration status endpoint to use same path resolution
- [x] 1.3 Verify path resolution works in development environment
- [ ] 1.4 Verify path resolution works in containerized environment (test with Docker build)

## 2. Validation
- [ ] 2.1 Test migration execution via `POST /admin/migrate` endpoint in dev
- [ ] 2.2 Test migration status via `GET /admin/migrate/status` endpoint in dev
- [ ] 2.3 Test migration execution in container (build Docker image and run)
- [ ] 2.4 Test migration status in container
- [ ] 2.5 Verify no regressions in existing migration functionality
