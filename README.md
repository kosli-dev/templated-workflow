# Templated Workflow with Kosli Integration

An opinionated, reusable GitHub Actions workflow that provides automated CI/CD with compliance tracking using Kosli. This workflow handles Docker image building, security scanning, linting, and artifact attestation out of the box.

## Features

- 🐳 **Docker Image Building**: Automatically builds and pushes container images to GitHub Container Registry
- 🔍 **Security Scanning**: Trivy vulnerability scanning with configurable severity levels
- ✅ **Code Linting**: Super Linter integration for code quality checks
- 📋 **SBOM Generation**: Software Bill of Materials generation and attestation
- 🔒 **Kosli Integration**: Complete artifact tracking and compliance attestation
- 🏷️ **Smart Tagging**: Uses 8-character Git SHA for consistent image tagging

## Prerequisites

Before using this workflow, ensure your repository has:

1. **Kosli API Key**: Set `KOSLI_API_KEY` as a repository secret
2. **Docker Support**: A `Dockerfile` in your repository root (or specify custom path)
3. **GitHub Packages**: Enable GitHub Container Registry for your repository

## Quick Start

### 1. Add the Workflow to Your Repository

Create `.github/workflows/main.yaml` in your repository:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci-cd:
    uses: kosli-dev/templated-workflow/.github/workflows/dev-workflow.yaml@main
    secrets: inherit # Important, otherwise it will not work.
    with:
      dockerfile-path: 'Dockerfile'  # Optional: defaults to 'Dockerfile'
```

### 2. Configure Repository Secrets

Add the following secret to your repository settings:

- `KOSLI_API_KEY`: Your Kosli API token for artifact attestation

### 3. Repository Permissions

Ensure your repository has these permissions enabled:

- **Actions**: Read and write
- **Packages**: Write (for GitHub Container Registry)
- **Contents**: Read

## Configuration

### Environment Variables

The workflow automatically sets up these environment variables:

- `KOSLI_ORG`: Set to `kosli-public`
- `KOSLI_FLOW`: Uses your repository name
- `KOSLI_TRAIL`: Uses the full Git SHA
- `IMAGE`: Follows pattern `{owner}/{repo-name}`

## Workflow Jobs

### 1. Setup

- Initializes Kosli flow and trail
- Generates 8-character SHA for tagging
- Uploads repository code as artifact

### 2. Linting

- Runs Super Linter on your codebase
- Non-blocking (errors don't fail the build)
- Supports multiple languages and formats

### 3. Docker Image

- Builds Docker image with latest and SHA tags
- Pushes to GitHub Container Registry (`ghcr.io`)
- Attests the container artifact with Kosli
- Generates and attests SBOM

### 4. Security Scan

- Runs Trivy vulnerability scanner
- Scans for CRITICAL and HIGH severity vulnerabilities
- Focuses on OS and library vulnerabilities
- Ignores unfixed vulnerabilities

## Image Tagging Strategy

Images are tagged with:

- `latest`: Always points to the most recent build
- `{8-char-sha}`: Specific commit identifier (e.g., `a1b2c3d4`)

Example: `ghcr.io/myorg/myrepo:a1b2c3d4`


## Customization Examples

### Custom Dockerfile Location

```yaml
jobs:
  ci-cd:
    uses: kosli-dev/templated-workflow/.github/workflows/dev-workflow.yaml@main
    secrets: inherit
    with:
      dockerfile-path: 'docker/prod.Dockerfile'
```