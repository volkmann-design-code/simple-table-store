## MODIFIED Requirements

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
- **THEN** the datastore's allowed_cors_origins is updated and persisted to the database
- **AND** the updated datastore is returned with the new allowed_cors_origins value
- **AND** when the datastore is fetched again via GET `/api/datastores/:slug`, the allowed_cors_origins value matches what was set

#### Scenario: Clear cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: null }`
- **THEN** the datastore's cache_duration_seconds is set to NULL
- **AND** the updated datastore is returned

#### Scenario: Clear CORS origins via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ allowed_cors_origins: null }` or `{ allowed_cors_origins: "" }`
- **THEN** the datastore's allowed_cors_origins is set to NULL and persisted to the database
- **AND** the updated datastore is returned with allowed_cors_origins as null
- **AND** when the datastore is fetched again via GET `/api/datastores/:slug`, the allowed_cors_origins value is null

#### Scenario: Unauthorized datastore update

- **GIVEN** a user is authenticated in org A
- **WHEN** PATCH `/api/datastores/:slug` for a datastore in org B
- **THEN** HTTP 404 Not Found is returned

#### Scenario: Invalid CORS origins format via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ allowed_cors_origins: "not-a-valid-url" }`
- **THEN** HTTP 400 Bad Request is returned
- **AND** an error message indicates invalid origin format
