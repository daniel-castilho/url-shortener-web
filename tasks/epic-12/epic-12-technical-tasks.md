# Epic 12 – Technical Tasks

Prefer adding steps to existing .github/workflows/release.yml. Do not invent a second tag workflow.

- [ ] After npm run build: tar/zip dist
- [ ] Generate SBOM (npx @cyclonedx/cyclonedx-npm or npm sbom if Node 24 ships it — pick one, pin the CLI)
- [ ] sha256sum into SHA256SUMS
- [ ] actions/upload-artifact or gh release upload (match how dist is already published)
- [ ] CHANGELOG
- [ ] AGENTS.md SBOM debt → resolved
- [ ] Fill epic-12-dod.md

Do not add CycloneDX to runtime dependencies.
