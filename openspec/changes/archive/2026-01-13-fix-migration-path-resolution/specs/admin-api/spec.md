## ADDED Requirements

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
