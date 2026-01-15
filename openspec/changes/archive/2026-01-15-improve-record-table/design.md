## Context
The records table currently displays only the data columns with minimal metadata. Users have requested better traceability (who created/modified records) and improved media file handling (quick previews). The API currently only supports sorting by `created_at DESC`.

## Goals / Non-Goals
- Goals:
  - Track record authorship (created_by, updated_by)
  - Enable sorting records by any column
  - Provide inline previews for images and videos
  - Maintain clean, uncluttered table appearance
- Non-Goals:
  - Full audit log of all changes
  - Editing files inline in the table
  - Filtering records (future scope)

## Decisions

### Authorship Tracking
- **Decision**: Add `created_by` and `updated_by` columns to the records table referencing users.id
- **Rationale**: Direct foreign keys provide data integrity and enable JOINs for displaying user emails
- **Alternative**: Store user email as text (rejected: stale if email changes, no referential integrity)

### Sorting Implementation
- **Decision**: Pass `sort` and `order` query parameters to API; build ORDER BY clause with allowlist validation
- **Rationale**: Simple, stateless approach; validates against known columns to prevent SQL injection
- **Alternative**: Full-text search/filter library (rejected: overkill for sorting only)

### Thumbnail Generation
- **Decision**: Use browser-native `<img>` with small dimensions for images; `<video>` poster attribute for videos
- **Rationale**: No server-side processing needed; leverages S3 URLs directly
- **Alternative**: Server-side thumbnail generation (rejected: adds complexity, S3 egress costs)

### Preview Modal
- **Decision**: Single modal component reused for images and videos, using native HTML elements
- **Rationale**: Simple implementation, good browser support, no external dependencies

## Risks / Trade-offs
- **Risk**: Large images may be slow to load as thumbnails → Mitigation: CSS constrains display size; browser handles resize
- **Risk**: Video poster may not load quickly → Mitigation: Fallback to generic video icon

## Migration Plan
1. Deploy migration adding nullable `created_by`/`updated_by` columns
2. Existing records will have NULL for these fields (acceptable for historical data)
3. New records will populate these fields from session

## Open Questions
- None
