# Epic 14.3 — Environment & Test-Safety Policy

Status: Draft for owner review (append to docs/testing.md after approval). Staging is **pending**.

## Boundaries
| Environment | Allowed? | Constraints |
|---|---|---|
| Local (127.0.0.1/localhost/::1) | Yes | Safe for unit/kernel/integration; E2E with local disposable backend allowed with non-secret creds |
| Disposable dev backend (non-local, isolated) | Conditional | Only for admin probe or 14.23 bearer E2E if explicitly approved; requires E2E_ALLOW_REMOTE=1; must have no shared data/prod access |
| Staging | Blocked | Not ready. 14.26–14.27 blocked until DevOps readiness evidence + explicit authorization; never run destructive admin probe there |
| Production/UAT shared | No | Out of scope for Epic 14 test runs |

## Rules for test data
- Synthetic only (no real PII, no prod accounts/tokens)
- Each Playwright context gets unique identities (e.g. probe-<type>-<ts>@example.com)
- Cleanup by prefix/recipe (see docs/testing.md: mongosh cleanup for probe users/links)
- No API delete-user exists; probe is inherently destructive — treat as dev-only
- Admin probe seeds: users probe-grid-*, probe-block-*, probe-nav-*; links https://admin-probe.example.com/<ts>, https://force-archive.example.com/<ts>

## Guards
- admin-probe.spec.ts: requireDisposableTarget() refuses remote without E2E_ALLOW_REMOTE; requireAdminEnv() skips if E2E_EMAIL/PASSWORD missing
- Playwright forbidOnly: enabled in CI; never commit test.only/it.only/describe.only
- Unhandled MSW requests must fail (onUnhandledRequest:error)
- No test depends on prior test's state; fresh providers/handlers per test

## Secrets
- Never commit .env or real tokens; .env.* gitignored
- E2E creds via env (secrets in CI); no hardcoded passwords in committed code (probe uses SEED_PASSWORD constant only for synthetic accounts)
- Artifacts (Playwright trace/screenshots/HTML) must not leak session tokens; review before upload

## Approval flow
1. Change boundary (local/disposable/staging) → document in PR + get owner approval
2. Add/modify destructive test → explicit approval; update this policy + docs/testing.md
3. CI gate changes (14.4+) → repository owner approval (pre-approved per plan)
4. New dependencies (axe/Stryker/etc.) → explicit approval per AGENTS.md

## Evidence requirements
- Commands, exit codes, first-attempt result, retry result if any, SHA (81e0df3 baseline), Node 24
- For E2E: base URL, env vars presence (not values), report/trace path
- Blocked stories must remain blocked (not "skipped complete")

## Staging pending
- No Staging smoke authorized. DevOps must provide (14.26): health/readiness, URL/origin, backend version, synthetic data plan, isolation/reset, secrets, allowed scope, monitoring/contact, rollback/cleanup. Until then, staging ineligible for Epic 14 browser runs.
