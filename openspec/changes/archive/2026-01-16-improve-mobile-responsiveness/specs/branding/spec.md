## MODIFIED Requirements
### Requirement: Branding Consistency
The system SHALL display the configured logo and title consistently across all view pages (login, dashboard, datastore detail, organization view). Additionally, all interactive elements (links and buttons) SHALL display a pointer cursor on hover to provide clear visual feedback that they are clickable. The UI SHALL be responsive and usable on mobile devices with screen widths as narrow as 320px.

#### Scenario: Consistent branding across pages
- **GIVEN** `LOGO_URL` and `APP_TITLE` are configured
- **WHEN** a user navigates between login, dashboard, datastore, and organization pages
- **THEN** the same logo and title are displayed on all pages

#### Scenario: Pointer cursor on interactive elements
- **GIVEN** a user is viewing any page in the application
- **WHEN** the user hovers over any link (`<a>`) or button (`<button>`) element
- **THEN** the cursor changes to a pointer to indicate the element is clickable

#### Scenario: Responsive navbar on mobile
- **GIVEN** a user is viewing any authenticated page on a mobile device (screen width < 768px)
- **WHEN** the page loads
- **THEN** the navbar displays a hamburger menu icon instead of inline navigation items
- **AND** tapping the hamburger icon reveals a dropdown menu with all navigation options

#### Scenario: Mobile menu contains all navigation options
- **GIVEN** a user is on a mobile device viewing the datastore page
- **WHEN** the user opens the mobile menu
- **THEN** the menu contains: settings link, organization link, user email display, and sign out button
- **AND** all menu items are tappable with adequate touch target size (minimum 44x44px)

## ADDED Requirements
### Requirement: Responsive Record Metadata Display
The record metadata row (created-by, created-at, updated-by, updated-at) SHALL adapt its layout for mobile devices to remain legible.

#### Scenario: Metadata stacks vertically on mobile
- **GIVEN** a user is viewing the datastore records table on a mobile device
- **WHEN** the metadata row is displayed
- **THEN** the created and updated information stack vertically instead of inline
- **AND** each piece of information is on its own line for readability

#### Scenario: Metadata remains inline on desktop
- **GIVEN** a user is viewing the datastore records table on a desktop device (screen width >= 768px)
- **WHEN** the metadata row is displayed
- **THEN** the created and updated information display inline as before
