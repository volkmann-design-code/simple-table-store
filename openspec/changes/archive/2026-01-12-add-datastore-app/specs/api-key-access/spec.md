## ADDED Requirements

### Requirement: API Key Authentication

The system SHALL authenticate external requests using API keys for read-only datastore access.

#### Scenario: Valid API key access

- **WHEN** GET `/api/datastores/:slug/records` with header `X-API-Key: <valid-key>`
- **THEN** the request is authenticated for read-only access
- **AND** records are returned

#### Scenario: Invalid API key

- **WHEN** a request is made with an invalid X-API-Key header
- **THEN** HTTP 401 Unauthorized is returned

#### Scenario: Expired API key

- **GIVEN** an API key has passed its expires_at date
- **WHEN** a request is made with the expired key
- **THEN** HTTP 401 Unauthorized is returned

### Requirement: API Key Scope Restriction

API keys SHALL only grant access to their associated datastore.

#### Scenario: Scoped datastore access

- **GIVEN** an API key is created for datastore A
- **WHEN** GET `/api/datastores/a/records` with that API key
- **THEN** records for datastore A are returned

#### Scenario: Cross-datastore rejection

- **GIVEN** an API key is created for datastore A
- **WHEN** GET `/api/datastores/b/records` with that API key
- **THEN** HTTP 403 Forbidden is returned

### Requirement: API Key Read-Only Access

API keys SHALL provide read-only access; write operations SHALL be rejected.

#### Scenario: Read operations allowed

- **WHEN** GET `/api/datastores/:slug/records` with valid API key
- **THEN** the request succeeds

#### Scenario: Write operations rejected

- **WHEN** POST/PATCH/DELETE to `/api/datastores/:slug/records` with valid API key
- **THEN** HTTP 403 Forbidden is returned
- **AND** error message indicates API keys are read-only

### Requirement: Row-Level Security for API Keys

API key access SHALL be enforced via PostgreSQL row-level security policies.

#### Scenario: RLS API key context

- **WHEN** a request is made with a valid API key
- **THEN** `app.current_api_key_datastore_id` is set via `SET LOCAL`
- **AND** RLS policies restrict access to that datastore only

#### Scenario: RLS prevents scope escalation

- **GIVEN** RLS policies are enabled for API key access
- **WHEN** an API key holder attempts to access other datastores
- **THEN** the database returns zero rows
