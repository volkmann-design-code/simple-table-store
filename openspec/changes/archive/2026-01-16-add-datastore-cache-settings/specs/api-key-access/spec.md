## MODIFIED Requirements

### Requirement: API Key Authentication

The system SHALL authenticate external requests using API keys for read-only datastore access.

#### Scenario: Valid API key access

- **WHEN** GET `/api/datastores/:slug/records` with header `X-API-Key: <valid-key>`
- **THEN** the request is authenticated for read-only access
- **AND** records are returned
- **AND** if the datastore has `cache_duration_seconds` set to a positive value, the response includes `Cache-Control: public, max-age=<cache_duration_seconds>` header
- **AND** if the datastore has `cache_duration_seconds` set to NULL or 0, the response includes `Cache-Control: no-cache` header

#### Scenario: Invalid API key

- **WHEN** a request is made with an invalid X-API-Key header
- **THEN** HTTP 401 Unauthorized is returned

#### Scenario: Expired API key

- **GIVEN** an API key has passed its expires_at date
- **WHEN** a request is made with the expired key
- **THEN** HTTP 401 Unauthorized is returned
