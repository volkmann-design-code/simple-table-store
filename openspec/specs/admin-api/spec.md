# admin-api Specification

## Purpose
TBD - created by archiving change add-datastore-app. Update Purpose after archive.
## Requirements
### Requirement: Admin Token Authentication

The admin API SHALL require a valid ADMIN_TOKEN header for all requests. The token MUST be configured via the `ADMIN_TOKEN` environment variable.

#### Scenario: Valid admin token

- **GIVEN** the `ADMIN_TOKEN` env var is set to `secret123`
- **WHEN** a request is made to `/admin/*` with header `Authorization: Bearer secret123`
- **THEN** the request is processed

#### Scenario: Invalid admin token

- **WHEN** a request is made to `/admin/*` with an invalid or missing Authorization header
- **THEN** the system returns HTTP 401 Unauthorized

### Requirement: User Management

The system SHALL provide CRUD operations for users via the admin API.

#### Scenario: Create user

- **WHEN** POST `/admin/users` with `{ email, password, org_id }`
- **THEN** a new user is created with hashed password
- **AND** the user record is returned (without password_hash)

#### Scenario: List users

- **WHEN** GET `/admin/users`
- **THEN** all users are returned with pagination support

#### Scenario: Get user by ID

- **WHEN** GET `/admin/users/:id`
- **THEN** the user record is returned

#### Scenario: Update user

- **WHEN** PATCH `/admin/users/:id` with update fields
- **THEN** the user record is updated
- **AND** password is re-hashed if provided

#### Scenario: Delete user

- **WHEN** DELETE `/admin/users/:id`
- **THEN** the user is deleted

### Requirement: Organization Management

The system SHALL provide CRUD operations for organizations via the admin API.

#### Scenario: Create organization

- **WHEN** POST `/admin/orgs` with `{ name }`
- **THEN** a new organization is created and returned

#### Scenario: List organizations

- **WHEN** GET `/admin/orgs`
- **THEN** all organizations are returned with pagination support

#### Scenario: Get organization by ID

- **WHEN** GET `/admin/orgs/:id`
- **THEN** the organization record is returned

#### Scenario: Update organization

- **WHEN** PATCH `/admin/orgs/:id` with update fields
- **THEN** the organization record is updated

#### Scenario: Delete organization

- **WHEN** DELETE `/admin/orgs/:id`
- **THEN** the organization and all associated data are deleted

### Requirement: DataStore Management

The system SHALL provide CRUD operations for DataStores via the admin API.

#### Scenario: Create datastore

- **WHEN** POST `/admin/datastores` with `{ org_id, name, slug, description, column_definitions }`
- **THEN** a new datastore is created with the specified column schema

#### Scenario: List datastores

- **WHEN** GET `/admin/datastores`
- **THEN** all datastores are returned with pagination support

#### Scenario: Get datastore by ID

- **WHEN** GET `/admin/datastores/:id`
- **THEN** the datastore record with column_definitions is returned

#### Scenario: Update datastore

- **WHEN** PATCH `/admin/datastores/:id` with update fields
- **THEN** the datastore record is updated (including column_definitions)

#### Scenario: Delete datastore

- **WHEN** DELETE `/admin/datastores/:id`
- **THEN** the datastore and all its records are deleted

### Requirement: API Key Management

The system SHALL provide CRUD operations for API keys via the admin API.

#### Scenario: Create API key

- **WHEN** POST `/admin/api-keys` with `{ datastore_id, name, expires_at? }`
- **THEN** a new API key is generated
- **AND** the plaintext key is returned (only shown once)
- **AND** the hashed key is stored in the database

#### Scenario: List API keys

- **WHEN** GET `/admin/api-keys?datastore_id=:id`
- **THEN** all API keys for the datastore are returned (without key values)

#### Scenario: Delete API key

- **WHEN** DELETE `/admin/api-keys/:id`
- **THEN** the API key is revoked and deleted

### Requirement: Database Migration Management

The system SHALL provide endpoints for managing database migrations via the admin API. Migration files SHALL be resolved relative to the project root using `process.cwd()` to ensure consistent behavior across development and production environments.

#### Scenario: Execute migrations via admin API

- **WHEN** POST `/admin/migrate` is called with valid admin token
- **THEN** all pending migrations are applied to the database
- **AND** the response includes lists of applied and skipped migrations

#### Scenario: Get migration status via admin API

- **WHEN** GET `/admin/migrate/status` is called with valid admin token
- **THEN** the response includes status of all migration files
- **AND** migrations are resolved correctly in both development and containerized environments

#### Scenario: Migration path resolution in container

- **GIVEN** the application is running in a containerized environment
- **WHEN** migration endpoints are called
- **THEN** migration files are resolved from `src/db/migrations` relative to the container working directory
- **AND** migrations execute successfully

#### Scenario: Migration path resolution in development

- **GIVEN** the application is running in development mode
- **WHEN** migration endpoints are called
- **THEN** migration files are resolved from `src/db/migrations` relative to the project root
- **AND** migrations execute successfully

