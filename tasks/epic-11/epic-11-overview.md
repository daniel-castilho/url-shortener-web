# Epic 11: Security headers on the document

**Project:** url-shortener-web
**Depends on:** Epic 10 on origin/main
**Objective:** The HTML document served by Caddy/NGINX ships the same browser defenses the Java API already sends on /api. CSP is taken from the document response, not from JSON.

Audit red flag 3. HSTS on /api same-host is not enough for XSS on index.html.

## In scope

1. deploy/caddy/Caddyfile header block
2. deploy/nginx/spa.conf add_header on the SPA location
3. Mirror backend SecurityConfig set: X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy, CSP (script/style compatible with the Vite build), HSTS only on the TLS site
4. Comment: keep Caddy short-code exclusions in sync with App.tsx single-segment routes
5. docs/deploy.md one paragraph

## Out of scope

Flip VITE_AUTH_MODE, Playwright CI, SBOM, changing Java SecurityConfig.

## Acceptance

- grep CSP in both edge files
- index.html path has headers; short-code proxy location does not need a second CSP
- npm test 38/38 and test:integration 12/12 unchanged
