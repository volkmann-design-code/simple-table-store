# Change: Harmonize content-types across views and API

## Why

The create/edit record modal in `DatastorePage.tsx` uses `multipart/form-data` to handle file inputs. However, the API routes (`/api/datastores/:slug/records`) expect `application/json`, causing 500 errors when the form tries to submit. The view routes work because they parse multipart, but this creates an inconsistency where the same record operations behave differently depending on which route is used.

## What Changes

- **Frontend**: Decouple file uploads from record submission
  - Upload files first via `/api/datastores/:slug/files` endpoint (already exists)
  - Submit record data as JSON with file references
  - Add upload progress indicator for large files
- **View routes**: Remove duplicated record CRUD logic
  - Delete inline record create/update/delete handlers
  - Frontend submits directly to API routes via fetch
  - View routes only serve HTML pages (read-only)
- **API routes**: No changes needed (already expects JSON)

## Impact

- Affected specs: `record-management`, `file-uploads`
- Affected code:
  - `src/views/DatastorePage.tsx` (form submission logic)
  - `src/routes/views.tsx` (remove ~320 lines of duplicated CRUD handlers)
