# Change: Add Local S3-Compatible Storage for Development

## Why
Currently, local development requires configuring external S3-compatible storage (Hetzner, AWS S3, etc.) to test file upload functionality. This adds friction to the development workflow and requires external dependencies. A local S3-compatible storage solution (MinIO) should be provided via docker-compose to enable complete local development without external services.

## What Changes
- Add MinIO service to `docker-compose.yml` for local S3-compatible storage
- Configure MinIO with default credentials and persistent volume
- Update `env.example` with local MinIO configuration values
- Ensure MinIO bucket is automatically created or documented for manual creation
- Expose MinIO console port for bucket management during development

## Impact
- Affected specs: `file-uploads` (modified - adds local development capability)
- Affected code:
  - `docker-compose.yml` - Add MinIO service
  - `env.example` - Add local MinIO configuration
- New dependencies: MinIO Docker image (development only)
- Breaking changes: None (existing S3 configuration remains valid)
