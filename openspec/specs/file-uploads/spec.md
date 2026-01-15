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

The UI SHALL provide components to upload files for `file` columns during record creation and editing. Files SHALL be uploaded via the dedicated file endpoint, and the form SHALL submit JSON with file references.

#### Scenario: User uploads file in record modal

- **GIVEN** a datastore has a `file` column
- **WHEN** a user opens the record create/edit modal
- **THEN** a file input is presented for that column
- **AND** selecting a file stages it for upload on form submission

#### Scenario: Form submits JSON with file references

- **GIVEN** a user has selected files in file inputs
- **WHEN** the form is submitted
- **THEN** files are uploaded via `/api/datastores/:slug/files`
- **AND** the form data is submitted as JSON to the record endpoint
- **AND** file columns contain the returned file reference objects

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

### Requirement: Upload progress feedback

The UI SHALL provide visual feedback during file uploads, showing progress for each file being uploaded. Progress SHALL update incrementally during the upload rather than jumping from 0% to 100%.

#### Scenario: Progress indicator for large file

- **GIVEN** a user selects a large file (e.g., > 1MB) in a file input
- **WHEN** the form is submitted and files are uploading
- **THEN** a progress indicator shows upload percentage for each file
- **AND** the progress updates incrementally as data is transmitted
- **AND** the submit button is disabled until uploads complete

#### Scenario: Multiple file uploads in parallel

- **GIVEN** a record form has multiple file columns with selected files
- **WHEN** the form is submitted
- **THEN** all files are uploaded in parallel
- **AND** each file has its own progress indicator

#### Scenario: Progress visible for slow connections

- **GIVEN** a user is on a slow network connection
- **WHEN** uploading a file
- **THEN** the progress indicator reflects actual data transmission progress
- **AND** the user can see intermediate percentages (not just 0% and 100%)

### Requirement: File upload before record submission

The UI SHALL upload files to the file endpoint before submitting the record, ensuring record data contains only file references.

#### Scenario: Sequential upload then record creation

- **GIVEN** a user fills out a record form with file inputs
- **WHEN** the user clicks Save
- **THEN** files are uploaded first to `/api/datastores/:slug/files`
- **AND** the record is submitted as JSON with file references after uploads complete

#### Scenario: Upload failure prevents record submission

- **GIVEN** a user submits a form with a file
- **WHEN** the file upload fails (e.g., network error, validation error)
- **THEN** the record submission is aborted
- **AND** an error message is displayed to the user

### Requirement: File Type Presets

The system SHALL support file type preset categories in column definitions as a convenience alternative to explicit MIME types.

#### Scenario: Configure file column with image preset

- **GIVEN** an admin configures a file column with `acceptPreset: "images"`
- **WHEN** a user opens the record form
- **THEN** the file input only accepts image files (image/*)
- **AND** the backend validates uploaded files match the preset

#### Scenario: Configure file column with video preset

- **GIVEN** an admin configures a file column with `acceptPreset: "videos"`
- **WHEN** a user uploads a file
- **THEN** video files (video/*) are accepted
- **AND** non-video files are rejected with a validation error

#### Scenario: Configure file column with documents preset

- **GIVEN** an admin configures a file column with `acceptPreset: "documents"`
- **WHEN** a user uploads a file
- **THEN** PDF, Word documents, and text files are accepted

#### Scenario: Explicit content types override preset

- **GIVEN** a file column has both `acceptPreset` and `allowedContentTypes`
- **WHEN** validation is performed
- **THEN** `allowedContentTypes` takes precedence over the preset

### Requirement: Inline Image Thumbnail Preview
The UI SHALL display a small inline thumbnail preview for file columns containing images when shown in the records table.

#### Scenario: Image thumbnail in table cell
- **GIVEN** a record has a file column with an image (content_type starts with "image/")
- **WHEN** the record is displayed in the table
- **THEN** a small thumbnail of the image is shown in the cell
- **AND** the thumbnail is clickable to open a larger preview

#### Scenario: Non-image file shows link only
- **GIVEN** a record has a file column with a non-image file (e.g., PDF)
- **WHEN** the record is displayed in the table
- **THEN** the file is shown as a text link (filename) without thumbnail

### Requirement: Inline Video Thumbnail Preview
The UI SHALL display a small inline thumbnail preview for file columns containing videos when shown in the records table.

#### Scenario: Video thumbnail in table cell
- **GIVEN** a record has a file column with a video (content_type starts with "video/")
- **WHEN** the record is displayed in the table
- **THEN** a small thumbnail preview is shown (using video poster or first frame)
- **AND** a play icon overlay indicates it's a video
- **AND** the thumbnail is clickable to open a video player modal

### Requirement: Media Preview Modal
The UI SHALL provide a modal for viewing images and videos at a larger size when thumbnails are clicked.

#### Scenario: Open image in modal
- **GIVEN** a record has an image file displayed as a thumbnail
- **WHEN** the user clicks the thumbnail
- **THEN** a modal opens displaying the image at a larger size
- **AND** the modal can be closed by clicking outside, pressing Escape, or clicking a close button

#### Scenario: Open video in modal
- **GIVEN** a record has a video file displayed as a thumbnail
- **WHEN** the user clicks the thumbnail
- **THEN** a modal opens with a video player
- **AND** the video can be played/paused within the modal
- **AND** the modal can be closed by clicking outside, pressing Escape, or clicking a close button

#### Scenario: Modal shows filename
- **GIVEN** a media preview modal is open
- **WHEN** the modal is displayed
- **THEN** the original filename is shown in the modal header

