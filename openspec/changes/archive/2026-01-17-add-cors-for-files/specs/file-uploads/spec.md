## ADDED Requirements

### Requirement: CORS Support for File Downloads

When serving file downloads via API key authentication, the system SHALL include CORS headers based on the datastore's `allowed_cors_origins` configuration, enabling cross-origin access to files (e.g., for use as image sources in web applications).

#### Scenario: File download with allowed origin via API key

- **GIVEN** a datastore has `allowed_cors_origins` configured including `https://example.com`
- **WHEN** GET `/api/files/:id` with header `Origin: https://example.com` and `X-API-Key: <valid-key>` or `?api_key=<valid-key>`
- **THEN** HTTP 200 OK is returned with the file content
- **AND** response includes `Access-Control-Allow-Origin: https://example.com` header
- **AND** the file can be used as an image source in cross-origin contexts (e.g., `<img src="...">`)

#### Scenario: File download with disallowed origin via API key

- **GIVEN** a datastore has `allowed_cors_origins` configured including `https://example.com`
- **WHEN** GET `/api/files/:id` with header `Origin: https://other.com` and `X-API-Key: <valid-key>` or `?api_key=<valid-key>`
- **THEN** HTTP 200 OK is returned with the file content
- **AND** response does NOT include `Access-Control-Allow-Origin` header

#### Scenario: File download without CORS configuration via API key

- **GIVEN** a datastore has `allowed_cors_origins` set to NULL or empty
- **WHEN** GET `/api/files/:id` with header `Origin: https://example.com` and `X-API-Key: <valid-key>` or `?api_key=<valid-key>`
- **THEN** HTTP 200 OK is returned with the file content
- **AND** response does NOT include `Access-Control-Allow-Origin` header

#### Scenario: File download via session authentication

- **WHEN** GET `/api/files/:id` with session cookie authentication
- **THEN** HTTP 200 OK is returned with the file content
- **AND** response does NOT include `Access-Control-Allow-Origin` header (CORS only applies to API key requests)

### Requirement: CORS Preflight Support for Files

The system SHALL handle CORS preflight requests (OPTIONS) for the files API endpoint when CORS origins are configured.

#### Scenario: OPTIONS preflight request with allowed origin

- **GIVEN** a datastore has `allowed_cors_origins` configured including `https://example.com`
- **WHEN** OPTIONS `/api/files/:id` with header `Origin: https://example.com` and `X-API-Key: <valid-key>` or `?api_key=<valid-key>`
- **THEN** HTTP 200 OK is returned
- **AND** response includes `Access-Control-Allow-Origin: https://example.com` header
- **AND** response includes `Access-Control-Allow-Methods: GET, OPTIONS` header
- **AND** response includes `Access-Control-Allow-Headers: X-API-Key, Content-Type` header

#### Scenario: OPTIONS preflight request with disallowed origin

- **GIVEN** a datastore has `allowed_cors_origins` configured including `https://example.com`
- **WHEN** OPTIONS `/api/files/:id` with header `Origin: https://other.com` and `X-API-Key: <valid-key>` or `?api_key=<valid-key>`
- **THEN** HTTP 200 OK is returned
- **AND** response does NOT include `Access-Control-Allow-Origin` header

#### Scenario: OPTIONS preflight without CORS configuration

- **GIVEN** a datastore has `allowed_cors_origins` set to NULL or empty array
- **WHEN** OPTIONS `/api/files/:id` with header `Origin: https://example.com` and `X-API-Key: <valid-key>` or `?api_key=<valid-key>`
- **THEN** HTTP 200 OK is returned
- **AND** response does NOT include `Access-Control-Allow-Origin` header
