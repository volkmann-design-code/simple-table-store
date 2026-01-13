## 1. Frontend changes

- [x] 1.1 Add JavaScript function to upload files via `/api/datastores/:slug/files`
- [x] 1.2 Add upload progress UI (progress bar per file input)
- [x] 1.3 Refactor form submission to:
  - [x] 1.3.1 Intercept form submit with JavaScript
  - [x] 1.3.2 Upload all files first, collect file references
  - [x] 1.3.3 Submit JSON payload to record endpoint via fetch
  - [x] 1.3.4 Handle success (redirect) and error (display message)
- [x] 1.4 Update edit modal to handle existing file references correctly

## 2. View routes cleanup

- [x] 2.1 Remove `POST /datastores/:slug/records` handler (create)
- [x] 2.2 Remove `POST /datastores/:slug/records/:id` handler (update)
- [x] 2.3 Remove `POST /datastores/:slug/records/:id/delete` handler (delete)
- [x] 2.4 Keep only GET routes for serving HTML pages

## 3. Validation

- [x] 3.1 Test creating record with file via UI
- [x] 3.2 Test editing record with file via UI
- [x] 3.3 Test large file upload shows progress
- [x] 3.4 Verify API routes still work unchanged for programmatic access
