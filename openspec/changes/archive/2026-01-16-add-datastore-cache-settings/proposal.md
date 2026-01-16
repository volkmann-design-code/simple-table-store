# Change: Add Cache Settings Per Datastore

## Why

Enable configurable HTTP cache-control headers per datastore to reduce server load and make caching behavior transparent. This allows datastore owners to control how long API responses should be cached by clients and intermediate proxies when accessed via API keys.

## What Changes

- **NEW** `cache_duration_seconds` column in `datastores` table (nullable integer, stored in seconds)
- **NEW** Settings modal in datastore page header area for configuring cache duration
- **MODIFIED** API key access endpoints to include `Cache-Control` header based on datastore setting
- **NEW** UI component for cache settings with description and input validation

## Impact

- Affected specs: `api-key-access` (MODIFIED), `record-management` (MODIFIED for UI)
- Affected code: 
  - Database migration: `src/db/migrations/012_datastore_cache_settings.sql`
  - API routes: `src/routes/api.ts` (add Cache-Control headers)
  - UI: `src/views/DatastorePage.tsx` (settings modal)
  - Types: `src/types.ts` (add cache_duration_seconds to DataStore)
  - Admin API: `src/routes/admin.ts` (optional: allow setting via admin API)
- Dependencies: None (uses existing infrastructure)
