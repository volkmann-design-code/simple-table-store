## 1. Environment Configuration
- [x] 1.1 Add `LOGO_URL` and `APP_TITLE` to `env.example` with descriptions
- [x] 1.2 Add environment variable reading logic in `src/routes/views.tsx` or a shared utility

## 2. Layout Component Updates
- [x] 2.1 Update `Layout.tsx` to accept and use `APP_TITLE` with fallback to "Datastore"
- [x] 2.2 Pass branding configuration from route handlers to Layout component

## 3. View Component Updates
- [x] 3.1 Update `LoginPage.tsx` to use `LOGO_URL` (fallback to current SVG icon) and `APP_TITLE`
- [x] 3.2 Update `DashboardPage.tsx` to use `LOGO_URL` and `APP_TITLE` in header
- [x] 3.3 Update `DatastorePage.tsx` to use `LOGO_URL` and `APP_TITLE` in header
- [x] 3.4 Update `OrgPage.tsx` to use `LOGO_URL` in header

## 4. Route Handler Updates
- [x] 4.1 Update `src/routes/views.tsx` to read branding env vars and pass to all view components

## 5. Validation
- [x] 5.1 Test with `LOGO_URL` set to a valid image URL
- [x] 5.2 Test with `APP_TITLE` set to a custom value
- [x] 5.3 Test fallback behavior when env vars are not set
- [x] 5.4 Verify all pages display branding consistently
