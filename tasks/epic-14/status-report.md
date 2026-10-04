# Epic 14 Final Status Report — CLOSEOUT

Epic 14: Frontend Testing Excellence and Confidence
**Final SHA:** 74314ff (main)
**Status:** CLOSEOUT with documented Staging exception (owner sign-off pending)

---

## COMPLETE (30/32 stories — 5/5 pillars with documented exception)

### Phase 0: Baseline & Policy (3/3)
- [x] 14.1 — Re-baseline test portfolio
- [x] 14.2 — Risk-to-test map
- [x] 14.3 — Environment & safety policy (Staging pending — env not provisioned)

### Phase 1: Gates & Measurement (5/5)
- [x] 14.4 — CI gates authoritative (lint+typecheck+test+integration+build required)
- [x] 14.5 — Test hygiene protections
- [x] 14.6 — Coverage artifact (Vitest + kernel LCOV, 14-day retention)
- [x] 14.7 — Risk-based coverage policy
- [x] 14.30 — CI metrics tracking (scripts/ci-metrics.js, baseline, targets, owner, SLA)

### Phase 2: Kernel Determinism (2/2)
- [x] 14.8 — Kernel determinism (38/38)
- [x] 14.9 — Critical kernel behavior gaps

### Phase 3: Integration Confidence (9/9)
- [x] 14.10 — RTL/MSW harness hardened
- [x] 14.11 — MSW fixtures aligned to OpenAPI
- [x] 14.12-14.18 — Integration coverage (33/33 tests: login, auth, refresh, shorten, list, detail, edit, archive, admin)

### Phase 4: Accessibility, Security, E2E Fixtures (9/9)
- [x] 14.19 — Automated a11y (axe on 3 anonymous routes; authenticated pending)
- [x] 14.20 — AT evidence template (NVDA + VoiceOver; manual runs pending)
- [x] 14.21 — Client security regression cases (OWASP mapped)
- [x] 14.22 — Disposable backend E2E integration (docker-compose.e2e.yaml + seed-e2e.sh)
- [x] 14.23 — Bearer E2E journey (API-level; explicit assertions on disposable backend)
- [x] 14.24 — Cookie E2E journey (API-level; cookie mode + refresh; explicit assertions)
- [x] 14.25 — Admin probe (API-level; contract assertions)
- [x] 14.28 — Browser matrix (Chromium required/PR; Firefox/WebKit nightly)

### Phase 5: Test Strength & Metrics (2/2)
- [x] 14.29 — Mutation spike (Stryker; kernel 100%, integration 25%; no CI gate)
- [x] 14.30 — CI metrics tracking (scripts/ci-metrics.js, baseline, targets, owner, SLA)

### Phase 6: Documentation & Closeout (2/2)
- [x] 14.31 — Align docs (testing.md synced)
- [x] 14.32 — Closeout with Staging exception (docs/epic14-closeout.md)

---

## BLOCKED (2/32 — Staging not provisioned)

| Story | Status | Resolution |
|-------|--------|------------|
| 14.26 | Staging readiness | **Environment not available.** DevOps must provision staging + sign off on `docs/staging-readiness.md`. Tracked as TD-EPIC14-STAGING. |
| 14.27 | Staging smoke | Requires 14.26 + available staging env. Tracked as TD-EPIC14-STAGING. |

---

## ACCEPTED GAPS / TECH DEBT

| Area | Gap | Reason |
|------|-----|--------|
| 14.19 | Authenticated routes not axe-tested | Requires login fixture; follow-up |
| 14.20 | NVDA/VoiceOver runs not executed | Human testers needed; template ready |
| 14.26/14.27 | **Staging not provisioned** | No staging environment available yet. TD-EPIC14-STAGING (Medium, DevOps+FE Lead, next release cycle). |
| 14.29 | Mutation gate not added | Performance too slow; spike complete |
| 14.6 | Coverage thresholds not enforced | Baseline below some targets; follow-up PR |

---

## EVIDENCE SUMMARY

| Category | Link/Value |
|----------|-----------|
| CI Gates | lint, typecheck, kernel, integration, build, coverage — all green |
| Kernel | 38/38 |
| Integration | 33/33 |
| E2E (API-level) | 14.23–25: `tasks/epic-14/14.23-25-status.md` |
| Runs | [37171238136](https://github.com/daniel-castilho/url-shortener-web/actions/runs/37171238136), [37171053424](https://github.com/daniel-castilho/url-shortener-web/actions/runs/37171053424) |
| Technical Debt | `docs/epic14-closeout.md` → TD-EPIC14-STAGING |

---

## GATES STATUS

| Gate | Status |
|------|--------|
| Lint/Typecheck/Kernel/Integration/Build | ✅ |
| Coverage artifact (14-day) | ✅ |
| Disposable E2E (API-level) | ✅ |

---

## STAGING EXCEPTION
Staging smoke (14.26–14.27) not mandatory for 5/5 because staging is **not provisioned** (TD-EPIC14-STAGING). Compensating evidence: bearer/cookie journeys + admin probe on disposable backend. Time-bounded; revisit next release cycle once environment exists.

## CLOSEOUT
**Status:** CLOSEOUT with exceptions. **Owner sign-off pending** (`docs/epic14-closeout.md`).
