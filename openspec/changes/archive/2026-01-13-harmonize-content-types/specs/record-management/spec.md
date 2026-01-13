## MODIFIED Requirements

### Requirement: Record Creation

Authenticated users SHALL create records in datastores within their organization. Record data SHALL be submitted as JSON. File column values SHALL contain file references (objects with `file_id`) obtained by uploading files separately.

#### Scenario: Create valid record

- **GIVEN** a user is authenticated
- **WHEN** POST `/api/datastores/:slug/records` with valid `{ data }` as JSON
- **THEN** the record is created and returned with ID and timestamps

#### Scenario: Create record with file reference

- **GIVEN** a datastore has a `file` column
- **AND** a file has been uploaded via `/api/datastores/:slug/files` returning a file reference
- **WHEN** POST `/api/datastores/:slug/records` with `{ data: { file_column: { file_id: "..." } } }`
- **THEN** the record is created with the file reference stored in the data

#### Scenario: Validation against column definitions

- **GIVEN** a datastore has column_definitions with required fields
- **WHEN** POST `/api/datastores/:slug/records` with missing required fields
- **THEN** HTTP 400 Bad Request is returned with validation errors

#### Scenario: Type validation

- **GIVEN** a datastore has a column with type `number`
- **WHEN** POST `/api/datastores/:slug/records` with a string value for that column
- **THEN** HTTP 400 Bad Request is returned with type error

#### Scenario: Reject multipart content-type

- **WHEN** POST `/api/datastores/:slug/records` with `Content-Type: multipart/form-data`
- **THEN** HTTP 415 Unsupported Media Type is returned

### Requirement: Record Update

Authenticated users SHALL update records in datastores within their organization. Record data SHALL be submitted as JSON.

#### Scenario: Update record

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug/records/:id` with `{ data }` as JSON
- **THEN** the record data is merged with existing data
- **AND** updated_at is set to current timestamp

#### Scenario: Update file column with new reference

- **GIVEN** a record has an existing file in a `file` column
- **AND** a new file has been uploaded via `/api/datastores/:slug/files`
- **WHEN** PATCH `/api/datastores/:slug/records/:id` with new file reference
- **THEN** the file reference is updated
- **AND** the old file remains in storage (cleanup is separate concern)

#### Scenario: Partial update

- **WHEN** PATCH with only some fields
- **THEN** only provided fields are updated
- **AND** other fields remain unchanged

#### Scenario: Update nonexistent record

- **WHEN** PATCH `/api/datastores/:slug/records/:id` for nonexistent ID
- **THEN** HTTP 404 Not Found is returned
