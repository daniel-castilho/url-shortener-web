# Deploy — Edge routing law (Caddy / NGINX)

The SPA ships as static files behind the same host as the Java API. This
document is the single source of truth for edge routing; `deploy/caddy/Caddyfile`
(UAT) and `deploy/nginx/spa.conf` (prod Blue/Green) implement the same rules.

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
- **Prod (NGINX):** `deploy/nginx/spa.conf` — exact/prefix locations for API
  and reserved SPA paths (exact and `^~` prefixes win over the regex location,
  which neutralizes the collision), regex location for short codes, and
  `location /` with `try_files $uri $uri/ /index.html`. The `root` is
  commented for Blue/Green swaps (`spa-blue` ↔ `spa-green`).

## Local preview

```sh
npm run build
npm run preview        # vite preview serves dist/ on :4173 (SPA only, no /api)
# or, with the routing law:
caddy run --config deploy/caddy/Caddyfile   # needs dist/ in the Caddyfile root
```

`vite preview` does not proxy `/api` — use it for SPA-only checks; use the
Caddy config (or the UAT kit) when you need the routing law locally.
