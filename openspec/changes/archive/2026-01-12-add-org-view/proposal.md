# Change: Add Organization View

## Why
Users need visibility into their organization's details and membership. Currently, users can see their datastores but have no way to view their organization's metadata or see who else is part of their organization. This view provides transparency while maintaining clear boundaries that only admins can make changes.

## What Changes
- Add a new read-only organization view accessible at `/org`
- Display organization metadata (name, created date, updated date)
- Display a table of all organization members (users)
- Enforce access control: users must belong to an organization to access the view
- Include a note indicating that changes must be made by an admin

## Impact
- Affected specs: New capability `org-view` added
- Affected code:
  - `apps/datastore-app/src/routes/views.tsx` - Add new route handler
  - `apps/datastore-app/src/views/OrgPage.tsx` - New view component
  - `apps/datastore-app/src/i18n/*.lang.ts` - Add i18n strings for org view
