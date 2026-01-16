# Change: Fix CORS Storage Bug in PATCH /datastores/:slug

## Why

When updating CORS origins via the PATCH `/api/datastores/:slug` endpoint, the `allowed_cors_origins` value is not being stored correctly in the database. After updating, the field remains empty on subsequent loads, preventing CORS configuration from being persisted.

## What Changes

- **FIXED** Logic in PATCH `/api/datastores/:slug` endpoint to properly store `allowed_cors_origins` values
- The current implementation uses `body.allowed_cors_origins || null` which may incorrectly handle certain edge cases or fail to properly normalize the value before storage

## Impact

- Affected specs: `record-management` (MODIFIED - fix CORS origins storage in API endpoint)
- Affected code:
  - API routes: `src/routes/api.ts` (PATCH `/datastores/:slug` endpoint - fix CORS origins storage logic)
