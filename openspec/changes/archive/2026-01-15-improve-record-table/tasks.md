## 1. Database Migration
- [x] 1.1 Create migration to add `created_by` and `updated_by` columns to records table
- [x] 1.2 Update `DataRecord` type in `src/types.ts` to include new fields

## 2. API Sorting Support
- [x] 2.1 Add `sort` and `order` query parameters to `GET /api/datastores/:slug/records`
- [x] 2.2 Add sorting support to views route `/datastores/:slug`
- [x] 2.3 Validate sort column against datastore's column_definitions plus system fields (created_at, updated_at)

## 3. Record Metadata Storage
- [x] 3.1 Update record creation endpoint to set `created_by` from session user
- [x] 3.2 Update record update endpoint to set `updated_by` from session user

## 4. Record Metadata Display
- [x] 4.1 Add metadata row below each record in the table (created-by, created-at, updated-by, updated-at)
- [x] 4.2 Style metadata with muted colors and smaller font

## 5. File Preview Thumbnails
- [x] 5.1 Add thumbnail preview rendering for image file columns in table cells
- [x] 5.2 Add thumbnail preview rendering for video file columns in table cells (poster frame)
- [x] 5.3 Make thumbnails clickable to open preview modal

## 6. Media Preview Modal
- [x] 6.1 Create modal component for viewing images at full/larger size
- [x] 6.2 Add video player support in the modal
- [x] 6.3 Add keyboard support (Escape to close)

## 7. Sortable Table Headers
- [x] 7.1 Add click handlers to table headers for sortable columns
- [x] 7.2 Display sort direction indicator on active sort column
- [x] 7.3 Preserve sort state in URL query parameters
- [x] 7.4 Preserve sort parameters when navigating pagination (Next/Previous links)
