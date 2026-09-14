# Epic 12 – Definition of Done

Rule zero — paste or Hypothesis.

    git log --oneline main..HEAD
    npm test
    npm run test:integration
    npm run check
    gh run list --limit 5

If a tag was pushed, paste that run. Else LOCAL + "no tag cut".

Do not flip VITE_AUTH_MODE.
Closure is the owner channel.

---

## Evidence (filled 2026-09-14)

### git log --oneline main..HEAD

    02840f3 docs: changelog + deploy + agents release-artifact contract
    bc03c09 docs: epic-10 planning docs
    3aba885 build(release): archive + CycloneDX SBOM + SHA256SUMS on tag (parity with service)

### npm test

    ℹ pass 38
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 241.496509

### npm run test:integration

    Test Files  5 passed (5)
         Tests  12 passed (12)
     Duration  3.17s

### npm run check

    ✓ 1812 modules transformed.
    dist/index.html                        0.40 kB │ gzip:   0.27 kB
    dist/assets/index-DNkxdcO0.css        19.86 kB │ gzip:   4.74 kB
    dist/assets/ClicksChart-RTh3q-Vl.js    1.39 kB │ gzip:   0.66 kB
    dist/assets/index-CSdEIkkv.js        391.03 kB │ gzip: 123.74 kB
    ✓ built in 3.15s

(lint + typecheck stages ran before build inside the same `npm run check` — exit 0.)

### Workflow YAML validation (LOCAL)

    $ python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml')); ..."
    YAML OK — Release artifact | 11 steps | ['Checkout', 'Setup Node', 'Install dependencies',
    'Kernel tests', 'Integration tests', 'Build', 'Pack dist archive', 'Generate CycloneDX SBOM',
    'Compute and verify SHA256SUMS', 'Upload release files', 'Create GitHub Release']
    permissions: {'contents': 'write'}

### LOCAL dry-run of the exact workflow steps (no tag cut)

Executed with the same commands as the job, `ref_name=v0.1.0-test`, in
`/tmp/opencode/epic12-dryrun` (repo tree stays clean — `dist/` is gitignored):

    $ npm run build
    build ok
    $ tar -czf "url-shortener-web-v0.1.0-test.tar.gz" -C "$REPO" dist
    -rw-r--r-- 1 castilho castilho 129176 Sep 14 19:12 url-shortener-web-v0.1.0-test.tar.gz
    $ npm sbom --sbom-format cyclonedx --omit dev --package-lock-only > sbom-url-shortener-web-v0.1.0-test.json
    36867 sbom-url-shortener-web-v0.1.0-test.json
    $ sha256sum "url-shortener-web-v0.1.0-test.tar.gz" "sbom-url-shortener-web-v0.1.0-test.json" > SHA256SUMS
    $ cat SHA256SUMS
    39fd06f5f9337dfbb1e501cf288aaa930534d00cab9bcbea93197b30ed8f9ee3  url-shortener-web-v0.1.0-test.tar.gz
    abc6de1001ce941ca630bce86079fe3e8e66a39d2e5fe54c74014c7567a64748  sbom-url-shortener-web-v0.1.0-test.json
    $ sha256sum -c SHA256SUMS
    url-shortener-web-v0.1.0-test.tar.gz: OK
    sbom-url-shortener-web-v0.1.0-test.json: OK

SBOM content check:

    bomFormat: CycloneDX | specVersion: 1.5 | components: 34
    tool: {'vendor': 'npm', 'name': 'cli', 'version': '10.8.2'}

### Tag run status

**Hypothesis — no tag cut.** Live `v*` workflow run pending an owner-cut tag;
PR CI green on main is the gate for merge (per epic-12-testing.md and the epic
brief). Once a tag is pushed, its run URL + release URL belong here.

### CI run on PR

(paste after PR CI completes)

### Decisions (recorded)

- SBOM tool: native `npm sbom` (Node 24 ships npm ≥ 10.8; zero new deps, no
  `npx` network fetch at release time, CLI pinned by the runner's Node version).
- SBOM scope: production dependency tree only (`--omit dev --package-lock-only`).
- Tag job gates: `npm test` + `npm run test:integration` added before build.
- Publish target: `release-<tag>` artifact (30d) **and** GitHub Release via
  `softprops/action-gh-release@v3.0.3` (backend parity).
- epic-10 planning docs folded into this PR (never-materialized separate PR).
