
## Context

`datastore-app` stores record values in Postgres `records.data` (JSONB) and validates them against `datastores.column_definitions`. The prior datastore-app design explicitly called “File attachments” out of scope; this change adds them while keeping Postgres as the system of record for metadata and authorization only.

## Goals / Non-Goals

**Goals**
- Store uploaded file bytes in an S3-compatible object store (not in Postgres).
- Keep a durable database reference to uploaded files, and store only references in `records.data`.
- Expose files to clients only via a first-party API URL (never expose S3 internal URLs).
- Cache file reads in memory for up to 24h and bounded by a configurable memory limit.
- Add UI support for uploading files in record create/edit flows.

**Non-Goals**
- Public sharing of files.
- Virus scanning / content moderation.
- Chunked/multipart resumable uploads.
- Automatic garbage collection of orphaned files (tracked as a follow-up).
- Cross-record file reuse / deduplication guarantees.

## Decisions

### Storage backend: S3-compatible object storage

- Use a S3-compatible API (AWS S3, MinIO, etc.).
- Configure access via env vars (e.g. endpoint, region, bucket, access key, secret).
- Store objects under a predictable key prefix (e.g. `datastores/<datastore_id>/<file_id>`), independent of user-facing filenames.

**Rationale**: Meets the requirement to keep file bytes out of Postgres and allows cheap, scalable storage.

### Database representation

Add a new table for file metadata (example shape; exact schema finalized in implementation):

- `files`
  - `id` (UUID)
  - `datastore_id` (FK → `datastores.id`)
  - `object_key` (string; S3 key)
  - `filename` (original name)
  - `content_type`
  - `size_bytes`
  - `created_at`, `created_by_user_id` (optional but useful)

Record values for `file` columns store a small JSON object (not bytes), e.g.:

- `{ "file_id": "<uuid>", "filename": "...", "content_type": "...", "size": 123, "url": "/api/files/<uuid>" }`

**Rationale**: Keeps record JSON small, provides a stable first-party URL, and enables validation + authorization checks.

### API surface

- **Upload**: a session-authenticated endpoint to accept `multipart/form-data` and create a `files` row + S3 object.
  - Prefer per-datastore upload route (e.g. `POST /api/datastores/:slug/files`), so validation and RLS scoping are natural.
- **Download**: a first-party download endpoint (e.g. `GET /api/files/:id`) that:
  - Authenticates via session **or** API key (to keep API-key consumers functional when records contain files).
  - Authorizes via Postgres RLS (files scoped to datastore/org).
  - Streams bytes from S3 to the client.
  - Never returns S3 internal URLs.

### In-memory file caching

- Cache the downloaded bytes (and minimal metadata like content type) in memory for:
  - **TTL**: up to 24h (default), configurable.
  - **Capacity**: bounded by configurable memory limit (bytes).
- Use an LRU/TTL cache library (e.g. `lru-cache`) with `sizeCalculation` based on byte length.
- On cache hit, serve bytes without contacting S3.

**Rationale**: Meets the explicit caching requirement while keeping implementation minimal and idiomatic for Hono/Node/Bun.

### UI integration (Hono JSX server-rendered pages)

The current record create/edit flow uses standard HTML forms and `c.req.parseBody()`. For file inputs, switch to `multipart/form-data` and:

- Upload selected files as part of the record submit (server-side upload then record insert/update), or
- Upload first (async) and store the file reference into a hidden input before submit.

**Chosen default**: keep UX simple and compatible by supporting `multipart/form-data` in the record form handler; optionally add async upload later.

## Risks / Trade-offs

- **Memory pressure**: In-memory caching of large files can evict other data; mitigate with a strict `maxBytes` cap and reasonable defaults.
- **Large file uploads**: Request body size limits must be set to avoid OOM; mitigate by enforcing max size at upload and rejecting oversized files early.
- **Orphaned objects**: If a record is deleted/updated, objects may remain; document and add a future GC/cleanup job.

## Migration Plan

- Add DB migration(s) for the `files` table and indexes and add RLS policies analogous to `records`.
- Deploy new env vars to configure S3 access.
- No backfill required (only new columns of type `file` use this feature).

## Open Questions

- Should API keys be allowed to **download** files (read-only), or should file URLs require session-only auth?
**ANSWER**: When an API-Key requests some records and they contain file URLs, then these file-urls should contain a temporary key on their own that allows these URLs to be accessed independently (e.g. to load the file as an image in a browser)
- Do we need file deletion endpoints and/or automatic cleanup on record deletion?
**ANSWER**: Files should be deleted when the associated record is deleted
- Do we need support for multiple files per cell (array) vs exactly one file per `file` column?
**ANSWER**: One file per cell

