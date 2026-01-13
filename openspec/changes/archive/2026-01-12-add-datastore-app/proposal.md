
# Change: Add Datastore App (Minimal Airtable Clone)

## Why

Provide a self-hosted, Postgres-backed web application for securely storing and managing tabular data with multi-tenant organization support. This enables structured data storage with fine-grained access control via row-level security.

## What Changes

- **NEW** Hono-based web application with JSX client components and Tailwind CSS
- **NEW** PostgreSQL schema with Users, Organizations, DataStores, Records, and ApiKeys
- **NEW** Row-level security policies for all permission checks at DB level
- **NEW** Admin API (protected by ADMIN_TOKEN) for user/org/datastore management
- **NEW** User authentication system (email + password)
- **NEW** Record CRUD for authenticated users within their organization
- **NEW** Read-only API key access for external integrations
- **NEW** Docker container distribution

## Impact

- Affected specs: `admin-api`, `user-auth`, `record-management`, `api-key-access` (all new)
- Affected code: New application under `apps/datastore-app/` (will refactor to separate repo later)
- Dependencies: Postgres (existing CloudnativePG), Hono framework
