## MODIFIED Requirements

### Requirement: API Key Authentication

The system SHALL authenticate external requests using API keys for read-only datastore access.

#### Scenario: Valid API key access

- **WHEN** GET `/api/datastores/:slug/records` with header `X-API-Key: <valid-key>`
- **THEN** the request is authenticated for read-only access
- **AND** records are returned
- **AND** if the datastore has `cache_duration_seconds` set to a positive value, the response includes `Cache-Control: public, max-age=<cache_duration_seconds>` header
- **AND** if the datastore has `cache_duration_seconds` set to NULL or 0, the response includes `Cache-Control: no-cache` header
- **AND** if the datastore has `allowed_cors_origins` configured and the request includes an `Origin` header matching one of the allowed origins, the response includes `Access-Control-Allow-Origin: <origin>` header
- **AND** if the datastore has `allowed_cors_origins` configured but the request origin does not match any allowed origin, the response does NOT include `Access-Control-Allow-Origin` header

#### Scenario: Invalid API key

- **WHEN** a request is made with an invalid X-API-Key header
- **THEN** HTTP 401 Unauthorized is returned

#### Scenario: Expired API key

- **GIVEN** an API key has passed its expires_at date
- **WHEN** a request is made with the expired key
- **THEN** HTTP 401 Unauthorized is returned

## ADDED Requirements

### Requirement: CORS Preflight Support

The system SHALL handle CORS preflight requests (OPTIONS) for API key endpoints when CORS origins are configured.

#### Scenario: OPTIONS preflight request with allowed origin

- **GIVEN** a datastore has `allowed_cors_origins` configured including `https://example.com`
- **WHEN** OPTIONS `/api/datastores/:slug/records` with header `Origin: https://example.com` and `X-API-Key: <valid-key>`
- **THEN** HTTP 200 OK is returned
- **AND** response includes `Access-Control-Allow-Origin: https://example.com` header
- **AND** response includes `Access-Control-Allow-Methods: GET, OPTIONS` header
- **AND** response includes `Access-Control-Allow-Headers: X-API-Key, Content-Type` header

#### Scenario: OPTIONS preflight request with disallowed origin

- **GIVEN** a datastore has `allowed_cors_origins` configured including `https://example.com`
- **WHEN** OPTIONS `/api/datastores/:slug/records` with header `Origin: https://other.com` and `X-API-Key: <valid-key>`
- **THEN** HTTP 200 OK is returned
- **AND** response does NOT include `Access-Control-Allow-Origin` header

#### Scenario: OPTIONS preflight without CORS configuration

- **GIVEN** a datastore has `allowed_cors_origins` set to NULL or empty array
- **WHEN** OPTIONS `/api/datastores/:slug/records` with header `Origin: https://example.com` and `X-API-Key: <valid-key>`
- **THEN** HTTP 200 OK is returned
- **AND** response does NOT include `Access-Control-Allow-Origin` header
