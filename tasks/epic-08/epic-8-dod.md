# Epic 8 – Definition of Done (DoD)

Rule zero — zero-from-memory. Paste or Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
<final-sha> docs: epic-8 evidence + dod
a4872fb build(deps): pin @playwright/test in lockfile
692af6d docs: changelog + readme e2e section (8.5)
c62b8ed ci: opt-in e2e job, skip-by-default (8.3)
7c6d2c6 feat(e2e): playwright runner + config + happy-path spec (8.1/8.2)
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

ℹ tests 28
ℹ suites 0
ℹ pass 28
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

(28/28 — unchanged; `npm test` never starts Chromium.)

### npm run check

```
> url-shortener-web@0.1.0 check
> npm run lint && npm run typecheck && npm run build

(lint exit 0, typecheck exit 0)
dist/assets/index-DX59svBF.css        19.83 kB │ gzip:   4.73 kB
dist/assets/ClicksChart-Dfiu_CIh.js    1.39 kB │ gzip:   0.67 kB
dist/assets/index-DHbznEZR.js        390.25 kB │ gzip: 123.47 kB
✓ built in 3.28s
```

### npm run e2e

**Hypothesis (TD-13) — stack down.** Ran locally (`npm run e2e`); Playwright
infrastructure is verified working: build → `vite preview` on
`127.0.0.1:5173` → Chromium starts → spec navigates. Fails deterministically
at the API boundary because Java is not up in this machine:

```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /\/links$/
Received string:  "http://127.0.0.1:5173/register"
```

i.e. register POST never round-trips to `:8080`. Manual matrix below is
Hypothesis until the stack exists locally or in Actions with
`E2E_ENABLED=true` + `PLAYWRIGHT_BASE_URL`.

Sanity that the spec is wired:

```
> npx playwright test --list
Listing tests:
  [chromium] › happy-path.spec.ts:24:1 › happy path: authenticate → shorten → list → detail → archive
Total: 1 test in 1 file
```

### gh run list --limit 10

Hypothesis (TD-13) — branch not pushed yet. Run/sha pair to be pasted after
Actions goes green on this PR's head commit.

## 2. Self-audit

- [ ] Shas resolve
- [ ] Run/sha pair pasted or LOCAL
- [x] Counts from npm test output
- [x] main claims true of origin/main (4abe461 contains Epic 7)
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 8 CLOSED
- [x] PR CI did not force Playwright on every push unless E2E_ENABLED (job `if: vars.E2E_ENABLED == 'true' || github.event_name == 'workflow_dispatch'`)

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Gate | Replacing node --test with Playwright |
| CI | Main red because UAT is down |
| Secrets | Email/password committed |
| Scope | axe + Percy + k6 in this epic |

## 4. Checklist

- [x] Stories 8.1-8.5 done
- [x] npm test / check pasted
- [x] e2e pasted or Hypothesis (Hypothesis — stack down; infra proven)
- [x] CHANGELOG + README updated

## 5. Manual / e2e matrix

| Case | Expected | Result |
| --- | --- | --- |
| Login | Lands on /links authenticated | Hypothesis (TD-13) — stack down |
| Shorten | shortUrl visible | Hypothesis (TD-13) |
| List | New id appears | Hypothesis (TD-13) |
| Archive dialog | Confirm archives | Hypothesis (TD-13) |
| npm test on PR | Does not start Chromium | PASS — `node --test 'src/lib/*.test.ts'`, no runner dep |

## 6. A11y floor (8.4)

Checked by hand (grep on `main`, Epic 8 head):

- `LoginPage.tsx`: 2 `Label htmlFor` (Email, Senha).
- `RegisterPage.tsx`: 3 `Label htmlFor` (Nome, Email, Senha).
- `HomePage.tsx`: 3 `Label htmlFor` (URL, Alias, Expira).
- `LinkDetailPage.tsx`: archive `Dialog` has `DialogTitle` "Arquivar este link?".
- Focus trap: Radix `Dialog` untouched (shadcn default) — not disabled, not
  re-implemented; residual by-design (framework-owned, out of this epic's
  scope to assert).
- Keyboard: forms are native `<form onSubmit>` — Enter submits without extra
  wiring (default browser behavior).

Closure is the owner channel.