# Change: Add CORS Settings Per Datastore

## Why

Enable configurable CORS (Cross-Origin Resource Sharing) settings per datastore to allow controlled cross-origin access to API endpoints. This allows datastore owners to specify which origins are allowed to make API requests, enabling web applications hosted on different domains to access datastore records via API keys.

## What Changes

- **NEW** `allowed_cors_origins` column in `datastores` table (nullable text, stores comma-separated list of allowed origin URLs)
- **MODIFIED** Settings modal in datastore page to include CORS origins configuration field
- **MODIFIED** API key access endpoints to include `Access-Control-Allow-Origin` header based on datastore setting and request origin
- **NEW** UI component for CORS origins input with validation (one origin per line or comma-separated)
- **MODIFIED** API routes to handle CORS preflight requests (OPTIONS) for API key endpoints

## Impact

- Affected specs: `api-key-access` (MODIFIED - add CORS header handling), `record-management` (MODIFIED - add CORS setting to settings modal)
- Affected code:
  - Database migration: `src/db/migrations/013_datastore_cors_settings.sql`
  - API routes: `src/routes/api.ts` (add CORS headers and OPTIONS handling)
  - UI: `src/views/DatastorePage.tsx` (settings modal - add CORS origins input)
  - Types: `src/types.ts` (add allowed_cors_origins to DataStore)
  - i18n: `src/i18n/en.lang.ts` and `src/i18n/de.lang.ts` (add CORS-related translations)
- Dependencies: None (uses existing infrastructure)
