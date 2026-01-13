# record-management Specification

## Purpose
TBD - created by archiving change add-datastore-app. Update Purpose after archive.
## Requirements
### Requirement: DataStore Listing for Users

Authenticated users SHALL see all DataStores within their organization.

#### Scenario: List organization datastores

- **GIVEN** a user is authenticated and belongs to org A
- **WHEN** GET `/api/datastores`
- **THEN** all datastores belonging to org A are returned

#### Scenario: No cross-org access

- **GIVEN** a user is authenticated and belongs to org A
- **WHEN** GET `/api/datastores`
- **THEN** datastores from org B are NOT returned

### Requirement: Record Listing

Authenticated users SHALL list records from datastores in their organization.

#### Scenario: List records

- **GIVEN** a user is authenticated
- **WHEN** GET `/api/datastores/:slug/records`
- **THEN** records for that datastore are returned with pagination

#### Scenario: Paginated records

- **WHEN** GET `/api/datastores/:slug/records?page=2&limit=25`
- **THEN** the second page of 25 records is returned
- **AND** total count and pagination metadata are included

#### Scenario: Unauthorized datastore access

- **GIVEN** a user is authenticated in org A
- **WHEN** GET `/api/datastores/:slug/records` for a datastore in org B
- **THEN** HTTP 404 Not Found is returned

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

### Requirement: Record Deletion

Authenticated users SHALL delete records from datastores within their organization.

#### Scenario: Delete record

- **GIVEN** a user is authenticated
- **WHEN** DELETE `/api/datastores/:slug/records/:id`
- **THEN** the record is deleted
- **AND** HTTP 204 No Content is returned

#### Scenario: Delete nonexistent record

- **WHEN** DELETE `/api/datastores/:slug/records/:id` for nonexistent ID
- **THEN** HTTP 404 Not Found is returned

### Requirement: Row-Level Security for Records

All record operations SHALL be enforced via PostgreSQL row-level security policies.

#### Scenario: RLS user context

- **WHEN** a user makes an API request
- **THEN** `app.current_user_id` and `app.current_org_id` are set via `SET LOCAL`
- **AND** RLS policies restrict access to org's datastores only

#### Scenario: RLS prevents cross-org access

- **GIVEN** RLS policies are enabled
- **WHEN** a user attempts to access records outside their org via SQL injection or API manipulation
- **THEN** the database returns zero rows (not an error)

### Requirement: Form Reset After Record Creation

The UI SHALL reset the record creation form to its initial empty state after successful submission, ensuring no stale data persists when the modal is reopened.

#### Scenario: Form is empty after successful creation

- **GIVEN** a user has created a record via the modal form
- **WHEN** the user opens the create record modal again
- **THEN** all form fields are empty
- **AND** no file previews or progress indicators are visible

#### Scenario: Form is empty after successful creation without page reload

- **GIVEN** the application updates the record list without full page reload
- **WHEN** the user opens the create record modal after a successful creation
- **THEN** the form fields are empty
- **AND** the file input states are cleared

