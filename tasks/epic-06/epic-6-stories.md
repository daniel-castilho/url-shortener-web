# Epic 6 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 6.1 | Routing law written. | One section lists: API prefixes, actuator, short-code matcher, SPA routes, index.html fallback. Short-code matcher is stricter than "any single path segment" if the backend alphabet is known (e.g. exclude login, register, links, assets). | AGENTS.md / backend GET /{id} |
| 6.2 | Caddy UAT. | deploy/caddy/Caddyfile (or path you already use in the kit) reverse_proxies /api* and short codes to Java; file_server + try_files for the rest. | Audit Caddy gap |
| 6.3 | NGINX prod. | deploy/nginx/spa.conf: location ^~ /api, location /actuator, location ~ short-code, location / serving dist with try_files $uri $uri/ /index.html. Comment how Blue/Green swaps the root. | Backend NGINX LB |
| 6.4 | Human docs. | README Deploy: empty VITE_API_BASE_URL, npm run build, copy dist, do not proxy GET /{id} to the SPA. | README |
| 6.5 | Artifact (optional). | Workflow on tag: build dist, upload pages-artifact or tarball. SBOM cyclonedx optional. Skip without failing the epic if timeboxed. | Audit release gap |
| 6.6 | Handoff. | CHANGELOG + DoD. Live curl of /login vs /AbC123 is Hypothesis until UAT. | Owner channel |

Out of scope: cookie BFF, Playwright, analytics.
