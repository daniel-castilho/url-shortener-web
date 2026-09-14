# Epic 6: Producao no edge (Caddy / NGINX)

**Project:** url-shortener-web
**Depends on:** Epic 5 CLOSED on origin/main (d8f4670)
**Objective:** The SPA ships as static files behind the same host as the Java API. Redirect GET /{id} never hits index.html.

## Why this epic sixth

Product pages exist. The audit Deployable 5.5 is this hole: tag without a web pipeline, SPA absent from the UAT Caddyfile, no documented NGINX snippet for Blue/Green static.

## In scope

1. Document and add edge config: Caddy (UAT kit) and/or NGINX (prod Blue/Green) — same routing rules.
2. Routing law:
   - /api* and /actuator* → Java
   - GET /{id} where id looks like a short code → Java (302)
   - / /login /register /links /links/* and static assets → SPA
   - unknown UI paths → index.html
   - short-code path must NOT fall through to index.html
3. VITE_API_BASE_URL empty in UAT/prod (same-origin). .env.example already describes it.
4. Build artifact: npm run build → dist/. README / deploy doc says how the edge serves dist.
5. Optional parity: CI release job that uploads dist/ (+ SBOM cyclonedx if cheap). Not required to close routing.

## Out of scope

BFF/HttpOnly (EP9), Playwright (EP8), charts (EP7), changing Java redirect rules, new hosting vendor.

## Elevated Acceptance Criteria

1. Written config in-repo (deploy/caddy/Caddyfile and/or deploy/nginx/spa.conf) reviewed against the routing law.
2. README section: local preview (vite preview or caddy run) + UAT + prod.
3. Explicit list of SPA routes vs short-code pattern (copy the backend id alphabet if documented).
4. npm test / check still green (no forced test of Caddy in CI unless you add a grep/self-check script).
5. DoD pasted; live UAT probe is Hypothesis until the kit is up.

## Traceability

| Story | Focus |
| --- | --- |
| 6.1 | Routing law + short-code pattern |
| 6.2 | Caddyfile UAT |
| 6.3 | NGINX snippet Blue/Green |
| 6.4 | README + env |
| 6.5 | Optional release artifact |
| 6.6 | DoD |
