
# Change: Add file uploads to datastore-app

## Why

The datastore-app currently supports only JSON-serializable values in `records.data`. Many practical datasets need attachments (documents, images, exports). This change adds first-class file uploads without storing file bytes in Postgres.

## What Changes

- **NEW** `file` column type in `datastores.column_definitions` with validation options (max file size and allowed content types).
- **NEW** file storage in an S3-compatible object store (configured via environment variables; no file bytes stored in Postgres).
- **NEW** database table to store file metadata and the object key, so records store only references.
- **NEW** file upload endpoint and a first-party file download endpoint that proxies S3 reads and **never** returns internal S3 URLs.
- **NEW** in-memory caching for file reads (up to 24h TTL and bounded by a configurable memory limit) using a suitable caching library and Hono best practices.
- **NEW** UI support in the record create/edit modal to upload and reference files.

## Impact

- Affected specs (new change deltas):
  - `file-uploads` (new capability)
  - Related existing capabilities (behavioral integration only): `record-management`, `api-key-access`, `admin-api`
- Affected code (implementation stage):
  - Backend routes: `apps/datastore-app/src/routes/api.ts`, `apps/datastore-app/src/routes/views.tsx`
  - Validation/types: `apps/datastore-app/src/types.ts`, `apps/datastore-app/src/utils/validation.ts`
  - UI: `apps/datastore-app/src/views/DatastorePage.tsx`
  - DB migrations/RLS: `apps/datastore-app/src/db/migrations/*`
  - Deployment config/env: `apps/datastore-app/env.example`, `apps/datastore-app/k8s/*`

