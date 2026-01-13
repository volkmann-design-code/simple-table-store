# i18n Specification

## Purpose
TBD - created by archiving change add-i18n-support. Update Purpose after archive.
## Requirements
### Requirement: Language Detection
The system SHALL automatically detect the user's preferred language from multiple sources and make it available to all request handlers.

#### Scenario: Language detection from query parameter
- **WHEN** a request includes `?lang=de` in the query string
- **THEN** the detected language is set to `'de'` and available via `c.get('language')`

#### Scenario: Language detection from cookie
- **WHEN** a request includes a `language=de` cookie and no query parameter is provided
- **THEN** the detected language is set to `'de'` and available via `c.get('language')`

#### Scenario: Language detection from Accept-Language header
- **WHEN** a request includes `Accept-Language: de,en;q=0.9` header and no query parameter or cookie is provided
- **THEN** the detected language is set to `'de'` if supported, otherwise falls back to `'en'`

#### Scenario: Language fallback to English
- **WHEN** no language is detected or an unsupported language is requested
- **THEN** the system SHALL use `'en'` as the default language

#### Scenario: Language preference caching
- **WHEN** a language is successfully detected
- **THEN** the preference SHALL be stored in a cookie for subsequent requests

### Requirement: Translation Storage
The system SHALL store all translatable strings in TypeScript files, organized by language code.

#### Scenario: English translations file
- **WHEN** the application loads
- **THEN** English translations SHALL be available from `src/i18n/en.lang.ts` with all required strings

#### Scenario: Additional language translations
- **WHEN** a language is supported (e.g., `'de'`)
- **THEN** translations SHALL be available from `src/i18n/de.lang.ts` with the same structure as English

#### Scenario: Translation file structure
- **WHEN** translations are accessed
- **THEN** strings SHALL be organized by feature area (common, auth, errors, dashboard, datastore) for maintainability

### Requirement: Translation Function
The system SHALL provide a translation function that retrieves translated strings by key and supports parameter substitution.

#### Scenario: Simple translation lookup
- **WHEN** `t('en', 'auth.login')` is called
- **THEN** the function SHALL return the English translation for the login button text

#### Scenario: Translation with parameters
- **WHEN** `t('en', 'errors.fileSizeExceeded', { name: 'document.pdf', maxSize: '10MB' })` is called
- **THEN** the function SHALL return the translated string with `{name}` and `{maxSize}` placeholders replaced

#### Scenario: Missing translation fallback
- **WHEN** a translation key does not exist in the target language file
- **THEN** the function SHALL fall back to the English translation, or the key itself if English translation is also missing

### Requirement: Frontend Internationalization
All user-facing text in frontend views SHALL be internationalized and display in the detected language.

#### Scenario: Login page translation
- **WHEN** a user accesses the login page with language `'de'` detected
- **THEN** all text (title, labels, buttons, error messages) SHALL be displayed in German

#### Scenario: Dashboard page translation
- **WHEN** a user accesses the dashboard with language `'de'` detected
- **THEN** all text (header, empty state messages, datastore card labels) SHALL be displayed in German

#### Scenario: Datastore page translation
- **WHEN** a user accesses a datastore page with language `'de'` detected
- **THEN** all text (buttons, table headers, form labels, empty state messages) SHALL be displayed in German

### Requirement: Error Message Internationalization
All error messages returned by the API and displayed to users SHALL be internationalized.

#### Scenario: Authentication error translation
- **WHEN** an authentication error occurs and language `'de'` is detected
- **THEN** the error message SHALL be returned in German

#### Scenario: Validation error translation
- **WHEN** a validation error occurs and language `'de'` is detected
- **THEN** the error message SHALL be returned in German

#### Scenario: API error translation
- **WHEN** an API endpoint returns an error and language `'de'` is detected
- **THEN** the error message in the JSON response SHALL be in German

#### Scenario: File upload error translation
- **WHEN** a file upload error occurs (e.g., size exceeded) and language `'de'` is detected
- **THEN** the error message SHALL be returned in German with parameterized values (e.g., file name, size limit) correctly substituted

