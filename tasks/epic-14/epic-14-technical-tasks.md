# Epic 14 — Technical Tasks

This is a planning breakdown, not permission to execute. Follow `AGENTS.md`: no dependency changes, CI edits, remote calls, commits or pushes without the relevant explicit approval. Preserve local work and change only files scoped by the approved story.

## 14.1–14.3 — baseline and policy

- [ ] Record start SHA, `git status`, available scripts, actual CI commands, included files, environment variables and current E2E target behavior.
- [ ] Inventory existing `src/lib/*.test.ts`, `src/**/*.spec.tsx`, `e2e/*.spec.ts` and current skip/focus patterns.
- [ ] Map critical risks to kernel / RTL+MSW / Playwright / manual / backend provider test.
- [ ] Define local, disposable-dev and Staging boundaries, authorization owner, synthetic-data and secret policy.
- [ ] Record Staging state as pending until DevOps readiness evidence is provided.
- [ ] Reconcile proposed policy with `docs/testing.md` without changing it before approval; specifically clarify that the destructive admin probe is dev-disposable only under current policy.

## 14.4–14.7 — gates and measurement

- [ ] Review `.github/workflows/ci.yml` and `package.json`; distinguish `build` (includes `tsc -b`) from `lint`, `typecheck` and `check` to avoid accidental duplication.
- [ ] After approval, make PR checks execute kernel + integration + lint + typecheck/build and return nonzero on any failure.
- [ ] Rename job/report to describe actual gates accurately; verify branch protection/required check policy with repository owner.
- [ ] Add focused-test/skip hygiene guard supported by existing runners or approved lint configuration.
- [ ] Select coverage provider compatible with existing Vitest version and Node 24. Obtain dependency approval if needed.
- [ ] Define `coverage.include` and `exclude` explicitly; generate line/function/branch reports and establish baseline before enforcing limits.
- [ ] Propose thresholds for high-risk logic separately from presentation/UI primitives; document exceptions.

## 14.8–14.9 — kernel

- [ ] Preserve `node:test` for pure kernel tests; do not move them into jsdom.
- [ ] Review `src/lib/url.test.ts`, `auth-mode.test.ts`, `errors.test.ts`, `link-edit.test.ts`, `refresh-coordinator.test.ts`, `session-events.test.ts`, and adjacent implementations.
- [ ] Add missing edge cases for malformed/untrusted URLs, allowed schemes, empty/long inputs and aliases as defined by the client contract.
- [ ] Add error mapping cases for relevant 400/401/403/404/409/429/5xx and malformed Retry-After.
- [ ] Test single-flight concurrency, rejected refresh propagation, state reset and retry-once boundary.
- [ ] Ensure clocks, random IDs and globals are controlled; avoid real sleeps and network.

## 14.10–14.18 — integration/behavior matrix

- [ ] Review `src/test/setup.ts`, `src/test/render.tsx`, `src/test/handlers.ts` and `vitest.config.ts` for reset/isolation behavior.
- [ ] Each test gets a fresh QueryClient/router/auth state; handlers reset after each test; unexpected requests fail.
- [ ] Align `src/test/handlers.ts` with `docs/api-contract.md`; use exact wire fields and status/header semantics.
- [ ] Add scenarios to current specs or focused new specs, organized by feature rather than implementation detail.
- [ ] Auth: login success/invalid/blocked, `/me` hydration, unauthorized/forbidden, logout copy/semantics, bearer and cookie request properties.
- [ ] Refresh: concurrent 401s, exactly one refresh, retry once, terminal failure clears local session and routes safely.
- [ ] Shorten: client-side invalid URL makes no request; success/copy; 400/429 with Retry-After; 401/403, network/5xx.
- [ ] Links: loading/empty/error, pagination cursor and no duplicate rows, detail route and missing link.
- [ ] Edit/archive: partial PATCH contains only intended changed fields; dialog confirm/cancel; successful cache update; API failure state.
- [ ] Admin: role guard, user grid/search/pagination, user links, block/unblock, self-block prevention and force-archive; ensure no assertion passes without the intended request/outcome.
- [ ] Do not mock API module internals, React Query hooks, or component state.

## 14.19–14.21 — accessibility and client security

- [ ] Agree on WCAG 2.2 AA scope/criteria relevant to this SPA with product owner; do not claim legal conformance from an automated scan.
- [ ] Evaluate `@axe-core/playwright` and obtain explicit dependency approval before install.
- [ ] Select stable route/state scans: login/register, shorten form, links, dialogs, admin states as approved.
- [ ] Define treatment for `violations`, `incomplete`, and exceptions; no undocumented suppression.
- [ ] Write keyboard/focus manual checklist; record reviewer, browser, route, date and findings.
- [ ] Map OWASP WSTG client-side items to in-scope behavior; exclude server-only controls from frontend claims.
- [ ] Verify tokens/credentials are not written to logs, screenshots, traces, test output or committed fixtures; use fake test identities only.

## 14.22–14.28 — browser E2E and environment

- [ ] Make test base URL explicit; local E2E starts its own app; no accidental reuse of an unknown server in CI.
- [ ] Define fixtures for authentication/data setup and reliable teardown; isolate browser context per test.
- [ ] Ensure unique synthetic email/data; avoid reuse/collisions under `fullyParallel`.
- [ ] Review `e2e/admin-probe.spec.ts` safety guard and assertions; continue to target isolated disposable dev only under current policy.
- [ ] Add bearer E2E for agreed critical workflow against an approved isolated backend; capture HTML report and trace per existing `on-first-retry` behavior.
- [ ] Add cookie E2E only after backend cookie/refresh support is present and its request/response contract is agreed.
- [ ] Coordinate with DevOps on Staging readiness; collect documented readiness, health, access controls, data isolation, test users/secrets, cleanup and contact.
- [ ] Keep staging validation blocked until readiness plus explicit authorization; start with non-destructive smoke checks only.
- [ ] Never include admin probe, database writes, load test, destructive cleanup or production target in the Staging smoke job without a separate explicit approval.
- [ ] Decide Chromium required cadence and Firefox/WebKit cadence based on supported browser policy; pin browser installs and retain diagnostic artifacts.

## 14.29–14.30 — mutation and suite health

- [ ] Spike Stryker against a small pure-logic set; test Vitest runner and command-runner feasibility for `node:test` separately.
- [ ] Record mutation score, surviving/equivalent/no-coverage mutants, runtime and exclusions; seek dependency approval.
- [ ] Do not gate on mutation score before baseline and manual review.
- [ ] Measure duration per job, first-attempt pass rate, retried pass/flaky rate and failures by cause.
- [ ] Agree flake owner/SLA, retry interpretation and quarantine limit; ensure retries remain visible in reports.
- [ ] Repeat critical suites and run under supported parallel settings to expose order/global-state leaks.

## 14.31–14.32 — documentation and closeout

- [ ] Update `docs/testing.md` only after owner approval; make commands, actual gates, auth cases, browser policy and environment boundaries truthful.
- [ ] Replace any stale UAT/test claim with exact date, environment, authorization scope and run/SHA; do not paste hypothetical evidence.
- [ ] Update `AGENTS.md` only for durable contributor policy; update README only if developer onboarding commands change.
- [ ] For every completed story, paste command/report URL, result, run ID and SHA; mark external dependencies as blocked rather than complete.
- [ ] Verify only intended files changed; present diff for review. No commit/push/merge unless separately requested.
