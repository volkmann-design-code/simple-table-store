
## 1. Database & Migrations

- [x] 1.1 Add a new SQL migration for `files` table (metadata + object_key) and indexes
- [x] 1.2 Add Postgres RLS policies for `files` (user context) and, if applicable, API-key context

## 2. Backend: Storage Integration

- [x] 2.1 Add S3 client wiring configured via env vars (endpoint/region/bucket/access key/secret)
- [x] 2.2 Add file upload endpoint (multipart/form-data) that stores bytes in S3 and metadata in Postgres
- [x] 2.3 Add file download endpoint that authorizes via RLS and proxies bytes from S3
- [x] 2.4 Ensure record APIs never return internal S3 URLs, only first-party API URLs

## 3. Backend: Validation & Types

- [x] 3.1 Add `file` to `ColumnDefinition.type` and define validation options (max size, allowed content types)
- [x] 3.2 Extend record validation so `file` values are validated against the column definition and reference an existing file for the datastore

## 4. Backend: In-memory File Cache

- [x] 4.1 Add an in-memory cache with TTL (default up to 24h) and configurable max memory
- [x] 4.2 Integrate cache into file download path (cache hit serves without S3 call; cache miss fetches and stores)
- [x] 4.3 Add basic cache observability hooks/logging (optional; keep minimal)

## 5. Frontend/UI

- [x] 5.1 Add record form support for file inputs in `DatastorePage` (file picker + preview of uploaded reference)
- [x] 5.2 Update view route handlers to accept multipart form submissions and to upload files before record insert/update

## 6. Deployment & Docs

- [x] 6.1 Document S3 env vars in `apps/datastore-app/env.example` and `apps/datastore-app/README.md`
- [x] 6.2 Extend Kubernetes secrets/deployment templates to include S3 env vars
- [x] 6.3 Document cache-related env vars and defaults

