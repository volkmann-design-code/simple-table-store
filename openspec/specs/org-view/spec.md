# org-view Specification

## Purpose
Provides users with read-only visibility into their organization's metadata and membership.
## Requirements
### Requirement: Organization View Access

The system SHALL provide a read-only view of organization information accessible to authenticated users who belong to an organization.

#### Scenario: Access organization view

- **GIVEN** a user is authenticated and has an `org_id` in their session
- **WHEN** GET `/org` is requested
- **THEN** the organization view page is displayed
- **AND** the page shows organization metadata (name, created_at, updated_at)

#### Scenario: Access denied without organization

- **GIVEN** a user is authenticated but does not have an `org_id` in their session
- **WHEN** GET `/org` is requested
- **THEN** HTTP 403 Forbidden or redirect to dashboard is returned
- **AND** the organization view is not displayed

#### Scenario: Unauthenticated access

- **GIVEN** a user is not authenticated
- **WHEN** GET `/org` is requested
- **THEN** the user is redirected to `/login`

### Requirement: Organization Metadata Display

The system SHALL display organization metadata in the organization view.

#### Scenario: Display organization details

- **GIVEN** a user accesses the organization view
- **WHEN** the page loads
- **THEN** the organization name is displayed
- **AND** the organization creation date is displayed
- **AND** the organization last updated date is displayed

### Requirement: Organization Members Display

The system SHALL display a table of all users who belong to the organization.

#### Scenario: Display member list

- **GIVEN** a user accesses the organization view
- **WHEN** the page loads
- **THEN** a table is displayed showing all users in the organization
- **AND** each member row shows user email and creation date
- **AND** the current user is included in the member list

### Requirement: Read-Only Notice

The system SHALL display a notice indicating that organization and user changes must be performed by an admin.

#### Scenario: Display admin notice

- **GIVEN** a user accesses the organization view
- **WHEN** the page loads
- **THEN** a notice is displayed indicating that changes to the organization or users must be performed by an admin
- **AND** the notice is clearly visible on the page

