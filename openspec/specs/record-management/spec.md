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
- **AND** each datastore includes the `cache_duration_seconds` field

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

### Requirement: Record Authorship Tracking
The system SHALL track which user created and last updated each record by storing user references in `created_by` and `updated_by` columns.

#### Scenario: Created-by set on record creation
- **GIVEN** a user is authenticated
- **WHEN** POST `/api/datastores/:slug/records` creates a new record
- **THEN** the record's `created_by` is set to the current user's ID
- **AND** `updated_by` is NULL

#### Scenario: Updated-by set on record update
- **GIVEN** a record exists
- **WHEN** PATCH `/api/datastores/:slug/records/:id` updates the record
- **THEN** the record's `updated_by` is set to the current user's ID
- **AND** `created_by` remains unchanged

#### Scenario: Historical records have null authorship
- **GIVEN** records exist from before authorship tracking was added
- **WHEN** the record is retrieved
- **THEN** `created_by` and `updated_by` MAY be NULL

### Requirement: Record Sorting via API
The records API SHALL support sorting by any data column or system field via query parameters.

#### Scenario: Sort by data column ascending
- **WHEN** GET `/api/datastores/:slug/records?sort=name&order=asc`
- **THEN** records are returned sorted by the `name` column in ascending order

#### Scenario: Sort by data column descending
- **WHEN** GET `/api/datastores/:slug/records?sort=price&order=desc`
- **THEN** records are returned sorted by the `price` column in descending order

#### Scenario: Sort by created_at
- **WHEN** GET `/api/datastores/:slug/records?sort=created_at&order=asc`
- **THEN** records are returned sorted by creation time in ascending order

#### Scenario: Sort by updated_at
- **WHEN** GET `/api/datastores/:slug/records?sort=updated_at&order=desc`
- **THEN** records are returned sorted by last update time in descending order

#### Scenario: Default sort when not specified
- **WHEN** GET `/api/datastores/:slug/records` without sort parameters
- **THEN** records are returned sorted by `created_at` descending (newest first)

#### Scenario: Invalid sort column rejected
- **WHEN** GET `/api/datastores/:slug/records?sort=nonexistent_column`
- **THEN** the request proceeds with default sorting (created_at DESC)
- **AND** the invalid sort parameter is ignored

#### Scenario: Sorting with pagination
- **WHEN** GET `/api/datastores/:slug/records?sort=name&order=asc&page=2&limit=25`
- **THEN** records are sorted by `name` ascending across the entire dataset
- **AND** the second page of 25 sorted records is returned
- **AND** pagination metadata reflects total count

### Requirement: Record Metadata Display
The UI SHALL display record metadata (created-by, created-at, updated-by, updated-at) in the records table in a visually subdued manner.

#### Scenario: Metadata row displayed for each record
- **GIVEN** a datastore has records
- **WHEN** a user views the datastore records table
- **THEN** each record row includes metadata showing created-by email and created-at timestamp
- **AND** if updated, shows updated-by email and updated-at timestamp
- **AND** metadata is styled with muted colors and smaller font than primary content

#### Scenario: Null authorship displayed gracefully
- **GIVEN** a record has NULL created_by (historical record)
- **WHEN** the record is displayed
- **THEN** the creator field shows a placeholder (e.g., "-" or "Unknown")

### Requirement: Sortable Table Headers
The UI SHALL allow users to sort records by clicking column headers, with visual indication of the current sort state.

#### Scenario: Click header to sort
- **GIVEN** a user is viewing a datastore records table
- **WHEN** the user clicks a column header
- **THEN** records are re-fetched sorted by that column in ascending order
- **AND** the URL is updated to include sort parameters

#### Scenario: Click again to reverse sort
- **GIVEN** records are sorted by a column in ascending order
- **WHEN** the user clicks the same column header again
- **THEN** records are re-fetched sorted by that column in descending order

#### Scenario: Sort indicator shown
- **GIVEN** records are sorted by a specific column
- **WHEN** the table is displayed
- **THEN** the active sort column header shows a direction indicator (arrow up/down)

#### Scenario: Sort preserved during pagination
- **GIVEN** records are sorted by a column
- **WHEN** the user clicks Next/Previous page
- **THEN** the sort parameters are preserved in the URL
- **AND** the new page shows records in the same sort order

### Requirement: Datastore Cache Settings Configuration

The UI SHALL provide a settings modal accessible from the datastore page header area that allows users to configure the cache duration for API responses.

#### Scenario: Open settings modal

- **GIVEN** a user is viewing a datastore page
- **WHEN** the user clicks the settings button in the header area
- **THEN** a modal opens displaying the cache duration setting
- **AND** the modal shows the current cache duration value (or empty if not set)
- **AND** the modal includes a description explaining what the cache duration does

#### Scenario: Update cache duration

- **GIVEN** the settings modal is open
- **WHEN** the user enters a cache duration value in seconds and clicks Save
- **THEN** the cache duration is updated for the datastore
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

### Requirement: Datastore Cache Settings API

The system SHALL provide an API endpoint for authenticated users to update the cache duration setting for datastores in their organization.

#### Scenario: Update cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: 3600 }`
- **THEN** the datastore's cache_duration_seconds is updated
- **AND** the updated datastore is returned

#### Scenario: Clear cache duration via API

- **GIVEN** a user is authenticated
- **WHEN** PATCH `/api/datastores/:slug` with `{ cache_duration_seconds: null }`
- **THEN** the datastore's cache_duration_seconds is set to NULL
- **AND** the updated datastore is returned

#### Scenario: Unauthorized datastore update

- **GIVEN** a user is authenticated in org A
- **WHEN** PATCH `/api/datastores/:slug` for a datastore in org B
- **THEN** HTTP 404 Not Found is returned

