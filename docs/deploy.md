# Deploy — Edge routing law (Caddy / NGINX)

The SPA ships as static files behind the same host as the Java API. This
document is the single source of truth for edge routing.

Production edge of record (since the frontend CD landed): **single-host Docker
Compose + Caddy** — the backend's `deploy/compose/docker-compose.prod.yaml`
deploys the Caddyfile that implements the rules below and serves the SPA from
`${FRONTEND_DIR}/current` (read-only bind mount). `deploy/caddy/Caddyfile`
(UAT) and `deploy/nginx/spa.conf` (bare-metal Blue/Green alternative)
implement the same rules.

## Routing law

| # | Request | Goes to | Rule |
| :-- | :--- | :---- | :--- |
| 1 | `/api*` | Java API | reverse proxy (prefix) |
| 2 | `/actuator*` | Java API | reverse proxy (prefix) |
| 3 | `GET /{id}` where `id` looks like a short code | Java API (`302` redirect) | short-code matcher — **never** `index.html` |
| 4 | `/assets/*` and other static files | SPA `dist/` | static file server |
| 5 | `/`, `/login`, `/register`, `/links`, `/links/*` and unknown UI paths | SPA `dist/index.html` | `try_files ... /index.html` fallback |

Rules are evaluated in order: API prefixes first, then the short-code matcher,
then the SPA. The short-code path must NOT fall through to `index.html` — a
`try_files` fallback that catches it would break redirects (the SPA does not
redirect; the backend `GET /{id}` answers `302`/`404`/`410`/`429`).

### Production deviation: actuator tier at the edge (owner-approved)

The Compose production Caddyfile narrows rule 2. The edge proxies **only** the
actuator trio public by default (`/actuator/health/liveness`,
`/actuator/health/readiness`, `/actuator/info`) and answers `404` for
everything else under `/actuator*` — the backend remains the authority for the
role-gated tiers (Prometheus scrapes internally, never through the edge).
Approved for the first production cut (2026-10-07) and enforced by
`scripts/smoke-web.sh` (liveness 200, `/actuator/env` → 404).

## Short-code matcher

The backend does not document the id alphabet. The matcher below is derived
from the API contract: the example id `vE1GpYK`
(`docs/api-contract.md` → *Redirect*) is base62-like, and
`ShortenRequest.customAlias` allows `^[a-zA-Z0-9-_]*$`. A defensive upper
bound of 64 characters covers both generated ids and custom aliases.

```
^/[A-Za-z0-9_-]{1,64}$
```

Exclusions (single-segment SPA/API paths that also match the regex):

```
/login
/register
/links
/api
/actuator
```

Both edge configs encode the regex **and** the exclusions; neither may serve
`index.html` for a matching path.

## SPA routes vs short-code surface

- SPA routes: `/`, `/login`, `/register`, `/links`, `/links/*`.
- Static: `/assets/*` (Vite hashed bundles) plus `/index.html`, `/favicon*`,
  `/vite.svg`.
- Everything else that is a single path segment of `[A-Za-z0-9_-]{1,64}` and
  not in the exclusion list is treated as a short code and proxied to Java.

## Environment

- `VITE_API_BASE_URL` stays **empty** in UAT and prod (same-origin `/api`).
  `.env.example` documents this; a hardcoded `localhost:8080` in a prod build
  violates the law (see AGENTS.md → *Backend parity*).
- Build artifact: `npm run build` → `dist/`. The edge serves `dist/` directly.

## Edge configs

- **UAT (Caddy):** `deploy/caddy/Caddyfile` — env-driven (`SITE_ADDRESS`,
  `JAVA_UPSTREAM`), `handle` blocks in law order, `file_server` + `try_files`
  fallback for the SPA.
- **Prod, current target (Compose + Caddy):** the backend repo's
  `deploy/compose/docker-compose.prod.yaml` + `deploy/compose/Caddyfile` —
  same law order, apex `tyny.ca` → permanent `308` to `www`, SPA root
  `${FRONTEND_DIR}/current`, SPA-only security headers (HSTS gated by
  `@tls protocol https`), actuator deviation above. CMS for it:
  `docs/release-runbook.md` in `url-shortener-service` → *Edge routing &
  static frontend*.
- **Prod (NGINX, bare-metal Blue/Green alternative):** `deploy/nginx/spa.conf`
  — exact/prefix locations for API and reserved SPA paths (exact and `^~`
  prefixes win over the regex location, which neutralizes the collision),
  regex location for short codes, and `location /` with
  `try_files $uri $uri/ /index.html`. The `root` is commented for Blue/Green
  swaps (`spa-blue` ↔ `spa-green`).

## Local preview

```sh
npm run build
npm run preview        # vite preview serves dist/ on :4173 (SPA only, no /api)
# or, with the routing law:
caddy run --config deploy/caddy/Caddyfile   # needs dist/ in the Caddyfile root
```

`vite preview` does not proxy `/api` — use it for SPA-only checks; use the
Caddy config (or the UAT kit) when you need the routing law locally.

## Security headers

The SPA document (`index.html` and all static assets) is served with the
following browser security headers. They mirror the Java API's `SecurityConfig`
(`url-shortener-service/src/main/java/.../SecurityConfig.java`) and add
SPA-specific hardening (`Permissions-Policy`, `X-DNS-Prefetch-Control`,
`frame-ancestors`, `base-uri`, `form-action`).

| Header | Value | Notes |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing (Java: `contentTypeOptions`). |
| `X-Frame-Options` | `DENY` | Prevents framing (Java: `frameOptions.deny()`). |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Java default. |
| `X-DNS-Prefetch-Control` | `off` | SPA hardening (not sent by Java). |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Locks down powerful features (not sent by Java). |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | Mirrors Java CSP plus `frame-ancestors 'none'` (matches `X-Frame-Options`), `base-uri`, `form-action`. `style-src 'unsafe-inline'` is retained for Java parity and as a safety net for inline style attributes written by React components (e.g. `ClicksChart` bar widths); the production build ships only hashed `/assets/*` CSS/JS, so `style-src 'self'` covers the build — tightening to `'self'` is tracked as future debt. `X-XSS-Protection` is omitted (deprecated, ignored by modern browsers; Java sends `1; mode=block` but it has no effect). |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | **Only on TLS-terminated blocks** (1y, includeSubDomains, preload — matches the Java API). In Caddy: gated by `@tls protocol https` matcher inside the SPA handle. In NGINX: the snippet owns no TLS listener; the value is provided as a commented template — uncomment in the TLS server block that includes this snippet, or set at the LB that terminates TLS. |

### Why CSP only on the SPA

The Java API sets its own CSP on `/api*` and `/{id}` responses. The edge does **not** inject CSP on the short-code proxy location (`handle @shortcode` / `location ~ regex`) — those responses must remain pure Java 302/404/410/429 with the API's own headers. Double CSP would be redundant and could conflict.

### Reserved paths must match App.tsx

Both edge configs exclude `/login`, `/register`, `/links` from the short-code regex. These MUST stay in sync with `src/App.tsx` single-segment routes (`/login`, `/register`, `/links`). If a new single-segment route is added to the SPA, it MUST be added to the exclusion list (`not path ...` in Caddy; exact/prefix locations in NGINX) or the SPA route will be proxied to Java as a short code. Multi-segment routes (e.g. `/links/:id`) cannot match the single-segment regex and need no exclusion.

## Release artifacts

A pushed tag `vX.Y.Z` triggers `.github/workflows/release.yml`, which runs the
full gate (`npm test` → `npm run test:integration` → `npm run build`), then
produces and publishes three files (artifact `release-<tag>`, 30-day retention,
plus a GitHub Release):

| File | Content |
| --- | --- |
| `url-shortener-web-<tag>.tar.gz` | The built `dist/` archive. |
| `sbom-url-shortener-web-<tag>.json` | CycloneDX 1.5 SBOM of the production dependency tree (Node 24-native `npm sbom --sbom-format cyclonedx --omit dev --package-lock-only`). |
| `SHA256SUMS` | SHA-256 digests of the archive and the SBOM. |

Mirrors the backend release discipline
(`url-shortener-service/docs/release-runbook.md`). To verify downloaded assets:

```sh
sha256sum -c SHA256SUMS
```

The workflow itself runs this check before uploading, so a published set is
always internally consistent.

## Continuous delivery (Compose production)

`.github/workflows/deploy-web.yml` deploys a published release to the Compose
production edge. It runs **only** on this repository's self-hosted runner
(`prod-host-web`, same deploy host as the backend) and **only** via manual
dispatch of a `vX.Y.Z` tag — never on `pull_request` (public-repository
hardening: an untrusted ref can never reach the production runner). The
`production` environment (required reviewer, protected-branches-only) gates
the job.

| Phase | Does |
| --- | --- |
| Validate | Input must be a `vX.Y.Z` semver (fail-closed otherwise). |
| Preflight | Host `FRONTEND_DIR` exists; backend compose Caddyfile present (smoke contract); `urlshortener-caddy` running; the release carries all three assets; previous release recorded for rollback. |
| Deploy | `scripts/deploy-frontend.sh <vX.Y.Z>` — `gh release download` (needs `GH_TOKEN=${{ secrets.GITHUB_TOKEN }}`), `sha256sum -c SHA256SUMS` fail-closed, extract to `releases/<tag>/`, atomic `current` symlink flip. Backend untouched. |
| Smoke | `scripts/smoke-web.sh --expect-version <vX.Y.Z>` — artifact + read-only edge-law legs; pre-DNS it auto-spins a throwaway Caddy (`tls internal` on `:8081/:8443`, compose network) so no committed state is hit. |
| Rollback | On failure: `deploy-frontend.sh --rollback <previous>` + smoke of the previous release. Fail-closed. |

Owners: the **`production` environment review** (human) approves each CD run;
machine verification is the smoke suite. Deploys are independent of the backend
tag (`deploy.yml` in the service repo is untouched). First real-artifact pilot
targets `v0.3.0` (pre-DNS); DNS/port-forward cutover and post-cutover TLS
verification are owned by the account owner.
