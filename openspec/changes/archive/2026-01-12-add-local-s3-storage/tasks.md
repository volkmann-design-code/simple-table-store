## 1. Docker Compose Setup
- [x] 1.1 Add MinIO service to `docker-compose.yml` with image `minio/minio:latest`
- [x] 1.2 Configure MinIO with default credentials (MINIO_ROOT_USER=minioadmin, MINIO_ROOT_PASSWORD=minioadmin)
- [x] 1.3 Set MinIO command to `server /data --console-address ":9001"`
- [x] 1.4 Expose MinIO API port 9000 and console port 9001
- [x] 1.5 Add persistent volume `minio_data:/data` for MinIO storage
- [x] 1.6 Add healthcheck for MinIO service

## 2. Environment Configuration
- [x] 2.1 Update `env.example` with local MinIO S3 configuration values
- [x] 2.2 Set `S3_ENDPOINT=http://localhost:9000` in env.example
- [x] 2.3 Set `S3_BUCKET=datastore` in env.example
- [x] 2.4 Set `S3_ACCESS_KEY_ID=minioadmin` in env.example
- [x] 2.5 Set `S3_SECRET_ACCESS_KEY=minioadmin` in env.example
- [x] 2.6 Add comments explaining local vs production S3 configuration

## 3. Documentation
- [x] 3.1 Update README.md with MinIO setup instructions
- [x] 3.2 Document how to access MinIO console (http://localhost:9001)
- [x] 3.3 Document bucket creation process (via console or mc client)
- [x] 3.4 Update docker-compose section in README to mention MinIO

## 4. Validation
- [ ] 4.1 Test docker-compose up starts both postgres and MinIO successfully
- [ ] 4.2 Verify MinIO console is accessible at http://localhost:9001
- [ ] 4.3 Create bucket "datastore" via MinIO console
- [ ] 4.4 Test file upload with local MinIO configuration
- [ ] 4.5 Test file download with local MinIO configuration
- [ ] 4.6 Verify files persist after container restart
- [ ] 4.7 Verify existing external S3 configuration still works (no breaking changes)
