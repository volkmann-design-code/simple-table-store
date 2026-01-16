## 1. Investigation

- [x] 1.1 Identify the root cause of why CORS origins are not being stored
- [x] 1.2 Verify the database schema and column type for `allowed_cors_origins`
- [x] 1.3 Test the current PATCH endpoint behavior with various input values

## 2. Implementation

- [x] 2.1 Fix the logic in PATCH `/api/datastores/:slug` endpoint to properly handle `allowed_cors_origins` storage
- [x] 2.2 Ensure empty strings are normalized to `null` for database storage
- [x] 2.3 Ensure non-empty valid strings are stored as-is (with whitespace trimmed)
- [x] 2.4 Ensure `null` values are stored as `null`

## 3. Testing & Validation

- [x] 3.1 Test updating CORS origins with a valid comma-separated string
- [x] 3.2 Test updating CORS origins with an empty string (should store as null)
- [x] 3.3 Test updating CORS origins with null (should store as null)
- [x] 3.4 Verify that after update, the value persists when fetching the datastore
- [x] 3.5 Test that CORS headers work correctly after the fix
