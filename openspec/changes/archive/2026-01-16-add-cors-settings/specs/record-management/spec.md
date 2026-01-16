## MODIFIED Requirements

### Requirement: Datastore Cache Settings Configuration

The UI SHALL provide a settings modal accessible from the datastore page header area that allows users to configure the cache duration for API responses and CORS allowed origins.

#### Scenario: Open settings modal

- **GIVEN** a user is viewing a datastore page
- **WHEN** the user clicks the settings button in the header area
- **THEN** a modal opens displaying the cache duration setting
- **AND** the modal shows the current cache duration value (or empty if not set)
- **AND** the modal includes a description explaining what the cache duration does
- **AND** the modal displays the CORS allowed origins setting
- **AND** the modal shows the current CORS origins (or empty if not set)
- **AND** the modal includes a description explaining what CORS origins do

#### Scenario: Update cache duration

- **GIVEN** the settings modal is open
- **WHEN** the user enters a cache duration value in seconds and clicks Save
- **THEN** the cache duration is updated for the datastore
- **AND** the modal closes
- **AND** the setting is persisted to the database

#### Scenario: Update CORS origins

- **GIVEN** the settings modal is open
- **WHEN** the user enters one or more CORS origins (one per line or comma-separated) and clicks Save
- **THEN** the CORS origins are updated for the datastore
- **AND** the modal closes
- **AND** the setting is persisted to the database
- **AND** invalid origin formats are rejected with an error message

#### Scenario: Clear CORS origins

- **GIVEN** the settings modal is open
- **AND** the datastore has CORS origins configured
- **WHEN** the user clears the CORS origins field and clicks Save
- **THEN** the CORS origins are set to NULL (empty)
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

#### Scenario: CORS origins validation

- **GIVEN** the settings modal is open
- **WHEN** the user enters an invalid origin format (e.g., not a valid URL)
- **THEN** validation prevents saving
- **AND** an appropriate error message is displayed

### Requirement: Datastore Cache Settings API

The system SHALL provide an API endpoint for authenticated users to update the cache duration setting and CORS origins for datastores in their organization.

#### Scenario: Update cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: 3600 }`
- **THEN** the datastore's cache_duration_seconds is updated
- **AND** the updated datastore is returned

#### Scenario: Update CORS origins via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ allowed_cors_origins: "https://example.com,https://app.example.com" }`
- **THEN** the datastore's allowed_cors_origins is updated
- **AND** the updated datastore is returned

#### Scenario: Clear cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: null }`
- **THEN** the datastore's cache_duration_seconds is set to NULL
- **AND** the updated datastore is returned

#### Scenario: Clear CORS origins via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ allowed_cors_origins: null }` or `{ allowed_cors_origins: "" }`
- **THEN** the datastore's allowed_cors_origins is set to NULL
- **AND** the updated datastore is returned

#### Scenario: Unauthorized datastore update

- **GIVEN** a user is authenticated in org A
- **WHEN** PATCH `/api/datastores/:slug` for a datastore in org B
- **THEN** HTTP 404 Not Found is returned

#### Scenario: Invalid CORS origins format via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ allowed_cors_origins: "not-a-valid-url" }`
- **THEN** HTTP 400 Bad Request is returned
- **AND** an error message indicates invalid origin format
