## Context
The datastore-app requires S3-compatible object storage for file uploads. Currently, developers must configure external S3 services (Hetzner, AWS S3, etc.) to test file functionality locally. This creates friction and external dependencies. MinIO is a popular, lightweight S3-compatible object storage server that can run locally in Docker, providing a complete local development environment.

## Goals / Non-Goals
- Goals:
  - Provide local S3-compatible storage via docker-compose
  - Use MinIO as the S3-compatible storage solution
  - Configure default credentials suitable for local development
  - Persist MinIO data in a Docker volume
  - Expose MinIO console for bucket management
  - Update env.example with local configuration values
- Non-Goals:
  - Production-ready MinIO configuration (this is for local dev only)
  - Automatic bucket creation (can be done via console or documented)
  - MinIO clustering or high availability
  - Integration with existing Kubernetes manifests (this is docker-compose only)

## Decisions
- Decision: Use MinIO as the S3-compatible storage solution
  - Rationale: MinIO is the most popular open-source S3-compatible storage, well-maintained, lightweight, and perfect for local development. It's fully S3-compatible and requires no code changes.
- Decision: Use default MinIO credentials (minioadmin/minioadmin)
  - Rationale: Standard MinIO defaults are sufficient for local development. Developers can change these if needed, but defaults simplify setup.
- Decision: Expose MinIO API on port 9000 and console on port 9001
  - Rationale: Standard MinIO ports. API port is for S3 operations, console port provides web UI for bucket management.
- Decision: Use persistent Docker volume for MinIO data
  - Rationale: Ensures uploaded files persist across container restarts, matching the behavior of the postgres volume.
- Decision: Use default bucket name "datastore" in env.example
  - Rationale: Matches the database name pattern and is simple. Bucket can be created via MinIO console or documented.

## Alternatives Considered
- Alternative: Use LocalStack (AWS service emulator)
  - Rejected: Overkill for this use case, heavier resource usage, MinIO is simpler and more focused
- Alternative: Use file system storage instead of S3 for local dev
  - Rejected: Would require code changes and different code paths, defeating the purpose of testing S3 integration
- Alternative: Use MinIO in server mode with custom configuration
  - Rejected: Default configuration is sufficient for local development, adds unnecessary complexity

## Risks / Trade-offs
- Risk: MinIO credentials are default and not secure
  - Mitigation: This is explicitly for local development only. Production uses external S3 services with proper credentials.
- Risk: Bucket must be created manually
  - Mitigation: Document bucket creation in README or provide initialization script. MinIO console makes this trivial.
- Trade-off: Additional Docker container resource usage
  - Acceptable: MinIO is lightweight, and this enables complete local development without external dependencies

## Implementation Details
- **MinIO Service Configuration**:
  - Image: `minio/minio:latest` (or specific version)
  - Command: `server /data --console-address ":9001"`
  - Environment: `MINIO_ROOT_USER=minioadmin`, `MINIO_ROOT_PASSWORD=minioadmin`
  - Ports: `9000:9000` (API), `9001:9001` (Console)
  - Volume: `minio_data:/data`
  - Healthcheck: MinIO health endpoint
- **Environment Variables for env.example**:
  - `S3_ENDPOINT=http://localhost:9000`
  - `S3_REGION=us-east-1` (MinIO doesn't require region, but keeps config consistent)
  - `S3_BUCKET=datastore`
  - `S3_ACCESS_KEY_ID=minioadmin`
  - `S3_SECRET_ACCESS_KEY=minioadmin`
- **Bucket Creation**:
  - Option 1: Document manual creation via MinIO console (http://localhost:9001)
  - Option 2: Use MinIO client (mc) in init container or script
  - Option 3: Use MinIO's auto-create bucket feature if available

## Migration Plan
1. Add MinIO service to docker-compose.yml (no breaking changes)
2. Update env.example with local MinIO values (existing values remain as comments)
3. Test file upload/download with local MinIO
4. Update README with MinIO setup instructions
5. Document bucket creation process
