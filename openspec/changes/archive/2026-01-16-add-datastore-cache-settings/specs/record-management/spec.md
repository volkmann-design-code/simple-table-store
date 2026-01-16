## ADDED Requirements

### Requirement: Datastore Cache Settings Configuration

The UI SHALL provide a settings modal accessible from the datastore page header area that allows users to configure the cache duration for API responses.

#### Scenario: Open settings modal

- **GIVEN** a user is viewing a datastore page
- **WHEN** the user clicks the settings button in the header area
- **THEN** a modal opens displaying the cache duration setting
- **AND** the modal shows the current cache duration value (or empty if not set)
- **AND** the modal includes a description explaining what the cache duration does

#### Scenario: Update cache duration

- **GIVEN** the settings modal is open
- **WHEN** the user enters a cache duration value in seconds and clicks Save
- **THEN** the cache duration is updated for the datastore
- **AND** the modal closes
- **AND** the setting is persisted to the database

#### Scenario: Cancel settings changes

- **GIVEN** the settings modal is open
- **WHEN** the user clicks Cancel or clicks outside the modal
- **THEN** any unsaved changes are discarded
- **AND** the modal closes

#### Scenario: Cache duration validation

- **GIVEN** the settings modal is open
- **WHEN** the user enters a negative value or non-numeric value
- **THEN** validation prevents saving
- **AND** an appropriate error message is displayed

### Requirement: Datastore Cache Settings API

The system SHALL provide an API endpoint for authenticated users to update the cache duration setting for datastores in their organization.

#### Scenario: Update cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: 3600 }`
- **THEN** the datastore's cache_duration_seconds is updated
- **AND** the updated datastore is returned

#### Scenario: Clear cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: null }`
- **THEN** the datastore's cache_duration_seconds is set to NULL
- **AND** the updated datastore is returned

#### Scenario: Unauthorized datastore update

- **GIVEN** a user is authenticated in org A
- **WHEN** PATCH `/api/datastores/:slug` for a datastore in org B
- **THEN** HTTP 404 Not Found is returned

## MODIFIED Requirements

### Requirement: DataStore Listing for Users

Authenticated users SHALL see all DataStores within their organization.

#### Scenario: List organization datastores

- **GIVEN** a user is authenticated and belongs to org A
- **WHEN** GET `/api/datastores`
- **THEN** all datastores belonging to org A are returned
- **AND** each datastore includes the `cache_duration_seconds` field

#### Scenario: No cross-org access

- **GIVEN** a user is authenticated and belongs to org A
- **WHEN** GET `/api/datastores`
- **THEN** datastores from org B are NOT returned
