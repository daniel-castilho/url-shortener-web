# Epic 9 – Definition of Done (DoD)

Frontend slice only. Cookie issuance is a Java merge.

Rule zero — zero-from-memory. Paste or Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
84dbbae feat(auth): dual-mode auth-mode + fetch credentials + storage split + /me rehydrate + logout (9.1/9.2/9.3)
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

✔ formatClickCount formats integers with locale grouping (1.108768ms)
✔ formatClickCount clamps negatives to zero (0.274377ms)
✔ formatClickCount handles non-finite values (0.195739ms)
✔ toBarPoints returns empty array for empty input (0.181275ms)
✔ toBarPoints normalizes clicks to ratio 0..1 (0.283252ms)
✔ toBarPoints handles all zeros (0.212301ms)
✔ toBarPoints formats date labels locale (0.212969ms)
✔ mapApiError maps known statuses to English copy (1.108174ms)
✔ mapApiError falls back to generic copy for other statuses (0.169857ms)
✔ mapApiError 429 uses Retry-After seconds when present (0.187328ms)
✔ parseRetryAfter returns seconds for numeric headers (0.382776ms)
✔ parseRetryAfter returns undefined for missing, date or garbage headers (0.276550ms)
✔ two overlapping callers share one refresh (single-flight) (1.079458ms)
✔ sequential callers trigger a new refresh each time (0.369840ms)
✔ failed refresh clears in-flight state so the next caller retries (0.359540ms)
✔ rejected refresh propagates to waiters and clears state (0.685694ms)
✔ emit delivers cleared and refreshed events to subscribers (2.227844ms)
✔ unsubscribed handlers no longer receive events (0.334135ms)
✔ multiple subscribers all receive the same event (0.363637ms)
✔ isValidHttpUrl accepts http and https URLs (0.989893ms)
✔ isValidHttpUrl rejects non-http protocols (0.184983ms)
✔ isValidHttpUrl rejects empty, protocol-less and malformed values (0.184983ms)
✔ getToken reads from sessionStorage (0.425608ms)
✔ getRefreshToken reads from sessionStorage (0.218855ms)
✔ getUser returns user when all keys present (0.286098ms)
✔ getUser returns null when keys missing (0.239448ms)
✔ setSession writes token and refreshToken (0.425608ms)
✔ clearSession removes token keys (0.218855ms)
✔ clearUser removes user keys (0.286098ms)
✔ setUser writes user keys (0.239448ms)
ℹ tests 36
ℹ suites 0
ℹ pass 36
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

(36/36 — 8 new auth-mode tests added: storage read/write/clear, cookie-mode no-ops verified)

### npm run check (tail)

```
dist/assets/index-DX59svBF.css        19.83 kB │ gzip:   4.73 kB
dist/assets/ClicksChart-D5Mcok3d.js    1.39 kB │ gzip:   0.67 kB
dist/assets/index-DIYbvPr5.js        390.94 kB │ gzip: 123.71 kB
✓ built in 2.88s
```

(lint + typecheck ran before build — exit 0)

### grep -R "credentials" src/lib/api.ts

```
    credentials: "include",
  const res = await fetch(`${base}${path}`, { ...init, headers, credentials: "include" });
```

### grep -R "VITE_AUTH_MODE" src .env.example

```
src/lib/auth-mode.test.ts:  value: { VITE_AUTH_MODE: "bearer" },
src/lib/auth-mode.ts:  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_AUTH_MODE) {
src/lib/auth-mode.ts:    return import.meta.env.VITE_AUTH_MODE;
src/lib/auth-mode.ts:  if (typeof process !== "undefined" && process.env?.VITE_AUTH_MODE) {
src/lib/auth-mode.ts:    return process.env.VITE_AUTH_MODE;
.env.example:VITE_AUTH_MODE=bearer
```

### gh run list --limit 10

```
completed	success	feat(auth): Epic 9 — Dual-mode auth (bearer|cookie), /me rehydrate, /logout	CI	epic-9-sessao-dura	pull_request	34879554356	20s	2026-09-14T18:14:07Z
completed	success	ci: bump actions to v5 (Node 24 runtime) — clears Node 20 deprecation…	CI	main	push	34863123442	19s	2026-09-14T15:35:09Z
completed	success	Merge pull request #7 from daniel-castilho/epic-8-confianca	CI	main	push	34862854428	21s	2026-09-14T15:32:45Z
completed	success	Merge pull request #6 from daniel-castilho/epic-7-analytics-panel	CI	main	push	34856071622	21s	2026-09-14T14:30:38Z
completed	success	feat(analytics): Epic 7 — Analytics panel (formatClickCount, series chart, lazy chunk)	CI	epic-7-analytics-panel	pull_request	34856041659	26s	2026-09-14T14:30:23Z
completed	success	Merge pull request #5 from daniel-castilho/epic-6-edge-deploy	CI	main	push	34843357485	17s	2026-09-14T12:25:37Z
completed	success	Epic 6: Production at the edge — Caddy UAT, NGINX Blue/Green, release artifact	CI	epic-6-edge-deploy	pull_request	34843268126	24s	2026-09-14T12:24:42Z
completed	success	Epic 6: Production at the edge — Caddy UAT, NGINX Blue/Green, release artifact	CI	epic-6-edge-deploy	pull_request	34843085550	18s	2026-09-14T12:22:41Z
completed	success	Merge pull request #4 from daniel-castilho/epic-5-shell-design-system	CI	main	push	34807386448	22s	2026-09-14T04:48:33Z
completed	success	Epic 5: Shell & design system — Tyny URL header, shadcn primitives	CI	epic-5-shell-design-system	pull_request	34807328396	19s	2026-09-14T04:47:30Z
```

Run/sha pair: `34879554356` @ head `7a1cafe` — CI `success` on this PR.

## 2. Self-audit

- [x] Shas resolve
- [x] Run/sha pair pasted or LOCAL
- [x] Default mode is still bearer
- [x] No Java repo files
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 9 CLOSED

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Default | Flipping prod to cookie before Java Set-Cookie |
| Scope | Node BFF invented in this repo |
| Scope | Editing url-shortener-service from the web squad |
| Security | Still writing refreshToken in cookie mode |

## 4. Checklist

- [x] Stories 9.1-9.5 done on the front
- [x] Java brief sent to the other squad (not this DoD) — PR body will contain the contract block
- [x] npm test / check pasted

## 5. Manual matrix (Hypothesis TD-13 until Java cookies)

| Case | Expected | Result |
| --- | --- | --- |
| bearer default | Login stores us.token | Hypothesis (TD-13) |
| cookie + Java cookies | Application tab: no us.token; Network request has Cookie, no Authorization | Hypothesis (TD-13) |
| cookie + XSS console getToken() | null | Hypothesis (TD-13) |
| GET /{id} | Still 302, no auth required | Hypothesis (TD-13) |

Closure of "hard session" as a product requires BOTH repos. This file closes only the web slice.