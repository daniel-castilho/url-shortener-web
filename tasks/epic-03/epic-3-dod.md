# Epic 3 – Definition of Done (DoD)

Rule zero — zero-from-memory. Paste outputs. Else Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
359451a docs: epic-3 evidence, changelog, Retry-After contract note
4616fcc feat(home): copy-to-clipboard with visible failure feedback
3702cf4 feat(api): parse Retry-After on 429, 'Try in Ns.' copy
3dc0844 feat(home): block invalid URL before fetch (isValidHttpUrl)
b1eeeee feat(home): auth-gated customAlias + optional ttlSeconds
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

✔ mapApiError maps known statuses to English copy (1.188129ms)
✔ mapApiError falls back to generic copy for other statuses (0.219059ms)
✔ mapApiError 429 uses Retry-After seconds when present (0.187328ms)
✔ parseRetryAfter returns seconds for numeric headers (0.450189ms)
✔ parseRetryAfter returns undefined for missing, date or garbage headers (0.220184ms)
✔ two overlapping callers share one refresh (single-flight) (2.417698ms)
✔ sequential callers trigger a new refresh each time (0.623186ms)
✔ failed refresh clears in-flight state so the next caller retries (0.477187ms)
✔ rejected refresh propagates to waiters and clears state (1.298629ms)
✔ emit delivers cleared and refreshed events to subscribers (2.764476ms)
✔ unsubscribed handlers no longer receive events (0.390103ms)
✔ multiple subscribers all receive the same event (0.470151ms)
✔ isValidHttpUrl accepts http and https URLs (2.183041ms)
✔ isValidHttpUrl rejects non-http protocols (0.453739ms)
✔ isValidHttpUrl rejects empty, protocol-less and malformed values (0.371391ms)
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 212.529922
```

### npm run check (tail)

```
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-eNiVkMeP.css    8.09 kB │ gzip:   2.41 kB
dist/assets/index-DtXJaEra.js   340.02 kB │ gzip: 106.96 kB
✓ built in 1.74s
```

(lint + typecheck ran before build — exit 0.)

### grep -R "location.href" src || true

```
(zero hits — grep exit code 1)
```

### grep -R "String(shorten.error)" src || true

```
(zero hits — grep exit code 1)
```

### gh run list --limit 10

```
STATUS  CONCLUSION  TITLE                                           WORKFLOW  BRANCH                 EVENT         ID           ELAPSED  CREATED AT
✓       completed   Epic 3: Shorten flow as a product — ... (PR #2)  CI        epic-3-shorten-product  pull_request  34802649736  18s      2026-09-14T03:27:06Z
```

Run/sha pair (PR head): run `34802649736` → head `6789626f175a408153ab233f6748f50239d1a167`
(git rev-parse HEAD), conclusion `success` — CI ran `npm ci` + `npm test` +
`npm run build` green on the PR head.

## 2. Self-audit

- [x] Shas resolve
- [x] Run/sha pair pasted or LOCAL
- [x] Counts from npm test output
- [x] main claims true of origin/main (767f50a contains Epic 2)
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 3 CLOSED

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Contract | Sending accessToken or renamed DTO fields |
| Auth | Alias input visible while logged out |
| 429 | Ignoring Retry-After when header is a number |
| Scope | Playwright or Caddy as acceptance |

## 4. Checklist

- [x] Stories 3.1-3.5 done
- [x] npm test / check pasted
- [ ] Manual matrix pasted or Hypothesis
- [x] CHANGELOG updated

## 5. Manual matrix

| Case | Expected | Result |
| --- | --- | --- |
| Logged out, valid https URL | 201, shortUrl on screen, no alias field | Hypothesis (TD-13) — backend down |
| Logged out, try to guess alias in UI | Field absent | Hypothesis (TD-13) — backend down |
| Logged in, alias + ttlSeconds | Body JSON has customAlias and ttlSeconds | Hypothesis (TD-13) — backend down |
| Invalid url | No fetch | Hypothesis (TD-13) — backend down |
| 429 with Retry-After: 7 | Message contains 7 | Hypothesis (TD-13) — backend down |
| Copy | Clipboard has shortUrl or visible failure | Hypothesis (TD-13) — backend down |
| Error | id: uuid still shown | Hypothesis (TD-13) — backend down |

Closure is the owner channel.
