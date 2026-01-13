# cicd Specification

## ADDED Requirements

### Requirement: Automated Docker Image Builds
The system SHALL automatically build Docker images on every commit to any branch.

#### Scenario: Build on main branch commit
- **WHEN** a commit is pushed to the main branch
- **THEN** a Docker image is built using the Dockerfile
- **AND** the image is tagged with the version from package.json
- **AND** the image is pushed to GitHub Container Registry (ghcr.io)

#### Scenario: Build on PR or feature branch
- **WHEN** a commit is pushed to a PR or non-main branch
- **THEN** a Docker image is built using the Dockerfile
- **AND** the build process validates the Dockerfile is correct
- **AND** no image is pushed to any registry

### Requirement: Image Versioning
Docker images SHALL be tagged with the version specified in package.json.

#### Scenario: Image tagged with package.json version
- **WHEN** an image is built and pushed to the registry
- **THEN** the image is tagged as `ghcr.io/volkmann-design/simple-table-store:<version>`
- **WHERE** `<version>` matches the `version` field in package.json

### Requirement: GitHub Container Registry Integration
The system SHALL push built images to GitHub Container Registry for main branch commits.

#### Scenario: Image pushed to ghcr.io
- **WHEN** a commit is pushed to the main branch
- **AND** the Docker image build succeeds
- **THEN** the image is pushed to `ghcr.io/volkmann-design/simple-table-store`
- **AND** the image is accessible via the GitHub Container Registry
