# Epic 6 – Technical Tasks

Read the backend id alphabet and reserved paths before writing the regex.

## 6.1 Pattern

- [ ] Reserved SPA paths: / /login /register /links and prefix /links/
- [ ] Static: /assets/ (Vite)
- [ ] Short code: single segment matching backend alphabet (document the regex)
- [ ] Never try_files index.html for that regex

## 6.2 Caddy

- [ ] handle /api* → Java
- [ ] handle /actuator* → Java
- [ ] handle short-code → Java
- [ ] handle remaining → root dist + try_files {path} /index.html

## 6.3 NGINX

- [ ] Same order: exact/prefix API first, then short-code regex, then SPA
- [ ] Comment root /var/www/spa-blue vs spa-green (or the names the LB already uses)

## 6.4 README + env

- [ ] .env.example: VITE_API_BASE_URL= (empty)
- [ ] README snippet copy-paste for both edges

## 6.5 Optional CI

- [ ] Tag workflow OR document "out of epic, debt item in AGENTS.md"

## 6.6 Docs

- [ ] CHANGELOG
- [ ] Fill epic-6-dod.md
- [ ] AGENTS.md: SPA is served at the edge; redirect stays on Java

## Completion checklist

- [ ] Two configs in repo or one config + explicit N/A for the other
- [ ] Regex does not steal /login or /links
- [ ] npm test pasted
