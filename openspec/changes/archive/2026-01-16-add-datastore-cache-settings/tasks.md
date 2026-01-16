## 1. Database Schema
- [x] 1.1 Create migration `012_datastore_cache_settings.sql` to add `cache_duration_seconds INTEGER` column to `datastores` table (nullable, default NULL)
- [x] 1.2 Update `DataStore` type in `src/types.ts` to include `cache_duration_seconds?: number | null`

## 2. API Implementation
- [x] 2.1 Modify `GET /api/datastores/:slug/records` endpoint in `src/routes/api.ts` to set Cache-Control header when accessed via API key
- [x] 2.2 Implement logic: if `cache_duration_seconds` is set and > 0, set `Cache-Control: public, max-age=<seconds>`, otherwise set `Cache-Control: no-cache`
- [x] 2.3 Ensure Cache-Control header is only set for API key authenticated requests (not session auth)

## 3. Admin API (Optional)
- [x] 3.1 Update admin API PATCH `/admin/datastores/:id` to accept `cache_duration_seconds` field
- [x] 3.2 Update admin API GET `/admin/datastores/:id` to return `cache_duration_seconds` field

## 4. API Endpoint for Cache Settings
- [x] 4.1 Add API endpoint `PATCH /api/datastores/:slug` (session auth) in `src/routes/api.ts` to update cache_duration_seconds
- [x] 4.2 Implement validation: ensure user belongs to datastore's organization
- [x] 4.3 Accept `{ cache_duration_seconds: number | null }` in request body
- [x] 4.4 Return updated datastore in response

## 5. UI Implementation
- [x] 5.1 Add settings button/icon in datastore page header area (next to user info)
- [x] 5.2 Create settings modal component with:
  - Input field for cache duration (number, in seconds)
  - Description text explaining what the setting does
  - Save and Cancel buttons
- [x] 5.3 Implement form submission to update cache setting via `PATCH /api/datastores/:slug`
- [x] 5.4 Add i18n strings for settings modal (en/de)

## 6. Validation
- [ ] 6.1 Test API key request with cache_duration_seconds set - verify Cache-Control header
- [ ] 6.2 Test API key request with cache_duration_seconds NULL - verify no-cache header
- [ ] 6.3 Test session auth request - verify no Cache-Control header (or appropriate header)
- [ ] 6.4 Test settings modal UI - verify save/cancel behavior
- [ ] 6.5 Test PATCH endpoint - verify cache_duration_seconds update
- [ ] 6.6 Test with various cache duration values (0, 60, 3600, null, etc.)
