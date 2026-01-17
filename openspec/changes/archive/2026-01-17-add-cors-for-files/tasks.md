## 1. Backend Implementation

- [x] 1.1 Extract CORS helper functions (`setCorsHeaders`, `setCorsPreflightHeaders`) from `src/routes/api.ts` to a shared utility module (e.g., `src/utils/cors.ts`) to enable reuse
- [x] 1.2 Update `src/routes/api.ts` to import and use the shared CORS utility functions
- [x] 1.3 Add OPTIONS handler for `/api/files/:id` endpoint in `src/routes/files.ts` to handle CORS preflight requests
- [x] 1.4 Modify GET `/api/files/:id` handler in `src/routes/files.ts` to:
  - [x] 1.4.1 Retrieve datastore information when accessed via API key
  - [x] 1.4.2 Set CORS headers using the shared utility function when origin matches allowed origins
  - [x] 1.4.3 Ensure CORS headers are set before returning the file response

## 2. Testing & Validation

- [ ] 2.1 Test CORS headers are set correctly for allowed origins when accessing files via API key
- [ ] 2.2 Test CORS headers are NOT set for disallowed origins
- [ ] 2.3 Test OPTIONS preflight requests return appropriate headers for files endpoint
- [ ] 2.4 Test files can be used as image sources in cross-origin contexts (e.g., `<img src="...">` from allowed origin)
- [ ] 2.5 Test CORS headers are NOT set for session-authenticated requests (only API key requests)
