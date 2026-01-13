# CI/CD Pipeline Design

## Context
The project currently has a Dockerfile for containerization but lacks automated build and deployment workflows. The application uses Bun runtime, builds CSS and JavaScript bundles, and requires database migrations. The repository is hosted on GitHub at `volkmann-design/simple-table-store`.

## Goals / Non-Goals
- Goals:
  - Automate Docker image builds on every commit
  - Push images to GitHub Container Registry (ghcr.io) for main branch
  - Tag images with version from package.json
  - Build (but not push) images for PRs and feature branches
  - Ensure builds are reproducible and consistent

- Non-Goals:
  - Multi-stage deployment environments (dev/staging/prod)
  - Automated deployment to infrastructure
  - Build matrix for multiple architectures
  - Integration with external container registries

## Decisions
- Decision: Use GitHub Actions for CI/CD
  - Rationale: Native GitHub integration, no external services required, free for public repositories
  - Alternatives considered: GitLab CI, CircleCI, Jenkins (rejected due to external dependencies or complexity)

- Decision: Use GitHub Container Registry (ghcr.io)
  - Rationale: Integrated with GitHub, no additional authentication setup, free for public repos
  - Alternatives considered: Docker Hub (requires separate account), AWS ECR (requires AWS setup)

- Decision: Tag images with version from package.json
  - Rationale: Single source of truth for versioning, aligns with semantic versioning practices
  - Format: `ghcr.io/volkmann-design/simple-table-store:<version>` (e.g., `0.1.0`)
  - Alternatives considered: Git tags, commit SHA (rejected as less user-friendly)

- Decision: Separate workflows for main vs PRs/branches
  - Rationale: Security best practice - only push images from main branch, build validation for PRs
  - Main branch: Build + push to registry
  - PRs/other branches: Build only (validation)

- Decision: Use Docker Buildx for multi-platform support preparation
  - Rationale: Standard GitHub Actions approach, enables future multi-arch builds if needed
  - Current scope: Single platform (linux/amd64)

## Risks / Trade-offs
- **Registry authentication**: GitHub Actions requires GITHUB_TOKEN for ghcr.io pushes
  - Mitigation: Use built-in `GITHUB_TOKEN` with automatic permissions
- **Build time**: Docker builds may take several minutes
  - Mitigation: Acceptable for CI/CD, can optimize Dockerfile layers later if needed
- **Version management**: Manual version bumps in package.json required
  - Mitigation: Standard practice, can add automation later if needed
- **Build failures on PRs**: Failed builds block merge
  - Mitigation: Expected behavior - ensures only working code is merged

## Migration Plan
1. Create `.github/workflows/` directory
2. Add workflow file for main branch (build + push)
3. Add workflow file for PRs/branches (build only)
4. Test workflow on a feature branch first
5. Merge to main to trigger first image push
6. Verify image appears in GitHub Container Registry

## Open Questions
- Should we add a `latest` tag in addition to version tags? (Deferred - can add later)
- Should we add build caching for faster subsequent builds? (Deferred - optimize if needed)
