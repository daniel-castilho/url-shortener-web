# Changelog

All notable changes to URL Shortener Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project intends to follow [Semantic Versioning](https://semver.org/).
See `AGENTS.md` → *Releases & tagging* for the release policy.

## [Unreleased]

### Added

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
