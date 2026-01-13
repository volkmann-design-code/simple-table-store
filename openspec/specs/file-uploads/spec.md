# file-uploads Specification

## Purpose
TBD - created by archiving change add-datastore-file-uploads. Update Purpose after archive.
## Requirements
### Requirement: File storage backend

The system SHALL store uploaded file bytes in an S3-compatible object storage and SHALL NOT store file bytes in PostgreSQL.

#### Scenario: Upload stores bytes outside Postgres
- **WHEN** a user uploads a file to the datastore-app
- **THEN** the file bytes are stored in S3-compatible object storage
- **AND** PostgreSQL stores only a reference (metadata + object key)

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

### Requirement: File references in records

The system SHALL maintain a database reference to uploaded files and SHALL store only that reference in record `data` for `file` columns.

#### Scenario: Record contains file reference object
- **GIVEN** a datastore has a `file` column
- **WHEN** a record is created or updated with a file value
- **THEN** the stored record data contains a file reference object (not raw bytes)

### Requirement: File column type with validation options

The system SHALL support a `file` column type with validation options for file size and file type.

#### Scenario: Reject oversized file
- **GIVEN** a `file` column defines a maximum file size
- **WHEN** a user attempts to upload a larger file for that column
- **THEN** the request is rejected with a validation error

#### Scenario: Reject disallowed content type
- **GIVEN** a `file` column defines allowed content types
- **WHEN** a user attempts to upload a file whose content type is not allowed
- **THEN** the request is rejected with a validation error

### Requirement: First-party download URLs only

When returning records via the records API, the system SHALL NOT return internal object storage URLs and SHALL return only a first-party API URL for accessing files.

#### Scenario: Records API returns first-party URL
- **GIVEN** a record contains a file value
- **WHEN** GET `/api/datastores/:slug/records` is called
- **THEN** the file value includes a first-party URL served by the datastore-app
- **AND** no internal S3 URL is included in the response

### Requirement: In-memory caching for file reads

When serving file downloads from object storage, the system SHALL cache file contents in memory for up to 24 hours and SHALL enforce a configurable in-memory size limit.

#### Scenario: Cached download serves without object storage call
- **GIVEN** a file was downloaded recently and is still within cache TTL
- **WHEN** the same file is requested again
- **THEN** the application serves the file from in-memory cache

#### Scenario: Cache enforces memory limit
- **GIVEN** the cache is at its configured max memory limit
- **WHEN** additional files are downloaded
- **THEN** the cache evicts entries according to its eviction policy

### Requirement: UI support for file uploads

The UI SHALL provide components to upload files for `file` columns during record creation and editing.

#### Scenario: User uploads file in record modal
- **GIVEN** a datastore has a `file` column
- **WHEN** a user opens the record create/edit modal
- **THEN** a file input is presented for that column
- **AND** the uploaded file is associated with the record on save

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

