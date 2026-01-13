# Change: Add CI/CD Pipeline

## Why
Currently, the project has a Dockerfile but no automated build and deployment pipeline. Manual builds and deployments are error-prone and don't provide consistent, versioned container images. A CI/CD pipeline will automate the build process, ensure consistent image tagging based on package.json version, and enable automated deployments.

## What Changes
- **NEW** GitHub Actions workflow for building Docker images
- **NEW** Automated push to GitHub Container Registry (ghcr.io) on main branch commits
- **NEW** Image tagging using version from package.json
- **NEW** Build-only workflow for PRs and non-main branches (no image push)

## Impact
- Affected specs: New `cicd` capability
- Affected code: 
  - `.github/workflows/` (new directory)
  - No changes to application code
- Dependencies: GitHub Actions, GitHub Container Registry access
