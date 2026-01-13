# Change: Add Biome Code Formatting

## Why

The project lacks automated code formatting and linting. Biome provides fast, unified formatting and linting with minimal configuration, improving code consistency and developer experience.

## What Changes

- Add `@biomejs/biome` as a dev dependency with pinned version
- Add minimal `biome.json` configuration (stick to defaults)
- Add `lefthook` for git hooks (pre-commit formatting check)
- Add `lefthook.yml` configuration
- Add npm scripts for format/lint commands
- Format entire codebase once

## Impact

- Affected specs: None (tooling-only change)
- Affected code: All source files will be reformatted to Biome defaults
- New files: `biome.json`, `lefthook.yml`
- Modified files: `package.json` (scripts + dependencies)
