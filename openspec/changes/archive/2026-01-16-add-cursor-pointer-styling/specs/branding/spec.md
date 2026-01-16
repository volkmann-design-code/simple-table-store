## MODIFIED Requirements
### Requirement: Branding Consistency
The system SHALL display the configured logo and title consistently across all view pages (login, dashboard, datastore detail, organization view). Additionally, all interactive elements (links and buttons) SHALL display a pointer cursor on hover to provide clear visual feedback that they are clickable.

#### Scenario: Consistent branding across pages
- **GIVEN** `LOGO_URL` and `APP_TITLE` are configured
- **WHEN** a user navigates between login, dashboard, datastore, and organization pages
- **THEN** the same logo and title are displayed on all pages

#### Scenario: Pointer cursor on interactive elements
- **GIVEN** a user is viewing any page in the application
- **WHEN** the user hovers over any link (`<a>`) or button (`<button>`) element
- **THEN** the cursor changes to a pointer to indicate the element is clickable
