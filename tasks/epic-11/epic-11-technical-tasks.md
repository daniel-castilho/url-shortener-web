# Epic 11 – Technical Tasks

Read url-shortener-service SecurityConfig headers and copy names/values where they apply to a static SPA.

Suggested baseline (adjust after reading index.html):

    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    X-DNS-Prefetch-Control: off
    Permissions-Policy: camera=(), microphone=(), geolocation=()
    Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    (HSTS only in Caddy on https SITE_ADDRESS / NGINX ssl server)

- [ ] Caddyfile
- [ ] spa.conf
- [ ] deploy.md
- [ ] CHANGELOG
- [ ] DoD
