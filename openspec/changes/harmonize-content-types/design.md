## Context

The datastore app has two paths for record CRUD:
1. **View routes** (`/datastores/:slug/records`) — HTML form submissions with multipart encoding
2. **API routes** (`/api/datastores/:slug/records`) — JSON API for programmatic access

Both should behave consistently, but they currently diverge in how files are handled. A separate file upload endpoint already exists at `/api/datastores/:slug/files`.

Additionally, the record CRUD logic is duplicated across both route files (~320 lines in views.tsx mirroring api.ts), violating DRY and increasing maintenance burden.

## Goals / Non-Goals

**Goals:**
- Consistent content-type handling: JSON for all record data
- Reuse existing file upload endpoint for file columns
- Upload progress visibility for large files
- Maintain backwards compatibility for API consumers

**Non-Goals:**
- Changing the file storage backend
- Adding new file validation rules
- Supporting resumable uploads (out of scope)

## Decisions

### Decision: JSON-only record endpoints

All record create/update operations will accept only `application/json`. File column values will contain file references (already uploaded via `/api/datastores/:slug/files`).

**Rationale:** Single content-type simplifies validation, error handling, and client implementation. The existing file endpoint already returns the correct reference format.

**Alternatives considered:**
- Accept both multipart and JSON on record endpoints — rejected due to complexity and inconsistent behavior
- Stream files through record endpoint — rejected because existing file endpoint already provides this

### Decision: Client-side file orchestration

The frontend will:
1. Detect file inputs with selected files
2. Upload each file to `/api/datastores/:slug/files`
3. Collect returned file references
4. Submit complete record as JSON to `/api/datastores/:slug/records`

**Rationale:** Allows progress tracking per file, enables retry on individual file failures, and keeps record endpoint simple.

### Decision: Single source of truth for record CRUD

Remove duplicated record handlers from view routes. The frontend will submit directly to API routes via JavaScript fetch. View routes will only serve HTML pages (GET requests).

**Rationale:** 
- Eliminates ~320 lines of duplicated code
- Single place to maintain validation, file handling, and business logic
- API routes already have correct JSON handling
- Frontend needs JavaScript anyway for file upload orchestration

**Alternatives considered:**
- Keep view routes as thin proxies that call API routes internally — rejected because it adds complexity and the frontend needs JS regardless for progress indicators
- Extract shared service layer — over-engineering for current scale

### Decision: Progress indicator using XHR/fetch upload events

For large files, the UI will show upload progress using `XMLHttpRequest.upload.onprogress` or the Fetch API with progress streams.

**Rationale:** Native browser API, no dependencies, works with existing endpoint.

## Risks / Trade-offs

- **Risk**: Two-step submission (files then record) could leave orphan files if record creation fails
  - **Mitigation**: Files are already stored independently. Could add a cleanup job for unreferenced files later if needed. This is acceptable for v1.

- **Risk**: Increased round trips for records with multiple files
  - **Mitigation**: Files can be uploaded in parallel. For typical use (1-2 files), latency is acceptable.

## Migration Plan

1. Update frontend form submission to use JSON + file upload endpoint
2. Remove multipart parsing from view routes
3. Both changes deployed together (no backwards compatibility period needed — form and handler are in same codebase)

## Open Questions

None — design is straightforward given existing file endpoint.
