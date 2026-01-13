## ADDED Requirements

### Requirement: Upload progress feedback

The UI SHALL provide visual feedback during file uploads, showing progress for each file being uploaded.

#### Scenario: Progress indicator for large file

- **GIVEN** a user selects a large file (e.g., > 1MB) in a file input
- **WHEN** the form is submitted and files are uploading
- **THEN** a progress indicator shows upload percentage for each file
- **AND** the submit button is disabled until uploads complete

#### Scenario: Multiple file uploads in parallel

- **GIVEN** a record form has multiple file columns with selected files
- **WHEN** the form is submitted
- **THEN** all files are uploaded in parallel
- **AND** each file has its own progress indicator

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

## MODIFIED Requirements

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
