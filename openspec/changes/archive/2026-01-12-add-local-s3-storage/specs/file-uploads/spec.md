## MODIFIED Requirements

### Requirement: Object storage configuration via environment variables
The system SHALL read object storage configuration and credentials from environment variables, including an access key and secret. For local development, the system SHALL support a local S3-compatible storage service (MinIO) provided via docker-compose.

#### Scenario: Startup with configured object storage
- **GIVEN** object storage env vars are configured
- **WHEN** the application starts
- **THEN** file upload and download endpoints are enabled

#### Scenario: Local development with MinIO
- **GIVEN** docker-compose is started with MinIO service
- **WHEN** the application is configured with local MinIO endpoint (http://localhost:9000) and credentials
- **THEN** file upload and download functionality works without external S3 services
- **AND** files are stored in the local MinIO instance

## ADDED Requirements

### Requirement: Local development storage setup
The system SHALL provide a local S3-compatible storage solution (MinIO) via docker-compose for local development and testing.

#### Scenario: MinIO service in docker-compose
- **GIVEN** docker-compose.yml is configured
- **WHEN** `docker-compose up` is executed
- **THEN** MinIO service starts alongside PostgreSQL
- **AND** MinIO API is accessible on port 9000
- **AND** MinIO console is accessible on port 9001

#### Scenario: Local storage configuration in env.example
- **GIVEN** env.example file exists
- **WHEN** a developer copies env.example to .env for local development
- **THEN** S3 configuration variables are pre-configured for local MinIO
- **AND** default bucket name and credentials are provided

#### Scenario: Persistent local storage
- **GIVEN** MinIO is running via docker-compose
- **WHEN** files are uploaded to local MinIO
- **AND** MinIO container is restarted
- **THEN** uploaded files persist in the MinIO data volume
