## Context

CORS (Cross-Origin Resource Sharing) settings need to be added per datastore to allow controlled cross-origin access to API endpoints. This enables web applications hosted on different domains to access datastore records via API keys while maintaining security through origin whitelisting.

## Goals / Non-Goals

### Goals
- Allow datastore owners to configure which origins can access their API
- Support multiple allowed origins per datastore
- Enforce CORS headers only for API key requests (session-based requests are same-origin)
- Handle CORS preflight (OPTIONS) requests
- Provide clear UI for managing CORS origins

### Non-Goals
- Wildcard origin support (`*`) - only exact origin matching for security
- Per-API-key CORS settings - CORS is configured at datastore level
- CORS for session-authenticated requests - these are same-origin by design

## Decisions

### Decision: Store origins as comma-separated TEXT

**What**: Use PostgreSQL `TEXT` column to store allowed CORS origins as a comma-separated list.

**Why**: 
- Simpler schema - no array type needed
- Easy to parse and validate in application code
- Straightforward to display and edit in UI (comma-separated is intuitive)
- Minimal storage overhead

**Alternatives considered**:
- TEXT[] array: More type-safe but adds complexity for simple use case
- JSONB array: More flexible but unnecessary overhead for simple strings
- Separate table: Overkill for a simple list of strings

### Decision: Exact origin matching only

**What**: Only allow exact origin matches (e.g., `https://example.com`). No wildcards, no protocol-relative URLs.

**Why**:
- Security: Prevents accidental over-permissive access
- Simplicity: Easier to validate and understand
- Predictable behavior: Users know exactly which origins are allowed

**Alternatives considered**:
- Wildcard support (`https://*.example.com`): More flexible but complex to validate and potentially insecure
- Protocol-relative (`//example.com`): Ambiguous and not recommended by CORS spec

### Decision: Origin validation format

**What**: Validate origins as complete URLs with protocol (http:// or https://), domain, and optional port. Examples: `https://example.com`, `https://app.example.com:3000`.

**Why**:
- CORS spec requires exact origin matching including protocol and port
- Clear validation rules prevent configuration errors
- Browser security model requires complete origin specification

**Validation rules**:
- Must start with `http://` or `https://`
- Must include valid domain (no IP addresses for security)
- Port is optional (defaults to 80 for http, 443 for https)
- No path, query, or fragment components
- No trailing slashes

### Decision: CORS headers only for API key requests

**What**: Apply CORS headers only when requests are authenticated via API key. Session-authenticated requests do not include CORS headers.

**Why**:
- Session-authenticated requests are same-origin (from the same web app)
- CORS is only needed for cross-origin requests
- Reduces complexity and potential security surface

**Alternatives considered**:
- CORS for all requests: Unnecessary and potentially confusing

### Decision: Handle OPTIONS preflight requests

**What**: Respond to OPTIONS requests with appropriate CORS headers for preflight checks.

**Why**:
- Required by CORS spec for browsers to make actual requests
- Enables proper cross-origin API access from web applications

**Preflight response headers**:
- `Access-Control-Allow-Origin`: Matching origin if allowed
- `Access-Control-Allow-Methods`: `GET, OPTIONS` (read-only for API keys)
- `Access-Control-Allow-Headers`: `X-API-Key, Content-Type`

## Risks / Trade-offs

### Security Risk: Origin spoofing
- **Risk**: Malicious sites could attempt to spoof origins
- **Mitigation**: Browsers enforce origin headers; server validates against whitelist. Only exact matches are allowed.

### Configuration Risk: Misconfigured origins
- **Risk**: Users might configure incorrect origins, breaking legitimate access
- **Mitigation**: Clear validation messages, UI guidance, and documentation

### Performance Impact: Origin checking
- **Risk**: Checking origins on every request adds minimal overhead
- **Mitigation**: Simple string parsing and matching is O(n) where n is typically small (<10 origins)

## Migration Plan

1. Add `allowed_cors_origins TEXT` column to `datastores` table (nullable, defaults to NULL)
2. Existing datastores will have NULL (no CORS restrictions)
3. No data migration needed - feature is opt-in
4. Rollback: Drop column if needed (no data loss as it's new)

## Open Questions

- Should we support localhost origins for development? (e.g., `http://localhost:3000`)
  - **Decision**: Yes, allow localhost for development flexibility
- Should we validate origins on save or on request?
  - **Decision**: Validate on save to catch errors early, but also validate on request as defense-in-depth
- Should we limit the number of origins per datastore?
  - **Decision**: No hard limit initially, but consider adding a reasonable limit (e.g., 50) if abuse occurs
