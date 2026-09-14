# Epic 6 – Definition of Done (DoD)

Rule zero — zero-from-memory. Paste or Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
5493d4a docs: epic-6 evidence + changelog + edge parity note
0d138f0 ci: release artifact workflow on tag
f698d5a docs(readme): deploy section (preview/UAT/prod + routing law)
11af34c feat(deploy): NGINX prod edge config (Blue/Green)
a99a0af feat(deploy): Caddy UAT edge config
a30ceaf docs(deploy): routing law + short-code matcher
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 182.104591
```

(21/21 — unchanged from Epic 5; no TS code touched in this epic.)

### npm run check (tail)

```
dist/assets/index-DT_877RJ.css   19.28 kB │ gzip:   4.63 kB
dist/assets/index-DendZrq9.js   388.54 kB │ gzip: 122.84 kB
✓ built in 3.90s
```

(lint + typecheck ran before build — exit 0.)

### ls -la deploy/caddy deploy/nginx

```
deploy/caddy:
total 12
-rw-r--r-- 1 castilho  949 Sep 14 08:14 Caddyfile

deploy/nginx:
total 12
-rw-r--r-- 1 castilho 1772 Sep 14 08:15 spa.conf
```

### Config invariants (grep -n "index.html" deploy/caddy/Caddyfile deploy/nginx/spa.conf)

```
deploy/caddy/Caddyfile:18:# --- Rule 3: short codes -> Java (302 redirect; never index.html) --
deploy/caddy/Caddyfile:29:# --- Rules 4-5: SPA (static assets + index.html fallback) ----------
deploy/caddy/Caddyfile:31:try_files {path} /index.html
deploy/nginx/spa.conf:33:	try_files /index.html =404;
deploy/nginx/spa.conf:36:	try_files /index.html =404;
deploy/nginx/spa.conf:39:	try_files /index.html =404;
deploy/nginx/spa.conf:42:	try_files /index.html =404;
deploy/nginx/spa.conf:45:# --- Rule 3: short codes -> Java (302 redirect; never index.html) --
deploy/nginx/spa.conf:53:# --- Rules 4-5: SPA (static assets + index.html fallback) ----------
deploy/nginx/spa.conf:56:	try_files $uri $uri/ /index.html;
```

Reading: every `index.html` occurrence is either a comment or a SPA-fallback
`try_files` (Caddy handle-final; NGINX reserved paths `location = /login`,
`= /register`, `= /links`, `^~ /links/`, and `location /`). The short-code
blocks (Caddy `@shortcode`, NGINX `location ~ ^/[A-Za-z0-9_-]{1,64}$`) contain
`reverse_proxy`/`proxy_pass` only — no `index.html`, no `try_files`.
Separation holds in both edges.

### grep -R "location.href" src || true

```
(zero hits — grep exit code 1)
```

### .env.example

```
VITE_API_BASE_URL=
```

(empty = same-origin; already correct, unchanged.)

### Live edge probes

Hypothesis (TD-13) — UAT kit not up on this machine (`caddy`/`nginx` not
installed locally; `which caddy` / `which nginx` empty). Probe matrix from
`docs/deploy.md` to run when UAT is live:

| Case | Expected |
| --- | --- |
| GET /login | SPA index.html (200) |
| GET /links | SPA (auth may 200 the shell) |
| GET /api/v1/urls | Java 401/200 JSON, not HTML |
| GET /{validShortId} | Java 302, Location original URL |
| GET /assets/* | hashed JS/CSS |
| VITE_API_BASE_URL empty | browser calls same-origin /api |

### gh run list --limit 10

```
STATUS  CONCLUSION  TITLE                                          WORKFLOW  BRANCH           EVENT         ID           ELAPSED  CREATED AT
✓       completed   Epic 6: Production at the edge — ... (PR #5)    CI        epic-6-edge-deploy pull_request  34843085550  19s      2026-09-14T08:23:47Z
```

Run/sha pair (PR head): run `34843085550` → head `f3407a078713082c5afa0cce34999e604d91c9bc`
(git rev-parse HEAD), conclusion `success` — CI ran `npm ci` + `npm test` +
`npm run build` green on the PR head.

## 2. Self-audit

- [x] Shas resolve
- [x] Run/sha pair pasted or LOCAL
- [x] Counts from npm test output
- [x] main claims true of origin/main (d8f4670 contains Epic 5)
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 6 CLOSED
- [x] Live edge probes Hypothesis until kit is up (section above)

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Routing | try_files index.html catches short codes |
| Routing | /login proxied to Java |
| Env | Hardcoded localhost:8080 in the prod build |
| Scope | BFF as acceptance |

## 4. Checklist

- [x] Stories 6.1-6.4 done
- [x] 6.5 done (release workflow on tag `v*`; SBOM debt-listed in AGENTS.md)
- [x] npm test / check pasted
- [x] CHANGELOG + README updated

## 5. Story 6.5 scope decision

Release artifact workflow included (`.github/workflows/release.yml`):
on tag `v*`, `npm ci` + `npm run build` + `dist/` uploaded via
`actions/upload-artifact@v4` (30-day retention). CycloneDX SBOM intentionally
timeboxed out — listed in AGENTS.md → Known Technical Debt.

Closure is the owner channel.
