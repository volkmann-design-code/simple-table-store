# Change: Add Branding Options

## Why
Organizations deploying the datastore app need the ability to customize the application's visual identity (logo and title) to match their branding. Currently, the logo and title are hardcoded, making it impossible to white-label the application.

## What Changes
- Add `LOGO_URL` environment variable to configure a custom logo image URL
- Add `APP_TITLE` environment variable to configure a custom application title
- Update all view components to use the configured branding values with fallbacks to current defaults
- Update `env.example` to document the new environment variables

## Impact
- Affected specs: New capability `branding`
- Affected code:
  - `src/views/Layout.tsx` (title configuration)
  - `src/views/LoginPage.tsx` (logo and title)
  - `src/views/DashboardPage.tsx` (logo and title)
  - `src/views/DatastorePage.tsx` (logo and title)
  - `src/views/OrgPage.tsx` (logo)
  - `env.example` (documentation)
  - `src/routes/views.tsx` (passing branding config to views)
