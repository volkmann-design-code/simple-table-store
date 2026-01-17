# Change: Add CORS Support for Files API

## Why

The files API endpoint (`GET /api/files/:id`) currently lacks CORS (Cross-Origin Resource Sharing) support, which prevents clients from using files (e.g., images) as sources in cross-origin contexts. The records API endpoint already has working CORS implementation, but files accessed via API keys cannot be used in `<img>` tags or other cross-origin scenarios when the client is hosted on a different domain.

## What Changes

- **MODIFIED** Files API endpoint (`GET /api/files/:id`) to include CORS headers when accessed via API key and the datastore has `allowed_cors_origins` configured
- **NEW** OPTIONS preflight handler for `/api/files/:id` endpoint to support CORS preflight requests
- **MODIFIED** File download response to include `Access-Control-Allow-Origin` header when origin matches datastore's allowed CORS origins

## Impact

- Affected specs: `file-uploads` (MODIFIED - add CORS header handling for file downloads)
- Affected code:
  - API routes: `src/routes/files.ts` (add CORS headers and OPTIONS handling, reuse existing CORS helper functions from `src/routes/api.ts`)
  - Reuse existing CORS utilities: `parseCorsOrigins`, `isOriginAllowed` from `src/utils/validation.ts`
- Dependencies: None (uses existing CORS infrastructure from records API)
