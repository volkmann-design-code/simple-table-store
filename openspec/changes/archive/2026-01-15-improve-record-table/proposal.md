# Change: Improve Record Table UX

## Why
Users need better visibility into record history (who created/updated records and when) and quick access to file previews for images and videos. Additionally, sorting records by different columns improves data exploration.

## What Changes
- **BREAKING**: Add `created_by` and `updated_by` columns to the records table (requires DB migration)
- Add sorting support to the records API via query parameters
- Display record metadata (created-by, created-at, updated-by, updated-at) in the table in a visually muted style
- Show inline thumbnail previews for image and video file columns
- Add a modal to view images/videos in a larger format when clicked

## Impact
- Affected specs: record-management, file-uploads
- Affected code:
  - `src/db/migrations/` (new migration for created_by/updated_by)
  - `src/routes/api.ts` (sorting support)
  - `src/routes/views.tsx` (sorting support)
  - `src/views/DatastorePage.tsx` (metadata display, thumbnails, preview modal, sortable headers)
  - `src/types.ts` (update DataRecord type)
