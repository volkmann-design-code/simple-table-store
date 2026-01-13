# simple-data-store

> DISCLAIMER: This app has been developed with heavy AI support and
  turning a blind eye here and there to quickly generate a functional solution!

A Postgres and S3-backed web application for safely storing tabular data.
It can be used to let your users or customers manage structured data without the need
for a paid/rate-limited service like Airtable.

It can be easily deployed with a single, small and fast container that requires a postgres database and optional S3-compatible storage for data storage. Of course,
you need to make sure the underlying database and storage have proper backup solutions.

## Features

- Multi-tenant organization support
- Dynamic column schemas per datastore
- User authentication (email/password)
- Row-level security for all access control
- API key access for external read-only integrations
- File upload support with S3-compatible storage
- In-memory file caching for performance
- Modern UI with Tailwind CSS

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono v4
- **Frontend**: Hono JSX + Tailwind CSS
- **Database**: PostgreSQL

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_TOKEN` | Secret token for admin API access |
| `SESSION_SECRET` | Secret for signing session JWTs |
| `PORT` | Server port (default: 3000) |
| `S3_ENDPOINT` | S3-compatible object storage endpoint (required for Hetzner, MinIO, etc.) |
| `S3_REGION` | S3 region (default: us-east-1) |
| `S3_BUCKET` | S3 bucket name for file storage |
| `S3_ACCESS_KEY_ID` | S3 access key ID (Key ID for Hetzner) |
| `S3_SECRET_ACCESS_KEY` | S3 secret access key (Access Key for Hetzner) |
| `S3_PATH_PREFIX` | Optional parent folder/path prefix inside the bucket (e.g., "datastore-app") |
| `FILE_CACHE_MAX_MEMORY_BYTES` | Maximum memory for file cache in bytes (default: 100MB) |
| `FILE_CACHE_TTL_MS` | File cache TTL in milliseconds (default: 24 hours) |

## Development

### Local Setup with Docker Compose

The easiest way to get started is using docker-compose for the database and storage:

```bash
# Start PostgreSQL database and MinIO storage
docker-compose up -d

# Copy environment variables template
cp env.example .env

# Run migrations
bun run migrate

# Create MinIO bucket (required for file uploads)
# Option 1: Via MinIO Console (recommended)
# 1. Open http://localhost:9001 in your browser
# 2. Login with minioadmin / minioadmin
# 3. Click "Create Bucket" and name it "datastore"

# Option 2: Via MinIO Client (mc)
# docker exec -it datastore-app-storage mc mb /data/datastore

# Start development server
bun run dev
```

The docker-compose setup provides:
- **PostgreSQL** on port 54390 (mapped from 5432)
  - Database: `datastore`
  - User: `datastore` / Password: `datastore_dev`
  - Persistent data volume
- **MinIO** (S3-compatible storage) on ports 9000 (API) and 9001 (Console)
  - Access key: `minioadmin`
  - Secret key: `minioadmin`
  - Console: http://localhost:9001
  - Persistent data volume

### Manual Setup

```bash
# Install dependencies
bun install

# Build CSS and JavaScript bundle
bun run build

# Run migrations (set DATABASE_URL)
DATABASE_URL=postgresql://... bun run migrate

# Start development server
DATABASE_URL=postgresql://... ADMIN_TOKEN=dev SESSION_SECRET=dev bun run dev
```

## API Endpoints

### Admin API (requires ADMIN_TOKEN)

- `GET/POST /admin/orgs` - List/Create organizations
- `GET/PATCH/DELETE /admin/orgs/:id` - Get/Update/Delete organization
- `GET/POST /admin/users` - List/Create users
- `GET/PATCH/DELETE /admin/users/:id` - Get/Update/Delete user
- `GET/POST /admin/datastores` - List/Create datastores
- `GET/PATCH/DELETE /admin/datastores/:id` - Get/Update/Delete datastore
- `GET/POST /admin/api-keys` - List/Create API keys
- `DELETE /admin/api-keys/:id` - Delete API key

### User API (requires session cookie)

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `GET /api/datastores` - List user's datastores
- `GET /api/datastores/:slug` - Get datastore
- `GET /api/datastores/:slug/records` - List records
- `POST /api/datastores/:slug/records` - Create record
- `PATCH /api/datastores/:slug/records/:id` - Update record
- `DELETE /api/datastores/:slug/records/:id` - Delete record
- `POST /api/datastores/:slug/files` - Upload file
- `GET /api/files/:id` - Download file (supports temporary keys for API key access)
- `DELETE /api/files/:id` - Delete file

### API Key Access

Use `X-API-Key` header for read-only access to records:

```bash
curl -H "X-API-Key: dsk_..." https://datastore.example.com/api/datastores/my-store/records
```

## Column Definitions

Datastores use column definitions to define the schema for records. Each column has a type and optional validation rules.

### Column Types

| Type | Description |
|------|-------------|
| `text` | Plain text string |
| `number` | Numeric value |
| `boolean` | True/false value |
| `date` | Date value (ISO 8601) |
| `select` | Single selection from predefined options |
| `file` | File upload with S3 storage |

### File Type Presets

For `file` type columns, you can use `acceptPreset` to restrict accepted file types using preset categories:

| Preset | Accepted Types |
|--------|---------------|
| `images` | All image files (`image/*`) |
| `videos` | All video files (`video/*`) |
| `audio` | All audio files (`audio/*`) |
| `documents` | PDF, Word, Excel, and text files |

Example column definition with file preset:

```json
{
  "name": "Profile Photo",
  "technical_name": "profile_photo",
  "type": "file",
  "required": false,
  "validation": {
    "acceptPreset": "images",
    "maxFileSize": 5242880
  }
}
```

You can also use explicit MIME types with `allowedContentTypes` (takes precedence over `acceptPreset`):

```json
{
  "validation": {
    "allowedContentTypes": ["image/jpeg", "image/png"],
    "maxFileSize": 5242880
  }
}
```

## Docker

### Development Services (Docker Compose)

```bash
# Start local Postgres and MinIO
docker-compose up -d

# Stop and remove
docker-compose down

# Remove volumes (fresh start)
docker-compose down -v
```

**MinIO Console Access:**
- URL: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

**Creating the Bucket:**
Before using file uploads, create a bucket named "datastore" via the MinIO console or using the MinIO client:
```bash
docker exec -it datastore-app-storage mc mb /data/datastore
```

### Application Container

The application container image is publicly available on GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/volkmann-design-code/simple-table-store:0.1.0

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e ADMIN_TOKEN=... \
  -e SESSION_SECRET=... \
  ghcr.io/volkmann-design-code/simple-table-store:0.1.0
```

You can also build the image locally:

```bash
# Build image
docker build -t datastore-app .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e ADMIN_TOKEN=... \
  -e SESSION_SECRET=... \
  datastore-app
```

## Kubernetes Deployment

See `k8s/` directory for manifests:

1. Create secrets: `kubectl apply -f k8s/secrets.yaml`
2. Run migrations: `kubectl apply -f k8s/migration-job.yaml`
3. Deploy app: `kubectl apply -f k8s/deployment.yaml`
4. Configure ingress: `kubectl apply -f k8s/ingress.yaml`
