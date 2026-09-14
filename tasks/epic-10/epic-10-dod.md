# Epic 10 – Definition of Done

Rule zero — paste or Hypothesis.

    git log --oneline main..HEAD
    git status --porcelain
    npm test
    npm run test:integration
    npm run check
    gh run list --limit 10

Fail if Vitest runs src/lib/*.test.ts.
Fail if CI downloads Chromium.
Fail if default VITE_AUTH_MODE is cookie.

## Evidence (pasted after CI)

### git log --oneline main..HEAD

```
54345d4 docs: Epic 10 integration suite in CHANGELOG + AGENTS debt update
fde8545 test(pages): integration specs for login/home/links/detail + cookie AuthProvider
609a197 build(test): vitest + jsdom + RTL + MSW integration harness
```

### git status --porcelain

```
(empty — tree clean after docs commit)
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
ℹ duration_ms 215.313857
```

### npm run test:integration

```
> url-shortener-web@0.1.0 test:integration
> vitest run

 RUN  v5.0.0 /home/castilho/projects/url-shortener/url-shortener-web

 Test Files  5 passed (5)
      Tests  12 passed (12)
   Start at  19:34:16
   Duration  2.56s
```

### npm run check

```
> url-shortener-web@0.1.0 check
> npm run lint && npm run typecheck && npm run build

✓ lint
✓ typecheck
✓ build (vite v7.3.6, 1812 modules)
```

### gh run list --limit 10

```
completed	success	test(integration): Epic 10 — Vitest + RTL + MSW integration suite	CI	epic-10-integration-msw	pull_request	34888696491	28s	2026-09-14T19:44:16Z
completed	success	Merge pull request #9 from daniel-castilho/fix-cookie-refresh-loop	CI	main	push	34885026991	25s	2026-09-14T19:08:02Z
...
```

Run/sha pair: `34888696491` @ head `54345d4` — CI `success` on this PR.

## Self-audit

- [x] Shas resolve
- [x] Run/sha pair pasted
- [x] Default mode is still bearer (`.env.example: VITE_AUTH_MODE=bearer`)
- [x] No Java repo files
- [x] Owner sanctions quoted
- [x] No self-declared EPIC 10 CLOSED

## Failures this document encodes

| Rule | Failure |
| --- | --- |
| Default | Flipping prod to cookie before Java Set-Cookie |
| Scope | Node BFF invented in this repo |
| Scope | Editing url-shortener-service from the web squad |
| Security | Still writing refreshToken in cookie mode |

## Checklist

- [x] Stories 10.1-10.8 done on the front
- [ ] Java brief sent to the other squad (not this DoD)
- [x] npm test / test:integration / check pasted

Closure of "integration-msw" as a product requires BOTH repos. This file closes only the web slice.
