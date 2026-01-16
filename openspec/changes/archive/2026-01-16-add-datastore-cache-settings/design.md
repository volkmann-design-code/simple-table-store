## Context

Currently, API responses for record queries via API keys do not include cache-control headers, which means clients and intermediate proxies cannot cache responses effectively. This leads to unnecessary server load for frequently accessed datastores.

## Goals / Non-Goals

### Goals
- Allow per-datastore configuration of cache duration
- Set appropriate Cache-Control headers for API key requests
- Provide UI for configuring cache settings
- Make caching behavior transparent to users

### Non-Goals
- Server-side caching (this is about HTTP cache-control headers only)
- Cache invalidation mechanisms (rely on TTL-based expiration)
- Cache settings for session-authenticated requests (only API key requests)

## Decisions

### Decision: Store cache duration in seconds as nullable integer
- **Rationale**: Simple, flexible, allows NULL to mean "no caching" (Cache-Control: no-cache)
- **Alternatives considered**: 
  - Storing as string (e.g., "1h", "30m") - rejected for complexity in parsing
  - Storing as milliseconds - rejected as seconds are standard for HTTP cache-control max-age

### Decision: Settings modal in header area
- **Rationale**: Accessible but not intrusive, follows common pattern for settings
- **Alternatives considered**:
  - Settings page - rejected as too heavyweight for single setting
  - Inline in datastore page - rejected as clutters main content area

### Decision: Cache-Control header format
- **Format**: `Cache-Control: public, max-age=<seconds>` when cache_duration_seconds is set
- **Format**: `Cache-Control: no-cache` when cache_duration_seconds is NULL or 0
- **Rationale**: Standard HTTP caching directives, `public` allows caching by proxies/CDNs

### Decision: Only apply to API key requests
- **Rationale**: Session-authenticated requests may have user-specific data or permissions that shouldn't be cached
- **Alternatives considered**: Apply to all requests - rejected for security/privacy concerns

## Risks / Trade-offs

- **Risk**: Users may set very long cache durations, leading to stale data
  - **Mitigation**: UI should include guidance about appropriate cache durations, and users can always set to 0 or NULL to disable

- **Risk**: Cache duration changes don't invalidate existing cached responses
  - **Mitigation**: This is expected HTTP caching behavior; users should understand TTL-based expiration

- **Trade-off**: Simplicity vs. flexibility
  - **Chosen**: Simple single duration setting rather than complex cache rules
  - **Rationale**: Meets 80% use case, can be extended later if needed

## Migration Plan

1. Add migration to add `cache_duration_seconds` column (nullable, default NULL)
2. Existing datastores will have NULL (no caching) by default
3. Users can configure via UI after deployment
4. No data migration needed

## Open Questions

- Should admin API support setting cache_duration_seconds? (Can be added later if needed)
**ANSWER**: Yes
- Should there be a maximum cache duration limit? (Not critical for v1)
**ANSWER**: Yes, 1 year
