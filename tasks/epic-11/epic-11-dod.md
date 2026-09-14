# Epic 11 – Definition of Done

Rule zero — paste or Hypothesis.

## Evidence (pasted)

### git log --oneline main..HEAD

```
067ce1a docs: epic-11 task docs + dod evidence
8166e12 build(deploy): security headers on the SPA document (Caddy + NGINX)
```

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 301.134254
```

### npm run test:integration

```
> url-shortener-web@0.1.0 test:integration
> vitest run

 RUN  v5.0.0 /home/castilho/projects/url-shortener/url-shortener-web

 Test Files  5 passed (5)
      Tests  12 passed (12)
   Start at  16:50:51
   Duration  3.13s
```

### npm run check

```
> url-shortener-web@0.1.0 check
> npm run lint && npm run typecheck && npm run build

✓ lint
✓ typecheck
✓ build (vite v7.3.6, 1812 modules)
```

### grep -n "Content-Security-Policy" deploy/caddy/Caddyfile deploy/nginx/spa.conf

```
deploy/caddy/Caddyfile:44:		Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
deploy/nginx/spa.conf:42:	add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
deploy/nginx/spa.conf:51:	add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
deploy/nginx/spa.conf:60:	add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
deploy/nginx/spa.conf:69:	add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
deploy/nginx/spa.conf:89:	add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
```

### grep -n "X-Frame-Options" deploy/caddy/Caddyfile deploy/nginx/spa.conf

```
deploy/caddy/Caddyfile:40:		X-Frame-Options "DENY"
deploy/nginx/spa.conf:38:	add_header X-Frame-Options "DENY" always;
deploy/nginx/spa.conf:47:	add_header X-Frame-Options "DENY" always;
deploy/nginx/spa.conf:56:	add_header X-Frame-Options "DENY" always;
deploy/nginx/spa.conf:65:	add_header X-Frame-Options "DENY" always;
deploy/nginx/spa.conf:85:	add_header X-Frame-Options "DENY" always;
```

### gh run list --limit 5

```
completed	success	build(deploy): Epic 11 — Security headers on the SPA document (Caddy + NGINX)	CI	epic-11-edge-headers	pull_request	34897685548	22s	2026-09-14T21:14:43Z
completed	success	Merge pull request #10 from daniel-castilho/epic-10-integration-msw	CI	main	push	34889626670	32s	2026-09-14T19:53:34Z
...
```

Run/sha pair: `34897685548` @ head `5152bfd` — CI `success` on this PR.

## Self-audit

- [x] Shas resolve
- [x] Run/sha pair pasted or LOCAL
- [x] Default mode is still bearer (VITE_AUTH_MODE not flipped)
- [x] No Java repo files
- [x] Owner sanctions quoted (in PR body)
- [x] No self-declared EPIC 11 CLOSED

## Failures this document encodes

| Rule | Failure |
| --- | --- |
| Default | Flipping prod to cookie before Java Set-Cookie |
| Scope | Node BFF invented in this repo |
| Scope | Editing url-shortener-service from the web squad |
| Security | CSP with 'unsafe-inline' on styles — tracked as debt |

## Checklist

- [x] Stories 11.1-11.5 done
- [ ] Java brief sent to the other squad (not this DoD)
- [x] npm test / test:integration / check pasted
- [x] CSP + X-Frame-Options greps pasted
- [x] CHANGELOG + deploy.md updated

Closure is the owner channel.