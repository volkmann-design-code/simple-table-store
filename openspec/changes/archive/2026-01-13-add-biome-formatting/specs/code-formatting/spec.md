## ADDED Requirements

### Requirement: Automated Code Formatting with Biome
The project SHALL use Biome for automated code formatting and linting with default configuration.

#### Scenario: Format check on staged files
- **WHEN** a developer commits code changes
- **THEN** lefthook runs Biome check on staged files
- **AND** the commit is blocked if formatting issues are found

#### Scenario: Manual format command
- **WHEN** a developer runs `bun run format`
- **THEN** Biome formats all source files in place
- **AND** files are updated to match Biome's default style

### Requirement: Git Hooks via Lefthook
The project SHALL use Lefthook to manage git hooks for pre-commit formatting checks.

#### Scenario: Lefthook pre-commit hook
- **WHEN** a developer stages files and runs `git commit`
- **THEN** lefthook triggers Biome check on staged files
- **AND** only files matching supported extensions are checked

### Requirement: Minimal Configuration
The project SHALL use Biome's default configuration with minimal customization.

#### Scenario: Default Biome settings
- **GIVEN** a `biome.json` configuration file exists
- **WHEN** Biome runs formatting or linting
- **THEN** it uses default rules without custom overrides
