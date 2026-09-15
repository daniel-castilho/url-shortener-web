# Changelog

All notable changes to URL Shortener Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project intends to follow [Semantic Versioning](https://semver.org/).
See `AGENTS.md` → *Releases & tagging* for the release policy.

## [Unreleased]

### Fixed

- **Rehydrate race on private routes** — F5 on `/links` (or `/links/:id`) bounced
  to `/login` while the session was valid: `Private` read `isAuthenticated` on
  first paint, before the `AuthProvider` effect rehydrated it. Bearer mode now
  seeds `user`/`token` state synchronously from `sessionStorage`
  (`useState` lazy initializers); cookie mode gains a `status:
  "loading" | "ready"` flow — `Private` renders "Carregando" while `/me` is in
  flight instead of navigating, and a `/me` `404` (endpoint missing) keeps the
  route instead of bouncing. Regression specs added (bearer first-paint without
  login form, cookie loading/no-bounce, `/me` 404).

### Added

- **Security headers on the SPA document (Epic 11)** — Caddy (`@tls` matcher HSTS gating) and NGINX (commented TLS block) ship `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: off`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` on the SPA document; HSTS (`max-age=31536000; includeSubDomains; preload`) gated to TLS-terminated blocks only. Caddy uses `@tls protocol https` matcher; NGINX provides commented template for TLS server block. `style-src 'unsafe-inline'` justified in deploy.md (React inline style attrs; build hashes cover `'self'`). Headers scoped to SPA document only — short-code proxy and API paths pass through Java headers untouched. `docs/deploy.md` extended with header provenance, CSP justification, and HSTS placement rules.

- **Integration tests (Epic 10)** — Vitest + jsdom + Testing Library + MSW
  suite on `src/**/*.spec.tsx` (`npm run test:integration`), wired into CI after
  `npm test`. Specs: LoginPage (401 mapped copy + request id, 200 hydrates),
  HomePage (invalid URL never hits MSW, 201 shortUrl + copy, 429 Retry-After),
  LinksPage (empty state, list + Mais), LinkDetailPage (PATCH only filled
  fields, archive Dialog), cookie-mode AuthProvider (/me 200 hydrates without
  Authorization/cookie leakage, /me 401 → refresh 401 → cleared → /login).
  MSW handlers speak the real contract (`token`, `refreshToken`, `userId`,
  `email`, `name`, `items`, `nextCursor`, `hasMore`, `shortUrl`, `originalUrl`,
  `clickCount`); kernel `node --test` stays the default `npm test`.

- **Cookie-mode refresh loop (hotfix)** — `401` on any non-auth endpoint now
  triggers the single-flight refresh in cookie mode (`cookieMode ||
  Boolean(getRefreshToken())`), so the `refresh_token` cookie is sent instead of
  dropping to "Sessão expirada"; retry once, hard-logout on failure stays.
  Kernel test proves the gate invokes the coordinator. `engines.node >= 24` +
  `.nvmrc` declared; `api.ts` imports carry `.ts` specifiers so the kernel
  suite can load the fetch boundary.

- **Hard session (Epic 9)** — dual-mode auth (`VITE_AUTH_MODE=bearer|cookie`); fetch always `credentials: "include"`; `Authorization` header only in bearer mode; refresh with empty body in cookie mode; `GET /api/v1/auth/me` rehydrate on mount; `POST /api/v1/auth/logout` call on logout; AuthProvider mount handles 200/401/404 in cookie mode; kernel tests for mode branching; `twelve-factors.md` Decision 1 updated to dual-mode.

- **Quality gate (Epic 2)** — kernel test suite with `node --test`
  (`mapApiError`, `session-events`, refresh single-flight coordinator);
  `X-Request-Id` header (UUID per attempt) on every request including refresh,
  carried on `ApiError.requestId` and shown in error UI; `ErrorBoundary` around
  routes with PT-BR fallback + "Tentar de novo"; `HomePage` now maps API errors
  like the other pages; CI runs `npm test` before build.
- **Hard-logout bridge** — failed refresh now clears React context + Query cache + navigates to `/login`; successful refresh syncs context token/user via session-events notifier

## [Unreleased]

### Added

- **Shorten flow as product (Epic 3)** — auth-gated optional fields on Home
  (`customAlias` + `ttlSeconds` only when logged in; anonymous posts
  `originalUrl` only), client-side URL validation before fetch
  (`isValidHttpUrl`), `Retry-After` parsing on `429` ("Muitas tentativas.
  Tente em Ns."), copy-to-clipboard on success with visible failure feedback,
  and the last shortened URL stays on screen.

## [Unreleased]

### Added

- **Links library (Epic 4)** — cursor-paginated list (`useInfiniteQuery`,
  `Mais` button, page 1 preserved while fetching), empty state with Home link,
  detail page with contract fields (`shortUrl`, `originalUrl`, `clickCount`,
  `expiresAt`, `title`, `tags`, archived badge) + back link, `404` error
  mapping, edit form sending PATCH with only filled fields (`buildPatch`,
  tested) and invalidating list + detail, archive marks in place
  (idempotent — disabled once archived) and invalidates both queries.

## [Unreleased]

### Added

- **Shell & design system (Epic 5)** — shared header on every route
  ("Tyny URL" product name + consolidated nav + user greeting + Sair);
  shadcn primitives `Input`, `Label`, `Card`, `Dialog` (deps:
  `@radix-ui/react-label`, `@radix-ui/react-dialog` — sanctioned); all four
  forms migrated to `Label`+`Input` primitives; shared `EmptyState` component;
  links list as card rows (id, originalUrl, clickCount); detail as a labeled
  field Card; archive behind a confirmation Dialog with inline "Salvo." /
  "Arquivado." feedback (one feedback pattern — persistent inline text, no
  toast library); mobile-first verified at 375px (no horizontal overflow, nav
  wraps, full-width fields).

## [Unreleased]

### Added

- **Edge deploy (Epic 6)** — routing law documented
  ([`docs/deploy.md`](docs/deploy.md)): API prefixes + short codes → Java,
  SPA routes + fallback → `dist/`, short-code matcher
  `^/[A-Za-z0-9_-]{1,64}$` with reserved-path exclusions; UAT
  [`deploy/caddy/Caddyfile`](deploy/caddy/Caddyfile) (env-driven
  `SITE_ADDRESS`/`JAVA_UPSTREAM`); prod [`deploy/nginx/spa.conf`](deploy/nginx/spa.conf)
  (Blue/Green root swap, exact/`^~` beats the short-code regex); README Deploy
  section (preview/UAT/prod, `VITE_API_BASE_URL` empty same-origin); release
  workflow on tag `v*` uploading `dist/` as an artifact.

## [Unreleased]

### Added

- **E2E trust layer (Epic 8)** — Playwright runner (`@playwright/test`
  devDependency, `npm run e2e`), `playwright.config.ts` (testDir `e2e/`,
  `baseURL` from `PLAYWRIGHT_BASE_URL` or the local preview server on
  `127.0.0.1:5173`, `webServer` = `npm run build` + `vite preview` proxying
  `/api`/`/actuator` to Java like dev); one happy-path spec
  (`e2e/happy-path.spec.ts`) covering authenticate (register with generated
  creds or login from env `E2E_EMAIL`/`E2E_PASSWORD`), shorten, list, detail
  and archive via Dialog confirm — role/label selectors first, no committed
  secrets; CI gains an opt-in `e2e` job (`if: vars.E2E_ENABLED == 'true' ||
  workflow_dispatch`) that stays skipped by default so a missing UAT never
  red-fails main; default PR gate remains `npm test` (node --test, no
  Chromium).

## [Unreleased]

### Added

- **Analytics panel (Epic 7)** — clickCount totals formatted (pt-BR) on list
  and detail; series panel on detail with CSS bar chart (no external lib,
  lazy-loaded chunk); `formatClickCount` and `toBarPoints` pure helpers
  tested; `GET /api/v1/urls/{id}/clicks?unit=day` consumed with exact DTO
  names (`ClickAnalyticsResponse`, `ClickSeriesPoint`); lazy-loaded chart
  chunk (`React.lazy` + `Suspense` on detail only).

## [0.1.0] - 2026-09-13

### Added

- **Auth core** — reactive session via `AuthContext` (`user`, `token`,
  `login`, `logout`), `sessionStorage` persistence, single-flight token
  refresh on `401` with hard logout, and error mapping (`ApiError` +
  `mapApiError`). Login/register forms + `/links` shell. See
  `docs/twelve-factors.md` for the three auth decisions.
- **CI workflow** — minimal `.github/workflows/ci.yml` running `npm ci` +
  `npm run build`.
- **Documentation suite** — `docs/api-contract.md` (captured from the backend
  `/v3/api-docs`), `docs/coding-standards.md`, ADRs
  `0001-hexagonal-frontend` and `0002-result-type-errors`, and this changelog.
- **Tooling** — ESLint flat config with module boundary rules
  (`eslint.config.js`), `.prettierrc`, and `package.json` scripts
  (`check`, `lint`, `typecheck`, `format`).

### Changed

- Removed `bootstrap.sh` (dev bootstrap documented in `README.md`).

### Fixed

- (none)

---

## Roadmap (upcoming)

- Extract `src/modules/url-shortener/**` into the hexagonal target shape
  (ADR 0001), with `Result<T, E>` use cases (ADR 0002).
- Add node-built-in test suite (`node --test`, `--experimental-strip-types`).
- Cursor "load more" on `/links`, PATCH form (title, tags, utm, `expiresAt`).
- Domain claim screens; click-analytics charts.
- Cookie/HttpOnly session via a thin BFF (next step for production exposure).
