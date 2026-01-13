# Change: Improve Record Form UX

## Why
The record creation/editing modal has several UX issues: the form doesn't reset properly after submission, file upload progress doesn't show intermediate values for large files, and file type restrictions require explicit MIME types instead of user-friendly categories.

## What Changes
- Reset form fields and file state after successful record creation (without relying solely on page reload)
- Investigate and fix file upload progress indicator to show intermediate progress during large file uploads
- Add file type category presets (`images`, `videos`, `audio`, `documents`) as convenience options alongside explicit MIME types

## Impact
- Affected specs: `record-management`, `file-uploads`
- Affected code:
  - `src/views/DatastorePage.tsx` (form reset, progress UI)
  - `src/routes/files.ts` (streaming upload investigation)
  - `src/types.ts` (file type presets)
  - `src/utils/validation.ts` (preset expansion)
