# Change: Add Cursor Pointer Styling to Links and Buttons

## Why
All interactive elements (links and buttons) in the views should display a pointer cursor on hover to provide clear visual feedback that they are clickable. This improves user experience by making the interface more intuitive and consistent.

## What Changes
- All `<a>` (link) elements in view components SHALL have `cursor: pointer` styling
- All `<button>` elements in view components SHALL have `cursor: pointer` styling
- This applies to all view files: DashboardPage, DatastorePage, LoginPage, OrgPage, and Layout
- Styling shall be applied via Tailwind CSS classes (`cursor-pointer`)

## Impact
- Affected specs: `branding` (adds UX consistency requirement)
- Affected code:
  - `src/views/DashboardPage.tsx` - logo link, org link, sign out button, datastore card links
  - `src/views/DatastorePage.tsx` - logo link, org link, sign out button, back link, add record button, settings button, sort links, edit/delete buttons, pagination links, modal close buttons, file links, media preview buttons
  - `src/views/LoginPage.tsx` - login button
  - `src/views/OrgPage.tsx` - logo link, sign out button
  - `src/styles/input.css` - potentially add cursor-pointer to `.btn` class if not already present
