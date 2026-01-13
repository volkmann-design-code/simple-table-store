# user-auth Specification

## Purpose
TBD - created by archiving change add-datastore-app. Update Purpose after archive.
## Requirements
### Requirement: User Login

The system SHALL authenticate users with email and password credentials.

#### Scenario: Successful login

- **WHEN** POST `/auth/login` with valid `{ email, password }`
- **THEN** a session JWT is generated
- **AND** an HTTP-only secure cookie is set
- **AND** HTTP 200 is returned with user info

#### Scenario: Invalid credentials

- **WHEN** POST `/auth/login` with invalid email or password
- **THEN** HTTP 401 Unauthorized is returned
- **AND** no session cookie is set

#### Scenario: Missing fields

- **WHEN** POST `/auth/login` with missing email or password
- **THEN** HTTP 400 Bad Request is returned

### Requirement: User Logout

The system SHALL allow authenticated users to terminate their session.

#### Scenario: Successful logout

- **WHEN** POST `/auth/logout` with a valid session cookie
- **THEN** the session cookie is cleared
- **AND** HTTP 200 is returned

### Requirement: Session Management

The system SHALL manage user sessions via signed JWT cookies.

#### Scenario: Valid session access

- **GIVEN** a user has logged in
- **WHEN** a request is made to a protected endpoint with a valid session cookie
- **THEN** the request is processed with the user's context

#### Scenario: Expired session

- **GIVEN** a session JWT has expired (older than 24 hours)
- **WHEN** a request is made to a protected endpoint
- **THEN** HTTP 401 Unauthorized is returned
- **AND** the session cookie is cleared

#### Scenario: Invalid session

- **WHEN** a request is made to a protected endpoint with an invalid or tampered session cookie
- **THEN** HTTP 401 Unauthorized is returned

### Requirement: Password Security

The system SHALL securely store user passwords using bcrypt hashing.

#### Scenario: Password hashing

- **WHEN** a user is created or password is updated
- **THEN** the password is hashed with bcrypt (cost factor 12)
- **AND** the plaintext password is never stored

#### Scenario: Password verification

- **WHEN** a user attempts to login
- **THEN** the provided password is compared against the stored hash using constant-time comparison

