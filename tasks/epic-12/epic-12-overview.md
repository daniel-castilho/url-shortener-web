# Epic 12: Release parity (SBOM + checksum)

**Project:** url-shortener-web
**Depends on:** Epic 11 on origin/main (b297946)
**Objective:** A git tag produces a dist artifact, a CycloneDX SBOM, and SHA256SUMS — same honesty as url-shortener-service releases.

Audit red flag 4. release.yml already builds and uploads dist/ (30d). Missing provenance files.

## In scope

1. On tag v*: npm ci, npm test, test:integration, build
2. CycloneDX SBOM of production + lockfile (or npm sbom / @cyclonedx/npm)
3. SHA256SUMS covering dist archive + SBOM
4. Upload those files on the GitHub Release or the existing artifact
5. One README/deploy.md sentence

## Out of scope

Playwright on the tag job, flipping cookie default, signing with cosign, changing Java.

## Acceptance

- Tag workflow (or documented dry-run of the same steps locally) writes sbom + SHA256SUMS
- npm test / test:integration / check still green on the PR that only touches workflow + docs
- AGENTS debt "SBOM" marked resolved or dropped
