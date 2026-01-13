## MODIFIED Requirements

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

## ADDED Requirements

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
