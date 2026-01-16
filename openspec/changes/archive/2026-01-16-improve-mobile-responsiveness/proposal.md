# Change: Improve Mobile Responsiveness

## Why
The application looks good on desktop but has usability issues on mobile devices. The navbar overflows on small screens, the title doesn't fit, and the record metadata (created/updated info) is cramped and illegible in the table view.

## What Changes
- Extract shared components to reduce duplication:
  - `Navbar` component with mobile menu support
  - `Logo` component (handles custom logo URL vs default icon)
  - `Icons` module for shared SVG icons (DefaultLogoIcon, SortAscIcon, SortDescIcon)
- Add a collapsible mobile menu to the navbar (hamburger menu pattern)
- Restructure the record metadata row to stack vertically on mobile
- Improve header layout to truncate/hide elements appropriately on small screens

## Impact
- Affected specs: branding (adds responsive layout requirements)
- Affected code:
  - New: `src/views/components/Navbar.tsx`, `src/views/components/Logo.tsx`, `src/views/components/Icons.tsx`
  - Modified: `src/views/DatastorePage.tsx`, `src/views/DashboardPage.tsx`, `src/views/OrgPage.tsx`, `src/views/LoginPage.tsx`
