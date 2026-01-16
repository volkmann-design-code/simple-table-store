## 1. Database Schema

- [x] 1.1 Create migration `013_datastore_cors_settings.sql` to add `allowed_cors_origins` column (TEXT, comma-separated)
- [x] 1.2 Add constraint to validate origin format (optional: URL validation)

## 2. Backend Implementation

- [x] 2.1 Update `DataStore` type in `src/types.ts` to include `allowed_cors_origins: string | null`
- [x] 2.2 Add CORS header logic to API routes in `src/routes/api.ts`:
  - [x] 2.2.1 Parse comma-separated origins and check request origin against datastore's allowed_cors_origins
  - [x] 2.2.2 Set `Access-Control-Allow-Origin` header if origin matches
  - [x] 2.2.3 Handle OPTIONS preflight requests for API key endpoints
  - [x] 2.2.4 Include `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` in preflight responses
- [x] 2.3 Update PATCH `/api/datastores/:slug` endpoint to accept `allowed_cors_origins` field (comma-separated string)
- [x] 2.4 Add validation for CORS origins format (parse comma-separated string and validate each origin URL)

## 3. Frontend Implementation

- [x] 3.1 Add CORS origins input field to settings modal in `src/views/DatastorePage.tsx`
- [x] 3.2 Add i18n translations for CORS settings (label, description, placeholder, validation messages)
- [x] 3.3 Update `handleSettingsSubmit` function to include CORS origins in form submission
- [x] 3.4 Add client-side validation for origin format (one per line or comma-separated)
- [x] 3.5 Display current CORS origins in settings modal (if any)

## 4. Testing & Validation

- [ ] 4.1 Test CORS headers are set correctly for allowed origins
- [ ] 4.2 Test CORS headers are NOT set for disallowed origins
- [ ] 4.3 Test OPTIONS preflight requests return appropriate headers
- [ ] 4.4 Test settings modal saves and displays CORS origins correctly
- [ ] 4.5 Test validation prevents invalid origin formats
