## 1. Extract Shared Components
- [x] 1.1 Create `src/views/components/Icons.tsx` with DefaultLogoIcon, SortAscIcon, SortDescIcon
- [x] 1.2 Create `src/views/components/Logo.tsx` handling logoUrl prop vs default icon
- [x] 1.3 Create `src/views/components/Navbar.tsx` with shared navbar logic
- [x] 1.4 Navbar: support configurable props (breadcrumb, extra nav items, session, lang)
- [x] 1.5 Replace duplicated code in DatastorePage, DashboardPage, OrgPage, LoginPage

## 2. Navbar Mobile Menu
- [x] 2.1 Add hamburger menu button that shows on mobile (hidden on md+)
- [x] 2.2 Create mobile menu dropdown with navigation links and user info
- [x] 2.3 Hide desktop nav items on mobile, show in dropdown instead
- [x] 2.4 Add inline script to toggle mobile menu visibility

## 3. DatastorePage Improvements
- [x] 3.1 Update metadata row to stack vertically on mobile
- [x] 3.2 Improve table horizontal scrolling UX on mobile

## 4. Final Review
- [x] 4.1 Verify LoginPage is already responsive
- [x] 4.2 Test all pages at 320px, 375px, and 768px breakpoints
