## 1. Form Reset

- [x] 1.1 Update `handleFormSubmit` in `DatastorePage.tsx` to call form reset logic before page reload
- [x] 1.2 Ensure `closeModal()` is triggered on success path to clear file previews and progress state

## 2. Upload Progress Investigation

- [x] 2.1 Test current upload progress behavior with large files (>10MB) to reproduce issue
- [x] 2.2 Investigate if Bun/Hono buffers entire multipart request before handler executes
- [x] 2.3 If buffering is the issue, explore streaming alternatives or document limitation
- [x] 2.4 Implement fix if feasible, otherwise add UI indication that progress reflects transmission to server

## 3. File Type Presets

- [x] 3.1 Add `acceptPreset` to `ColumnDefinition.validation` in `src/types.ts`
- [x] 3.2 Create preset expansion utility mapping preset names to MIME patterns
- [x] 3.3 Update `renderInput` in `DatastorePage.tsx` to use preset for `accept` attribute
- [x] 3.4 Update `validateRecordData` in `src/utils/validation.ts` to validate against expanded preset
- [x] 3.5 Document supported presets: `images`, `videos`, `audio`, `documents`
