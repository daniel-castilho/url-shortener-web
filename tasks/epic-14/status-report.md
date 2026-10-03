# Epic 14 Status Report — Done vs Not Finished

Epic 14: Frontend Testing Excellence and Confidence
Baseline SHA (merged): 524d4ef (on main after merge)

## DONE (completed with evidence)

### Phase 0: Baseline & Policy
- [x] 14.1 — Re-baseline test portfolio (baseline-portfolio.md, git state, scripts, CI, suites)
- [x] 14.2 — Risk-to-test map (risk-to-test-map.md, journeys→layer/owner/evidence/gaps)
- [x] 14.3 — Environment & safety policy (env-safety-policy.md; Staging marked pending)

### Phase 1: Gates & Measurement
- [x] 14.4 — CI gates authoritative (lint+typecheck added; job renamed; check runs lint/typecheck/test/integration/build)
- [x] 14.5 — Test hygiene protections (no .only in src; admin-probe gated; unhandled requests fail in MSW)
- [x] 14.6 — Coverage baseline (assessment + config proposal; needs dep approval — see Blocked)
- [x] 14.7 — Risk-based coverage policy (drafted by domain/kernel/admin/pages; no global 100%)

### Phase 2: Kernel Determinism
- [x] 14.8 — Kernel determinism (38/38 pass; no DOM/network; fresh state)
- [x] 14.9 — Critical kernel behavior gaps (URL/auth-mode/errors/PATCH/refresh-coordinator/session-events/api-refresh)

### Phase 3: Integration Confidence
- [x] 14.10 — RTL/MSW harness hardened (unhandled:error, cleanup+resetHandlers after each; fresh providers)
- [x] 14.11 — MSW fixtures aligned to api-contract.md (exact names; nested AdminUrlLookupResponse correct)
- [x] 14.12 — Login/session states (covered in specs)
- [x] 14.13 — Bearer + cookie auth behavior (covered at boundary; cookie E2E depends on backend)
- [x] 14.14 — Refresh coordination/recovery (kernel+integration evidence)
- [x] 14.15 — Shorten form outcomes (validation, 400/401/403/429/Retry-After, network/5xx)
- [x] 14.16 — Link list/detail states (loading/empty/error/success/pagination)
- [x] 14.17 — Link edit/archive semantics (PATCH partial only; confirm/cancel; failure not success)
- [x] 14.18 — Admin guards/actions (role guard, list/paginate/search, links, block/unblock/self-block, force-archive)

## NOT FINISHED YET (in progress/blocked/pending)

### Phase 4: Accessibility & Client Security
- [ ] 14.19 — Automated accessibility checks (axe-core/playwright not installed; needs dep approval; manual review pending)
- [ ] 14.20 — Manual keyboard/focus review (checklist not yet executed with evidence/reviewer/date)
- [ ] 14.21 — Client security regression cases (mapping done; tests/cases not yet implemented/recorded)

### Phase 4: Browser E2E & Safe Environments
- [ ] 14.22 — Isolated Playwright fixtures/data (documented as compliant; implementation details/evidence as tests may need minor additions)
- [ ] 14.23 — Critical bearer E2E journey (blocked: needs approved isolated/disposable backend + explicit auth)
- [ ] 14.24 — Cookie-session E2E journey (blocked: backend cookie refresh not available + contract agreement)
- [ ] 14.25 — Admin probe safe/non-vacuous (compliant code; not executed with env; policy in place)
- [ ] 14.26 — Staging readiness contract (blocked: DevOps must provide readiness evidence + approval)
- [ ] 14.27 — Approved Staging smoke gate (blocked until 14.26 + explicit auth; must be non-destructive)
- [ ] 14.28 — Browser compatibility matrix (Chromium baseline only; Firefox/WebKit cadence/approval pending)

### Phase 5: Test Strength & Sustainability
- [ ] 14.29 — Mutation testing spike (blocked: needs Stryker approval for node:test + Vitest; parallel spike)
- [ ] 14.30 — Flaky-test/feedback metrics (baseline known; tracking/targets/owner/SLA not formalized in docs yet)

### Phase 6: Documentation & Closeout
- [ ] 14.31 — Align testing documentation (env-safety-policy drafted in tasks/epic-14; need to sync to docs/testing.md + AGENTS/README)
- [ ] 14.32 — Close epic with evidence review (blocked deps remain; DoD evidence collection incomplete until all stories closed)

## Blockers Summary
- Dependency approvals: @vitest/coverage-v8 (14.6), @axe-core/playwright (14.19), Stryker packages (14.29)
- Environment/backend: isolated disposable backend for 14.23 bearer E2E; backend cookie refresh contract for 14.24
- DevOps/Staging: readiness contract + explicit authorization for 14.26–14.27 (Staging currently pending)
