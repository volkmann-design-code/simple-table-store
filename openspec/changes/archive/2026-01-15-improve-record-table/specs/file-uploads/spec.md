## ADDED Requirements

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
