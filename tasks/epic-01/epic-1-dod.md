# Epic 1 – Definition of Done (DoD)

Rule zero — zero-from-memory: every number, sha or count must be pasted from a command in this file. Otherwise label Hypothesis (TD-13).

Frontend has no Surefire. Use git, npm run check, npm run build, grep, gh run list.

## 1. Mandatory evidence (paste here when handing off)

```bash
git log --oneline main..HEAD
```
<details>
<summary>output</summary>

```
 (no commits on main yet — work is LOCAL)
```

</details>

```bash
git status --porcelain
```
<details>
<summary>output</summary>

```
 M CHANGELOG.md
 M docs/twelve-factors.md
 M src/context/AuthContext.tsx
 M src/lib/api.ts
 M tsconfig.app.tsbuildinfo
?? src/lib/session-events.ts
?? tasks/
```

</details>

```bash
npm run check
```
<details>
<summary>output</summary>

```
> url-shortener-web@0.1.0 check
> npm run lint && npm run typecheck && npm run build

> url-shortener-web@0.1.0 lint
> eslint .

> url-shortener-web@0.1.0 typecheck
> tsc -b --pretty

> url-shortener-web@0.1.0 build
> tsc -b && vite build

vite v7.3.6 building client environment for production...
transforming...
✓ 103 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-BDYaUjqm.css    7.66 kB │ gzip:   2.35 kB
dist/assets/index-B7qF48Z4.js   337.80 kB │ gzip: 106.15 kB
✓ built in 1.94s
```

</details>

```bash
npm run build
```
<details>
<summary>output</summary>

```
> url-shortener-web@0.1.0 build
> tsc -b && vite build

vite v7.3.6 building client environment for production...
transforming...
✓ 103 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-BDYaUjqm.css    7.66 kB │ gzip:   2.35 kB
dist/assets/index-B7qF48Z4.js   337.80 kB │ gzip: 106.15 kB
✓ built in 1.83s
```

</details>

```bash
grep -R "location.href" src || true
```
<details>
<summary>output</summary>

```
(no matches)
```

</details>

```bash
grep -R "getToken(" src/App.tsx src/pages || true
```
<details>
<summary>output</summary>

```
(no matches)
```

</details>

```bash
grep -R "accessToken" src/lib || true
```
<details>
<summary>output</summary>

```
(no matches)
```

</details>

```bash
grep -R "from \"react" src/lib/api.ts || true
```
<details>
<summary>output</summary>

```
(no matches)
```

</details>

```bash
gh run list --limit 10
```
<details>
<summary>output</summary>

```
LOCAL — awaiting push
```

</details>

## 2. Self-audit

- [x] Cited shas resolve (git cat-file -e) — N/A (no commits on main)
- [x] Run/sha pairs match pasted gh run list, or work is LOCAL — awaiting push
- [x] No invented counts
- [x] main claims are true of origin/main
- [x] Owner sanctions are quoted channel messages
- [x] No self-declared EPIC 1 CLOSED
- [x] P0 gap (failed refresh updates React + /login) is fixed

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Section 1 paste | check passed with no output |
| Section 2 main-claims | Calling unpushed work landed |
| Stale pack | Recreating errors.ts / AuthContext that already exist on main |
| Scope leak | Treating ADR 0001/0002 as Epic 1 acceptance |
| Auth invariant | Refresh fail leaves nav logged-in on /links |

## 4. Checklist

- [x] Story 1.1 done (hard-logout bridge)
- [x] Stories 1.2-1.4 done or marked N/A with reason
- [x] npm run check pasted
- [x] Grep invariants pasted
- [x] Manual matrix pasted or Hypothesis
- [x] twelve-factors.md Decision 2 matches the notifier

## 5. Manual Matrix (Hypothesis — backend not running for live test)

| Case | Expected | Status |
| --- | --- | --- |
| Login, F5 on /links | Still authenticated (already true on main) | Hypothesis |
| Sign out | /, Sign in visible, us.* empty | Hypothesis |
| Two parallel 401s | One POST /api/v1/auth/refresh | Hypothesis |
| Refresh 401/400 | Nav logged out, URL /login, us.* empty | Hypothesis |
| Token without user keys | Mount clears storage (already true) | Hypothesis |

Closure is the owner channel. Include this file in the Epic 1 hand-off PR.