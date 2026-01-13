## Context

A Postgres-backed web application for storing tabular data (minimal Airtable clone). Runs as a Docker container in the vdc-cloud Kubernetes cluster, connecting to CloudnativePG Postgres.

**Stakeholders**: Self-hosted users who need simple, secure tabular data storage with API access.

**Constraints**:
- Single Hono application (server + client components)
- All data in PostgreSQL
- Row-level security for permissions (no application-level permission checks)
- ADMIN_TOKEN env var for admin API authentication

## Goals / Non-Goals

**Goals**:
- Multi-tenant data storage with organization isolation
- Dynamic column schemas per DataStore (stored as metadata)
- Simple user authentication (email/password)
- API key access for external read-only integrations
- Clean, modern UI with Tailwind CSS

**Non-Goals**:
- Real-time collaboration / live cursors
- File attachments
- Complex formulas or computed columns
- OAuth / SSO integration (may be added later)
- Public sharing of datastores

## Decisions

### Database Schema

Normalized schema with JSONB for dynamic record data:

```sql
-- Core tables
organizations (id, name, created_at, updated_at)
users (id, org_id FK, email, password_hash, created_at, updated_at)
datastores (id, org_id FK, name, slug, description, column_definitions JSONB, created_at, updated_at)
records (id, datastore_id FK, data JSONB, created_at, updated_at)
api_keys (id, datastore_id FK, key_hash, name, created_at, expires_at)
```

**Rationale**: JSONB for `data` field allows dynamic schemas per datastore without schema migrations. Column definitions stored as JSONB array with validation rules.

### Column Definition Structure

```typescript
interface ColumnDefinition {
  name: string;           // Display name
  technical_name: string; // Key in JSONB data
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  required: boolean;
  options?: string[];     // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
```

### Row-Level Security Strategy

All permission enforcement via Postgres RLS policies:

1. **Admin operations**: Bypass RLS using service role connection
2. **User operations**: Set `app.current_user_id` and `app.current_org_id` via `SET LOCAL`
3. **API key operations**: Set `app.current_api_key_datastore_id` for read-only access

```sql
-- Example user policy for records
CREATE POLICY records_user_access ON records
  FOR ALL
  USING (
    datastore_id IN (
      SELECT id FROM datastores WHERE org_id = current_setting('app.current_org_id')::uuid
    )
  );
```

### Authentication

- Password hashing: bcrypt with cost factor 12
- Session: HTTP-only secure cookies with signed JWT
- Session duration: 24 hours, sliding expiration

### API Structure

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /admin/users` | ADMIN_TOKEN | Create user |
| `POST /admin/orgs` | ADMIN_TOKEN | Create organization |
| `POST /admin/datastores` | ADMIN_TOKEN | Create datastore |
| `POST /auth/login` | None | User login |
| `POST /auth/logout` | Session | User logout |
| `GET /api/datastores` | Session | List user's datastores |
| `GET /api/datastores/:slug/records` | Session/ApiKey | List records |
| `POST /api/datastores/:slug/records` | Session | Create record |
| `PATCH /api/datastores/:slug/records/:id` | Session | Update record |
| `DELETE /api/datastores/:slug/records/:id` | Session | Delete record |

### Technology Stack

- **Runtime**: Bun (for Hono compatibility and performance)
- **Framework**: Hono v4
- **Frontend**: Hono JSX Client Components + Tailwind CSS
- **Database**: PostgreSQL 16+ (CloudnativePG)
- **ORM**: None (raw SQL with prepared statements for simplicity)

**Alternatives considered**:
- Drizzle ORM: Adds abstraction but RLS requires raw SQL anyway
- Prisma: Too heavy, doesn't support RLS well

### Docker Distribution

Multi-stage Dockerfile:
1. Build stage: Install deps, build client bundles
2. Runtime stage: Minimal Bun image with compiled assets

Environment variables:
- `DATABASE_URL`: Postgres connection string
- `ADMIN_TOKEN`: Secret token for admin API
- `SESSION_SECRET`: Secret for signing session JWTs

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| JSONB queries slower than normalized tables | Add GIN indexes on `records.data`; sufficient for small-medium datasets |
| RLS complexity | Thorough testing of policies; clear documentation of session context vars |
| No data validation at DB level for JSONB | Application validates against column_definitions before insert |
| Password storage | Use bcrypt, never store plaintext; consider adding rate limiting later |

## Migration Plan

1. Deploy Postgres schema via Kubernetes Job
2. Deploy application container
3. Set ADMIN_TOKEN, create initial org/user via admin API
4. No rollback needed (new application)

## Open Questions

- ~~Should DataStore slugs be globally unique or just unique within an organization?~~
  - **Resolved**: Unique within organization (allows `/:org-slug/:datastore-slug` URLs later)
- Should we add audit logging for record changes?
  - **Deferred**: Keep MVP simple; add as future enhancement
