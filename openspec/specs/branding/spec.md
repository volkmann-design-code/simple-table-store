# branding Specification

## Purpose
The branding capability allows organizations to customize the visual identity of the datastore application through environment variables, enabling white-label deployments.
## Requirements
### Requirement: Custom Logo Configuration
The system SHALL support a configurable logo URL via the `LOGO_URL` environment variable. If `LOGO_URL` is not provided, the system SHALL display the default database icon SVG.

#### Scenario: Custom logo configured
- **GIVEN** `LOGO_URL` environment variable is set to a valid image URL
- **WHEN** any view page is rendered
- **THEN** the custom logo image is displayed in place of the default database icon

#### Scenario: Logo fallback to default
- **GIVEN** `LOGO_URL` environment variable is not set or is empty
- **WHEN** any view page is rendered
- **THEN** the default database icon SVG is displayed

### Requirement: Custom Title Configuration
The system SHALL support a configurable application title via the `APP_TITLE` environment variable. If `APP_TITLE` is not provided, the system SHALL use "Datastore" as the default title.

#### Scenario: Custom title configured
- **GIVEN** `APP_TITLE` environment variable is set to "My Company Data"
- **WHEN** any view page is rendered
- **THEN** "My Company Data" is displayed in page titles and headers instead of "Datastore"

#### Scenario: Title fallback to default
- **GIVEN** `APP_TITLE` environment variable is not set or is empty
- **WHEN** any view page is rendered
- **THEN** "Datastore" is displayed in page titles and headers

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
