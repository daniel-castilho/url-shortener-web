# Epic 11 – Testing Strategy

No new JS tests.

    npm test
    npm run test:integration
    npm run check
    grep -n "Content-Security-Policy" deploy/caddy/Caddyfile deploy/nginx/spa.conf
    grep -n "X-Frame-Options" deploy/caddy/Caddyfile deploy/nginx/spa.conf

Manual (Hypothesis until UAT): curl -I https://host/login shows CSP; curl -I https://host/{shortId} is Java 302, not the SPA CSP requirement.
