## Context
The record modal form has three UX issues affecting daily use:
1. Form state persists unexpectedly after submission
2. Progress indicator doesn't show incremental progress for large files
3. File type restrictions are verbose (require full MIME types)

## Goals / Non-Goals
- Goals:
  - Ensure clean form state when reopening modal after creation
  - Provide meaningful upload progress feedback for large files
  - Simplify file type restriction configuration
- Non-Goals:
  - Server-sent events or WebSocket progress (keep it simple)
  - Chunked/resumable uploads
  - Complex file type validation beyond MIME matching

## Decisions

### Form Reset
- **Decision**: Call `closeModal()` (which includes reset logic) after successful submission before any reload/refresh
- **Rationale**: `closeModal()` already resets form fields, file previews, and progress indicators. Ensuring it's called on success path guarantees clean state.

### Upload Progress
- **Decision**: Use `XMLHttpRequest.upload.onprogress` (already implemented) but verify Bun/Hono doesn't buffer entire request
- **Investigation needed**: Test if Bun's default behavior buffers multipart before calling handler
- **Alternatives considered**:
  - Server-Sent Events for S3 upload progress → Too complex for this scope
  - Chunked uploads → Overkill for typical use case
- **Fallback**: If backend buffering is unavoidable, document limitation and ensure frontend progress at least shows activity

### File Type Presets
- **Decision**: Add `acceptPreset` option to column definition validation, alongside `allowedContentTypes`
- **Presets**:
  - `images` → `image/*`
  - `videos` → `video/*`
  - `audio` → `audio/*`
  - `documents` → `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*,text/*`
- **Implementation**: Frontend uses preset for `accept` attribute; backend expands preset to MIME patterns for validation

## Risks / Trade-offs
- Wildcard MIME matching (`image/*`) is less strict than explicit types
- Document preset may not cover all document formats

## Open Questions
- Should preset and explicit types be combinable (e.g., `images` + `application/pdf`)?
