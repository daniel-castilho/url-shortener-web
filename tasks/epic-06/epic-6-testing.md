# Epic 6 – Testing Strategy

No Playwright. Prefer a small bash self-check on the config files if cheap.

## 6.1 Automated

    npm test
    npm run check

Optional: grep Caddyfile/nginx for try_files and /api.

## 6.2 Grep / config invariants

    grep -R "location.href" src || true
    grep -n "index.html" deploy/caddy/Caddyfile deploy/nginx/spa.conf

Short-code location must not be the same block as try_files /index.html.

## 6.3 Manual matrix (Hypothesis until UAT)

| Case | Expected |
| --- | --- |
| GET /login | SPA index.html (200) |
| GET /links | SPA (auth may 200 the shell) |
| GET /api/v1/urls | Java (401/200 JSON, not HTML) |
| GET /{validShortId} | Java 302, Location original URL |
| GET /assets/* | hashed JS/CSS |
| VITE_API_BASE_URL empty | browser calls same origin /api |

## 6.4 CI

Existing web CI stays. Release workflow is optional. Cite run/sha or LOCAL.
