# Epic 2 – Definition of Done (DoD)

Rule zero — zero-from-memory: every number, sha or count must be pasted from a command in this file. Otherwise label Hypothesis (TD-13).

## 1. Mandatory evidence (paste when handing off)

    git log --oneline main..HEAD
    git status --porcelain
    npm test
    npm run check
    grep -R "location.href" src || true
    grep -R "X-Request-Id" src/lib/api.ts
    grep -R "ErrorBoundary" src
    grep -R "String(shorten.error)" src || true
    gh run list --limit 10

### git log --oneline main..HEAD

```
bbb5a95 chore: ignore *.tsbuildinfo build artifacts
e5f4e1d docs: epic-2 evidence, contract note, changelog, debt matrix
300f230 refactor(pages): shared ApiErrorMessage component (copy + id: requestId)
63697e8 ci: run npm test before build in check job
3e59c64 feat(home): mapApiError + requestId on shorten errors, input type=url
5e68593 feat(app): ErrorBoundary around routes with English fallback + retry
e7e08cb feat(api): X-Request-Id per attempt + requestId on ApiError + pages
3933820 test(kernel): node --test suite + refresh single-flight coordinator
```

### git status --porcelain

```
?? tasks/epic-02/
```

(tasks/epic-02/ is untracked until this docs commit adds it.)

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

✔ mapApiError maps known statuses to English copy (0.989893ms)
✔ mapApiError falls back to generic copy for other statuses (0.184983ms)
✔ two overlapping callers share one refresh (single-flight) (1.079458ms)
✔ sequential callers trigger a new refresh each time (0.36984ms)
✔ failed refresh clears in-flight state so the next caller retries (0.35954ms)
✔ rejected refresh propagates to waiters and clears state (0.689694ms)
✔ emit delivers cleared and refreshed events to subscribers (2.227844ms)
✔ unsubscribed handlers no longer receive events (0.334135ms)
✔ multiple subscribers all receive the same event (0.363637ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 145.043198
```

### npm run check (tail)

```
> url-shortener-web@0.1.0 lint
> eslint .

> url-shortener-web@0.1.0 typecheck
> tsc -b --pretty

> url-shortener-web@0.1.0 build
> tsc -b && vite build

vite v7.3.6 building client environment for production...
✓ 105 modules transformed.
rendering chunks...
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-CyAwDCJn.css    8.03 kB │ gzip:   2.40 kB
dist/assets/index-KlD1sLGh.js   339.91 kB │ gzip: 106.63 kB
✓ built in 1.80s
```

### grep -R "location.href" src || true

```
(no output — zero hits)
```

### grep -R "X-Request-Id" src/lib/api.ts

```
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-Request-Id": newRequestId() },
  headers.set("X-Request-Id", requestId);
```

### grep -R "ErrorBoundary" src

```
src/components/ErrorBoundary.tsx:interface ErrorBoundaryProps {
src/components/ErrorBoundary.tsx:interface ErrorBoundaryState {
src/components/ErrorBoundary.tsx:export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
src/components/ErrorBoundary.tsx:  state: ErrorBoundaryState = { hasError: false };
src/components/ErrorBoundary.tsx:  static getDerivedStateFromError(): ErrorBoundaryState {
src/components/ErrorBoundary.tsx:  console.error("ErrorBoundary caught", error, info.componentStack);
src/App.tsx:import ErrorBoundary from "@/components/ErrorBoundary";
src/App.tsx:        <ErrorBoundary>
src/App.tsx:        </ErrorBoundary>
```

### grep -R "String(shorten.error)" src || true

```
(no output — zero hits; HomePage renders ApiErrorMessage instead)
```

### gh run list --limit 10

```
STATUS  CONCLUSION  TITLE                                           WORKFLOW  BRANCH               EVENT         ID           ELAPSED  CREATED AT
✓       completed   Epic 2: Quality gate — kernel tests, ... (PR #1) CI        epic-2-quality-gate  pull_request  34800494248  25s      2026-09-14T02:49:31Z
✓       completed   Epic 2: Quality gate — kernel tests, ... (PR #1) CI        epic-2-quality-gate  pull_request  34800336126  20s      2026-09-14T02:46:35Z
```

Run/sha pair (final head): run `34800494248` → head `bbb5a951dfd66d303654f3d94de569da1127cee3`
(git rev-parse HEAD), conclusion `success` — CI ran `npm ci` + `npm test` +
`npm run build` green on the PR head. Earlier run `34800336126` covered the
pre-squash head `eb6657a468f77c51a62c04cc206506b477ae51af` (also success).

## 2. Self-audit

- [x] Cited shas resolve (git cat-file -e)
- [x] Run/sha pairs match pasted gh run list, or LOCAL — awaiting push
- [x] Test counts come from npm test output, not memory
- [x] main claims are true of origin/main
- [ ] Owner sanctions are quoted channel messages
- [ ] No self-declared EPIC 2 CLOSED

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Section 1 paste | npm test passed with no output |
| Scope leak | Adding Vitest or Playwright to close this epic |
| Scope leak | Extracting src/modules as acceptance |
| Observable | Header missing on refreshTokens |
| Reliable | HomePage still String(shorten.error) |

## 4. Checklist

- [x] Stories 2.1-2.5 done
- [x] npm test pasted
- [x] npm run check pasted
- [x] Grep invariants pasted
- [ ] Manual matrix pasted or Hypothesis
- [x] CI includes npm test

## 5. Manual matrix

| Case | Expected | Result |
| --- | --- | --- |
| Trigger API 400 on login | Mapped copy + request id visible | Hypothesis (TD-13) — not yet exercised against live backend |
| Throw in a page (temporary throw) | Fallback, Try again restores | Hypothesis (TD-13) — not yet exercised |
| Network panel on any api call | Request header X-Request-Id | Hypothesis (TD-13) — not yet exercised |
| npm test in CI log | Suite ran, not skipped | PASS — run 34800494248 on head bbb5a951dfd66d303654f3d94de569da1127cee3, job `check` step `Test` ran `npm test` (conclusion: success) |

Closure is the owner channel. Include this file in the Epic 2 hand-off PR.
