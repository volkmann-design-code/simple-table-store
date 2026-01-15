## ADDED Requirements

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
