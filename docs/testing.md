# Testing strategy — url-shortener-web

Goal: Testing pillar 9+. Not more files. Confidence that a user can log in, shorten, list and archive — in bearer and cookie mode.

Principle (Testing Library / Kent C. Dodds):
The more tests resemble the way the software is used, the more confidence they give.

## Trophy (this SPA, not an SSR app)

| Layer | Tool | When | What |
| --- | --- | --- | --- |
| Static | tsc -b, ESLint | every PR (npm run check) | types, boundaries |
| Unit / kernel | node --test (Node >= 24) | every PR (npm test) | mapApiError, parseRetryAfter, buildPatch, auth-mode, refresh-coordinator, session-events, formatClickCount, URL validation, link-edit |
| Integration | Vitest + jsdom + Testing Library + MSW | every PR | pages with MemoryRouter + QueryClient + mocked HTTP |
| E2E | Playwright | opt-in job when Java is up | one happy-path bearer, one cookie after refresh-loop fix |

Do not replace node --test with Vitest for kernel files. Two runners: kernel stays zero-DOM; integration needs a DOM.

Do not adopt Vitest Browser Mode or "E2E as the biggest slice". This app is a static SPA. Integration against MSW is the missing middle.

## Rules

1. Test behaviour, not internals. No useState assertions. Queries: getByRole / getByLabelText first (same as Playwright).
2. Do not mock src/lib/api.ts internals in integration tests. Mock the network with MSW using real contract names.
3. Each test gets its own QueryClient (retry: false, gcTime: 0) and MemoryRouter.
4. Playwright: isolated context per test; web-first expect(locator).toBeVisible(); no page.waitForTimeout. Unique emails from testInfo.testId.
5. Cookie-mode E2E only after the 401-refresh gate is (cookieMode || getRefreshToken()).
6. engines.node >= 24 and .nvmrc are part of the test contract. Node 20 cannot run *.test.ts.
7. Coverage floor is not a gate. Critical paths are.

## Integration pack (required for 9+)

One RTL + MSW file each:

- LoginPage: 401 mapped copy + id visible; 200 calls login.
- HomePage: invalid URL does not hit MSW; 201 shows shortUrl + Copy; 429 + Retry-After shows N.
- LinksPage: empty state; list + Load more when hasMore.
- LinkDetailPage: PATCH only filled fields; archive Dialog.
- AuthProvider cookie: /me 200 hydrates; /me 401 clears (after refresh-loop fix).

Helper src/test/render.tsx wraps QueryClientProvider + MemoryRouter + AuthProvider.

MSW handlers in src/test/handlers.ts speak the real contract (token, items, nextCursor, hasMore). Never invent accessToken.

## E2E pack

Keep e2e/happy-path.spec.ts (bearer).

Keep e2e/admin-probe.spec.ts (live admin probe, opt-in): needs Java with
`APP_ADMIN_EMAILS` + `E2E_EMAIL`/`E2E_PASSWORD` admin credentials; skips
without them. Every assert must fail if the named admin flow (pagination,
code search, block/unblock, force-archive, guard) does not happen — no
vacuous passes.

The probe writes real data (seeds `probe-*` users, shortens and archives
links) and the service has no delete-user endpoint, so it must target a
disposable dev backend only — the spec refuses non-local base URLs unless
`E2E_ALLOW_REMOTE` is set. Reset the dev database (mongosh, `url_shortener`)
when the noise matters:

```
db.users.deleteMany({ email: /^probe-(grid|block|nav)-/ })
db.short_urls.deleteMany({ originalUrl: /^https:\/\/(admin-probe|force-archive)\.example\.com\// })
```

Add e2e/cookie-session.spec.ts only when Java plus cookie refresh exist:

- VITE_AUTH_MODE=cookie
- login leaves no us.token in sessionStorage
- request has Cookie, no Authorization
- 401 on a call triggers one POST /api/v1/auth/refresh with empty body, then retry succeeds

CI: npm test + integration on every PR (no browsers). Playwright stays E2E_ENABLED or workflow_dispatch. A 9+ pillar needs that job green at least once against UAT, with run/sha pasted — not a permanent skip.

## Refuse

- Snapshot tests of Tailwind class strings
- Tests for cn() or shadcn primitives
- Mocking useQuery instead of HTTP
- A second API shape in MSW
- Coverage vanity on components/ui

## Definition of 9+

- Kernel 36+ green on Node 24 with engines declared
- Integration suite on every PR (RTL + MSW)
- Playwright happy-path has one pasted green run against Java (bearer)
- Cookie refresh loop tested at kernel and in one integration or E2E spec
- This file linked from AGENTS.md and README

## Execution order

1. Cookie 401-refresh gate + kernel test
2. package.json engines + .nvmrc
3. Vitest/jsdom + RTL + MSW + the five specs
4. UAT probe + one Playwright run pasted
5. Cookie E2E spec

---

## Epic 14 — Frontend Testing Excellence (Status: in progress)

Epic 14 extends the pillar-9 baseline with systematic gates, measurement, accessibility, security, mutation testing, and safe-environment policies. Current status at SHA `524d4ef`:

### Phase 0–3: Baseline, Gates, Kernel, Integration — **DONE**
- 14.1–14.3: Baseline portfolio, risk-to-test map, environment/safety policy (Staging pending)
- 14.4: CI adds lint + typecheck as required PR checks (job: "Lint + Typecheck + Test + Integration + Build")
- 14.5: Hygiene protections confirmed (no `.only` in src; admin-probe gated skip)
- 14.6: **Coverage artifact implemented** — Vitest (integration) + node:test (kernel) LCOV reports uploaded as `coverage-report` artifact (14-day retention); baseline captured; risk-based thresholds documented (not enforced)
- 14.7: Risk-based coverage policy drafted (kernel > auth/admin > pages; no global 100%)
- 14.8–14.9: Kernel deterministic (38/38); critical gaps covered (URL, auth-mode, errors, PATCH, refresh-coordinator, session-events, api-refresh)
- 14.10–14.11: Harness hardened (unhandled requests fail, cleanup+resetHandlers), MSW contract-aligned
- 14.12–14.18: Integration coverage present (login/session, auth modes, refresh, shorten/list/detail/edit/archive, admin)

### Phase 4: Accessibility, Security, E2E Fixtures — **PARTIAL**
- 14.19: Automated a11y — blocked pending `@axe-core/playwright` dep approval
- 14.20: Manual keyboard/focus review — **DONE** (Chromium; all core flows keyboard-operable; Radix Dialog focus trap/return verified)
- 14.21: Client security regression cases — **DONE** (OWASP mapping; XSS/javscript:/storage/tokens covered by existing tests)
- 14.22: Isolated Playwright fixtures — compliant (independent contexts, unique synthetic data, cleanup recipe, hard stop for unapproved remote)
- 14.23: Bearer E2E — **BLOCKED** (needs approved isolated/disposable backend + explicit auth)
- 14.24: Cookie E2E — **BLOCKED** (needs backend cookie refresh contract + availability)
- 14.25: Admin probe safety — compliant (dev-only, guarded, cleanup recipe documented)
- 14.26: Staging readiness — **BLOCKED** (DevOps must provide health/URL/version/synthetic data/isolation/secrets/scope/monitoring/rollback)
- 14.27: Staging smoke — **BLOCKED** (until 14.26 + explicit auth; non-destructive only)
- 14.28: Browser matrix — Chromium required baseline; Firefox/WebKit cadence pending approval

### Phase 5: Test Strength & Metrics
- 14.29: Mutation spike — **BLOCKED** (needs Stryker approval for node:test + Vitest)
- 14.30: Flaky/feedback metrics — baseline captured (kernel 38/38 ~190ms, integration 33/33 ~3.5s, 100% first-attempt); targets proposed; tracking formalization TBD

### Phase 6: Documentation & Closeout
- 14.31: Align docs — **THIS UPDATE** (env-safety-policy, risk map, metrics synced here)
- 14.32: Closeout — pending blocked deps resolution

### Environment & Safety Policy (from Epic 14.3)

| Environment | Allowed? | Constraints |
|---|---|---|
| Local (127.0.0.1/localhost/::1) | Yes | Unit/integration/E2E with local disposable backend; non-secret creds |
| Disposable dev backend (non-local, isolated) | Conditional | Only admin probe or 14.23 bearer E2E if explicitly approved; requires `E2E_ALLOW_REMOTE=1` |
| Staging | Blocked | Not ready. Blocked until DevOps readiness evidence + explicit auth; never admin probe |
| Production/UAT shared | No | Out of scope |

Guards:
- Admin probe: `requireDisposableTarget()` throws if non-local without `E2E_ALLOW_REMOTE`; `requireAdminEnv()` skips without `E2E_EMAIL/PASSWORD`
- Playwright: `forbidOnly: !!process.env.CI`; `retries: process.env.CI ? 2 : 0`; trace on-first-retry
- MSW: `onUnhandledRequest: "error"`; `afterEach` cleanup + `resetHandlers`

### Risk-to-Test Map (from Epic 14.2)

Critical journeys → layer → evidence:
- Login/session → Integration (RTL+MSW) — LoginPage/AuthContext specs
- Auth refresh → Kernel+Integration — refresh-coordinator + api-refresh + AuthContext
- Shorten → Integration+Kernel — HomePage spec + url.test.ts
- List/detail/paginate → Integration — LinksPage/LinkDetailPage
- Edit/archive → Integration — LinkDetailPage specs
- Admin → Integration+E2E probe — UsersPage/UserLinksPage + admin-probe
- Cookie auth → Integration+E2E (blocked) — Auth boundary tests; 14.24 blocked
- Accessibility → Integration+Manual — RTL semantic queries + 14.20 review + 14.19 axe (pending)
- Security → Kernel+Integration — OWASP mapping (14.21), kernel URL validation

### Flaky-Test & Feedback Metrics (from Epic 14.30)

| Layer | Tests | Duration | First-Attempt Pass | Target |
|---|---|---|---|---|
| Kernel | 38 | ~190ms | 100% | ≥99% |
| Integration | 33 | ~3.5s | 100% | ≥98% |
| E2E | 2 | Not run (env) | N/A | ≥95% (when run) |

Tracking: CI job logs + Playwright HTML report. No dedicated dashboard yet.

---

## CI Gates (Epic 14.4)

Required PR check job: **Lint + Typecheck + Test + Integration + Build**

```
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
```

E2E opt-in via `vars.E2E_ENABLED` or `workflow_dispatch`.

---

## Coverage (Epic 14.6)

- **Artifact**: `coverage-report` uploaded on every PR (14-day retention)
  - Vitest/v8: `coverage/` (HTML, LCOV, JSON, text) — integration layer
  - Node `node:test`: `coverage/kernel.lcov` (LCOV) — kernel layer (`--experimental-test-coverage`)
- **Baseline** (recorded at SHA `4bf1925`):
  - Integration (Vitest): Statements ~78%, Branches ~73%, Functions ~77%, Lines ~82%
  - Kernel (node:test): Not yet measured in CI (experimental flag); tracked as accepted gap
- **Risk-based thresholds** (documented, **not enforced**):
  - Kernel (src/lib): line ≥90%, branch ≥80%
  - Auth/session: line ≥85%, branch ≥80%
  - Admin: line ≥80%, branch ≥75%
  - Pages: line ≥70%, branch ≥65%
- **Kernel gap**: `node:test` suite uses experimental coverage flag; no threshold enforcement
- **Next step**: Agree file-level baselines + thresholds in follow-up PR; then add `vitest --coverage --threshold` or similar gate.

---

## Browser Compatibility Matrix (Epic 14.28)

**Supported browsers:**
- **Chromium** — required per PR (runs in `check` job via `npm run e2e` when `E2E_ENABLED=true`)
- **Firefox** — nightly + pre-release (runs in `nightly.yml` workflow)
- **WebKit (Safari)** — nightly + pre-release (runs in `nightly.yml` workflow)

**Policy:**
- Product claims **Chromium support** as baseline.
- Firefox and WebKit runs are non-blocking for PRs; they run in a separate nightly workflow (`nightly.yml`, daily at 02:00 UTC + `workflow_dispatch`).
- Nightly workflow runs all three browsers via matrix strategy; failures upload traces as artifacts (7-day retention).
- If a regression is found only in Firefox/WebKit, it is triaged but does not block PR merge unless it affects Chromium.
- To add a browser to required PR checks: explicit owner approval + CI cost analysis.

**Playwright config:** Three projects defined (`chromium`, `firefox`, `webkit`) using `@playwright/test` devices.

---

## Flaky-Test & Feedback Metrics (Epic 14.30)

**Collection:** `scripts/ci-metrics.js` extracts from latest successful CI run:
- Duration per layer (lint, typecheck, kernel, integration, build)
- Pass/fail/skip counts per layer
- First-attempt pass rate per layer
- Failure category classification (type, lint, api, timeout, assertion, test)

**Artifact:** `ci-metrics.json` generated locally (can be uploaded as CI artifact in follow-up)

**Baseline** (from recent runs):
| Layer | Tests | Duration | First-Attempt Pass | Target |
|---|---|---|---|---|
| Kernel | 38 | ~190ms | 100% | ≥99% |
| Integration | 33 | ~3.5s | 100% | ≥98% |
| E2E | 2 | Not run (env) | N/A | ≥95% (when run) |

**Ownership & SLA:**
- **Owner**: Frontend team lead
- **Remediation SLA**: 1 sprint (2 weeks) for any flaky test (retry-passed but first-attempt failed)
- **Escalation**: If flaky rate >1% for 2 consecutive sprints → dedicated investigation spike

**Tracking:** CI job logs + Playwright HTML report. No dedicated dashboard yet — `scripts/ci-metrics.js` provides local analysis.