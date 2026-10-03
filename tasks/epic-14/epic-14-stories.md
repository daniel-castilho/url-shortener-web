# Epic 14 — Stories

Stories are ordered for continuous implementation. A story is done only when its acceptance criteria and the epic Definition of Done are evidenced. **No story itself authorizes remote testing or changes to CI/dependencies.**

| # | Story | Depends on | Acceptance |
| --- | --- | --- | --- |
| 14.1 | Re-baseline the test portfolio | — | Inventory actual scripts, suites, skips, runs and risk areas at the implementation start; record local/CI evidence separately and identify unverified claims. |
| 14.2 | Approve the risk-to-test map | 14.1 | Critical journeys and failure modes have named owner, test layer, expected evidence and explicit accepted gaps. |
| 14.3 | Publish environment and test-safety policy | 14.1 | Documents local, disposable-dev and Staging boundaries, secrets/data rules, destructive-test restrictions and approval flow. Staging marked pending until DevOps readiness evidence exists. |
| 14.4 | Make existing PR quality checks authoritative | 14.1, 14.2 | A regular PR gate runs kernel, integration, lint, typecheck and build; job name matches actual work; failure blocks the check. Changes require approval. |
| 14.5 | Add test hygiene protections | 14.4 | CI rejects focused tests and critical unapproved skips; async failures are not swallowed; all exceptions have visible reason/owner. |
| 14.6 | Establish coverage baseline | 14.1, 14.4 | Coverage includes intended production files, records line/function/branch baseline and outputs a CI artifact. Required dependency approval is obtained if a provider package is needed. |
| 14.7 | Set risk-based coverage policy | 14.2, 14.6 | Thresholds are approved by domain/risk, exclusions justified, and initial limits do not reward coverage of generated/UI primitive code. |
| 14.8 | Harden kernel test determinism | 14.1, 14.4 | Kernel tests are independent, fast, repeatable and do not require DOM/network/external state; Node runtime contract is explicit. |
| 14.9 | Close critical kernel behavior gaps | 14.2, 14.8 | URL validation, auth-mode selection, error mapping, patch construction, session events and refresh coordination cover important boundary/negative/concurrent cases from the risk map. |
| 14.10 | Harden RTL/MSW test harness | 14.4 | Each test receives fresh QueryClient/router; cleanup and handler reset are reliable; unhandled requests fail; tests pass independently and in supported parallel mode. |
| 14.11 | Align MSW fixtures with API contract | 14.2, 14.10 | Request/response/error/header fixtures use exact contract names and documented semantics; drift or invented fields are removed; contract owner reviews changes. |
| 14.12 | Verify login and session states | 14.11 | RTL/MSW covers success, invalid credentials, blocked account, loading, `/me` hydration/failure, logout behavior, and user-visible routing/copy. It does not claim backend revocation unless provider proves it. |
| 14.13 | Verify bearer and cookie auth behavior | 14.9, 14.10, 14.11 | Supported modes are tested at correct boundary: authorization/cookie request behavior, token/storage expectations, unauthenticated/expired behavior and mode-specific cases. Tests follow actual backend contract. |
| 14.14 | Prove refresh coordination and recovery | 14.9, 14.13 | Concurrent 401s share one refresh; successful refresh retries once; failures hard-logout as specified; skipped auth paths do not recurse. Kernel and integration evidence are linked. |
| 14.15 | Verify shorten-link form and API outcomes | 14.11 | Invalid URL does not call API; success displays/copies canonical short URL; 400, 401/403, 429/Retry-After and network failure render correct behavior. |
| 14.16 | Verify link list and detail states | 14.11 | Empty/loading/error/success/pagination/detail behavior is covered with realistic contract responses; pagination does not duplicate or lose records. |
| 14.17 | Verify link edit/archive semantics | 14.11, 14.16 | PATCH sends only changed/filled fields; confirmation/cancel paths work; API failure is not shown as success; archive state updates relevant query data. |
| 14.18 | Verify admin guards and actions | 14.11 | User/anonymous access guard, admin listing/pagination/search, user links, block/unblock/self-block and force-archive behaviors are covered at RTL/MSW boundary. No backend authorization claim from UI-only tests. |
| 14.19 | Add automated accessibility checks | 14.10 | Selected routes and dynamic states have axe checks against the approved WCAG tags; violations fail the test; known exclusions have justification and manual counterpart. Dependency approval required if adding axe. |
| 14.20 | Add manual keyboard/focus review | 14.2, 14.19 | Checklist/evidence covers keyboard-only navigation, visible/orderly focus, dialog focus/return, Escape, errors/labels and a representative assistive-technology review. Findings are tracked. |
| 14.21 | Add client-side security regression cases | 14.2, 14.11, 14.13 | Prioritized OWASP client-side risks are mapped to automated/manual cases: DOM/HTML injection surfaces, unsafe redirects, browser storage exposure, link handling and token leakage in logs/artifacts. No penetration testing of remote hosts. |
| 14.22 | Define isolated Playwright fixtures and data | 14.3, 14.4 | Fixtures provide independent browser context, unique synthetic identities/data, cleanup strategy, non-secret credentials, clear local base URL and hard stop for unapproved remote targets. |
| 14.23 | Add critical bearer E2E journey | 14.22 | One end-to-end browser journey covers the agreed highest-risk bearer flow against an approved isolated/disposable backend; result and trace/report are reproducible. No shared or production data. |
| 14.24 | Add cookie-session E2E journey | 14.13, 14.22 | Once backend cookie refresh behavior is available, verifies cookie transmission, no unintended sessionStorage token, one refresh on expiry and successful retry/logout in an approved isolated environment. If dependency unavailable, story remains blocked, not skipped as complete. |
| 14.25 | Keep admin probe safe and non-vacuous | 14.3, 14.18, 14.22 | Probe asserts every advertised flow and only operates against isolated/disposable dev; refusal behavior prevents unsafe targets. No staging/prod probe unless user separately changes policy and effects are reviewed. |
| 14.26 | Establish Staging readiness contract | 14.3 | DevOps supplies readiness/health, URL/origin, backend version, synthetic test account/data plan, isolation/reset, secrets, allowed test scope, monitoring/contact and rollback/cleanup expectations. Staging remains blocked until evidence and approval. |
| 14.27 | Add approved Staging smoke gate | 14.26 | After ready + explicit authorization only, runs agreed non-destructive smoke checks against Staging; stores run/SHA; never runs the destructive admin probe. If Staging is not ready/approved, story stays blocked. |
| 14.28 | Define browser compatibility matrix | 14.2, 14.4 | Chromium required baseline; Firefox/WebKit cadence and support claims are approved; test install/runtime versions are pinned/reproducible and CI cost is recorded. |
| 14.29 | Evaluate and baseline mutation testing | 14.6, 14.8, 14.9 | A bounded spike evaluates Stryker compatibility for Node `node:test` and Vitest suites; reports scope, baseline, performance and equivalent-mutant policy. No dependency or blocking threshold without approval. |
| 14.30 | Establish flaky-test and feedback metrics | 14.4, 14.5, 14.22 | Reports duration, first-attempt pass, retry-passed/flaky count and failure category by layer; owners and remediation SLA are approved; retry cannot hide red first attempts. |
| 14.31 | Align testing documentation | 14.3, 14.26, 14.27, 14.30 | `docs/testing.md`, AGENTS/developer guidance and relevant README sections reflect actual gates, safe environments, Staging pending/ready state and evidence requirements. No UAT claim without a real authorized run. |
| 14.32 | Close epic with evidence review | All applicable stories | DoD contains exact commands, local/CI runs and SHAs; blocked external dependencies remain explicitly blocked; owner approves the 5/5 decision. |

## Story boundary rules

- Stories 14.4 and 14.5 change the build gate only after repository-owner approval. Do not bundle unrelated product code changes.
- Stories 14.6, 14.19 and 14.29 may require new packages. Follow `AGENTS.md`: seek explicit approval before installation/removal.
- Stories 14.23–14.27 depend on environment readiness and/or explicit authorization. They cannot be closed with a skipped job or a mock-only test misrepresented as full-stack E2E.
- 14.25 is explicitly limited to isolated disposable dev under current policy. It is distinct from non-destructive Staging smoke checks.
- A provider contract test/Pact is optional implementation detail under 14.11/14.26 only if frontend/backend owners agree; never introduce provider changes in this frontend epic.
