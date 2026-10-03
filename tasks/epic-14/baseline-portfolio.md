# Epic 14.1 — Baseline Test Portfolio

Baseline SHA: 81e0df33c664b4391a9ad3d8ed3ddc2355ae7f61
Captured: Sat Oct 03 2026

## 1. Git state
- Branch: main
- Up to date with origin/main
- Untracked: tasks/epic-14/ (5 files)
- Recent commits: 81e0df3 (head), 28a836c, 47891aa, 3d70838, 231cd9c

## 2. Scripts (package.json)
```json
"dev": "vite",
"build": "tsc -b && vite build",
"preview": "vite preview",
"lint": "eslint .",
"test": "node --test 'src/lib/*.test.ts'",
"test:integration": "vitest run",
"e2e": "playwright test",
"typecheck": "tsc -b --pretty",
"check": "npm run lint && npm run typecheck && npm run build",
"format": "prettier --write ."
```

Node engines: >=24

## 3. CI (.github/workflows/ci.yml)
- Job check (required): runs npm ci, npm test (kernel), npm run test:integration, npm run build
- No lint/typecheck in check job (only build runs tsc -b implicitly; typecheck is separate script)
- Job e2e (opt-in): runs only if `vars.E2E_ENABLED == 'true' || github.event_name == 'workflow_dispatch'`; installs chromium; needs check
- forbidOnly gated by CI env

## 4. Test suites
### Kernel (node:test)
- src/lib/analytics.test.ts
- src/lib/api-refresh.test.ts
- src/lib/auth-mode.test.ts
- src/lib/errors.test.ts
- src/lib/link-edit.test.ts
- src/lib/refresh-coordinator.test.ts
- src/lib/session-events.test.ts
- src/lib/url.test.ts

### Integration (Vitest + jsdom + RTL)
- src/context/AuthContext.spec.tsx
- src/pages/HomePage.spec.tsx
- src/pages/LinkDetailPage.spec.tsx
- src/pages/LinksPage.spec.tsx
- src/pages/LoginPage.spec.tsx
- src/pages/admin/UserLinksPage.spec.tsx
- src/pages/admin/UsersPage.spec.tsx

### E2E (Playwright)
- e2e/admin-probe.spec.ts (destructive writes; guard: requires local/disposable target + admin creds; test.skip() without env)
- e2e/happy-path.spec.ts

## 5. Config
- Vitest: jsdom, include src/**/*.spec.tsx, setupFiles ./src/test/setup.ts, path alias @/
- Playwright: forbidOnly in CI only; retries CI=2 local=0; traces on-first-retry; Chromium only; webServer only when PLAYWRIGHT_BASE_URL unset
- TS: strict, noEmit, target ES2022, bundler moduleResolution
- MSW: server listen onUnhandledRequest:error; cleanup + reset afterEach; randomUUID polyfill

## 6. Focus/skip state
- e2e/admin-probe.spec.ts:38 has `test.skip()` (when env missing) — conditional skip is expected per safety policy
- grep for .only/.skip in src/e2e: only the conditional skip above found. No accidental focus/skip in application tests.

## 7. Observed environment
- No E2E-related env vars set (E2E_EMAIL/PASSWORD/PLAYWRIGHT_BASE_URL/ALLOW_REMOTE not present)
- Repo state clean except untracked tasks/epic-14/

## 8. Baseline notes (14.1 evidence)
- Kernel 8 files; integration 7 specs; E2E 2 specs
- CI gates: kernel + integration + build (no lint/typecheck as separate required check in current CI)
- E2E is opt-in
- Admin probe has explicit disposable-target guard and refuses remote without E2E_ALLOW_REMOTE
