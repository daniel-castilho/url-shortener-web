# Epic 14: Frontend testing excellence and confidence

**Project:** `url-shortener-web`  
**Planning baseline:** `main` / `81e0df3`  
**Status:** Planning; no implementation authorized by this document  
**Pillar target:** Testing **5/5**, assessed through reproducible evidence rather than test count or one coverage percentage.

## Objective

Build a reliable, risk-based and maintainable quality system for the React SPA. A change should receive fast feedback from the right test layer; critical user journeys and API assumptions should be protected; failures should be actionable; and only authorized, isolated environments should be used for remote testing.

The epic is successful when critical risks are traceable to tests, required checks are enforced, tests are deterministic and diagnostic, the frontend/backend contract is verified at agreed boundaries, and the final release evidence includes safe browser validation.

## Baseline observed in the planning checkout

- React 19, TypeScript, Vite, React Router 7, TanStack Query.
- Kernel tests: Node `node:test` over `src/lib/*.test.ts`.
- UI integration tests: Vitest + jsdom + React Testing Library + user-event + MSW.
- Browser tests: Playwright, Chromium project, E2E job is opt-in, tracing is configured `on-first-retry`.
- CI runs `npm ci`, `npm test`, `npm run test:integration`, and `npm run build`; `build` runs TypeScript compilation. The regular workflow does not call `npm run lint` / `npm run check`.
- `docs/testing.md` already records sound practices and targeted scenarios. Its live-UAT probe criterion must be reconciled with the standing safety rule and the Staging environment's pending status before execution.
- User-reported recent green checks are not independently reproduced in this planning task.

## Scope

1. Establish risk map, evidence standard, safety policy and quality gates.
2. Improve deterministic kernel and integration coverage for auth, links, API errors and administration.
3. Measure meaningful coverage and test strength; introduce mutation testing only after a compatibility/baseline spike.
4. Add automated and manual accessibility/security regression checks relevant to the client.
5. Make Playwright E2E safe, isolated, diagnosable and representative of critical journeys.
6. Define Staging readiness and, only after DevOps readiness plus explicit authorization, a safe validation policy.
7. Keep test guidance, runbooks and epic evidence in sync.

## Out of scope

- Product feature changes unrelated to enabling or verifying testability.
- Backend implementation, backend deployment, database administration, or changing the API contract without backend owner agreement.
- Running `install-prometheus.sh`, staging rehearsal, production operation, or tests against production.
- Running the destructive admin probe against Staging/UAT or production. Its current approved boundary remains isolated/disposable dev; any policy change requires explicit authorization and a safety review.
- Making the shared Staging environment available by this epic. DevOps owns preparation; current status is **pending**.
- Replacing `node:test`, adopting Vitest Browser Mode, creating an E2E-heavy test pyramid, requiring 100% coverage, or adding dependencies without approval.
- Commit, push, merge, release or operation of remote environments as part of planning.

## Principles and decisions

- Use the smallest layer that gives trustworthy evidence: static checks → pure kernel → RTL/MSW integration → a small set of browser journeys.
- Test user-observable outcomes and real HTTP boundaries. Do not test implementation details, CSS class strings, `useState`, or component-library primitives.
- Preserve the split: `node:test` remains zero-DOM for kernel; Vitest/RTL/MSW remains the integration layer; Playwright is for browser-level system behavior.
- Fixtures must match `docs/api-contract.md`; MSW is not a second API specification.
- Coverage is a diagnostic; branch-risk coverage and mutation results are stronger evidence but also require human review.
- Retry is evidence of instability, not a way to hide it. Track first-attempt reliability.
- A Staging/UAT label alone does not authorize access or a test. No remote test until environment readiness, scope, credentials, data isolation and explicit approval are established.

## Dependency and readiness gates

- **D1 — Repository owner:** approves changes to CI, dependencies, quality thresholds and `docs/testing.md`.
- **D2 — Backend owner:** confirms API shapes, auth/cookie behaviors and provider-side contract verification where needed.
- **D3 — DevOps:** prepares Staging; status remains **pending**. Defines health/readiness, approved URL, synthetic data, secrets and rollback/reset capabilities.
- **D4 — Test environment:** an isolated/disposable integrated backend is required for reproducible full-stack E2E. Do not substitute shared Staging until approved and isolation controls are accepted.
- **D5 — Explicit operator authorization:** required before any remote E2E or rehearsal. The admin probe remains dev-only unless the user explicitly revises its policy.

## Sequencing

| Phase | Stories | Outcome / gate |
| --- | --- | --- |
| 0. Baseline and policy | 14.1–14.3 | Evidence map, environment boundaries, agreed quality policy |
| 1. Fast deterministic foundation | 14.4–14.7 | Mandatory PR checks, hygiene guard, coverage baseline, kernel confidence |
| 2. Integration confidence | 14.8–14.15 | Stable harness, API/auth/link/admin behavior covered through RTL/MSW |
| 3. Accessibility and client security | 14.16–14.18 | Automation plus human checks for selected high-risk states |
| 4. Browser E2E and safe environments | 14.19–14.25 | Isolated E2E and readiness-gated Staging/browser validation |
| 5. Test-strength and sustainability | 14.26–14.28 | Mutation baseline, flakiness/feedback metrics, published evidence |

Stories 14.23–14.24 are explicitly blocked until DevOps marks Staging ready and the test scope is approved. They do not authorize a staging run. Stories requiring a disposable backend may proceed only when that environment has been separately approved.

## Proposed success measures

Approve project-specific thresholds before they become gates; the values are proposals, not industry certification requirements.

- All required pull-request gates run on every applicable PR and cannot be bypassed by an opt-in variable.
- Every critical user/security/API risk has a test or formally accepted exception.
- No critical test is silently skipped; retry-passed cases are reported and owned.
- Test independence is demonstrated by clean repeated runs and supported parallel execution.
- Coverage and mutation reports have an explicit in-scope file set, baseline and reviewed exclusions. A proposed mutation threshold (for selected critical logic only) may be set after baseline; do not impose a global 100% target.
- Release E2E has an approved, deterministic environment and evidence linked to the tested SHA; Staging is used only once ready and authorized.
- Test reports and artifacts contain no credentials, tokens or production data.

## Related references

- `docs/testing.md`
- `docs/api-contract.md`
- `docs/twelve-factors.md`
- `docs/adr/0001-hexagonal-frontend.md`
- `docs/adr/0002-result-type-errors.md`
- `.github/workflows/ci.yml`
- `/home/user/pesquisa-maturidade-testes-frontend.md`
- `/home/user/checklist-testes-5-de-5-frontend.md`
