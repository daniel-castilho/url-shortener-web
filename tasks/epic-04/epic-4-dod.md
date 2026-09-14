# Epic 4 – Definition of Done (DoD)

Rule zero — zero-from-memory. Paste or label Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
3bb7573 docs: epic-4 evidence + changelog
9519181 feat(detail): PATCH edit form with dirty-fields-only body (buildPatch)
fcd14dc feat(detail): contract fields + back link + 404 mapping + archive invalidates list
3bf9ad3 feat(links): empty state with Home link
4f2a198 feat(links): cursor pagination via useInfiniteQuery + Mais button
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

✔ mapApiError maps known statuses to PT-BR copy (1.041125ms)
✔ mapApiError falls back to generic copy for other statuses (0.169857ms)
✔ mapApiError 429 uses Retry-After seconds when present (0.128665ms)
✔ parseRetryAfter returns seconds for numeric headers (0.382776ms)
✔ parseRetryAfter returns undefined for missing, date or garbage headers (0.276400ms)
✔ buildPatch returns empty object when no field is filled (1.322778ms)
✔ buildPatch includes only filled fields with backend-exact names (0.281421ms)
✔ buildPatch splits tags, trims and drops empties (0.221010ms)
✔ buildPatch keeps only tags with entries (0.190586ms)
✔ buildPatch maps all utm fields to contract names (0.198795ms)
✔ buildPatch includes expiresAt when filled (0.183651ms)
✔ two overlapping callers share one refresh (single-flight) (0.832189ms)
✔ sequential callers trigger a new refresh each time (0.332382ms)
✔ failed refresh clears in-flight state so the next caller retries (0.441926ms)
✔ rejected refresh propagates to waiters and clears state (0.765946ms)
✔ emit delivers cleared and refreshed events to subscribers (1.530298ms)
✔ unsubscribed handlers no longer receive events (0.250062ms)
✔ multiple subscribers all receive the same event (0.241687ms)
✔ isValidHttpUrl accepts http and https URLs (0.922687ms)
✔ isValidHttpUrl rejects non-http protocols (0.230240ms)
✔ isValidHttpUrl rejects empty, protocol-less and malformed values (0.179691ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 125.113981
```

### npm run check (tail)

```
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-B4Hql5fZ.css    8.51 kB │ gzip:   2.53 kB
dist/assets/index-DVIXJLQp.js   345.29 kB │ gzip: 108.14 kB
✓ built in -287ms
```

(lint + typecheck ran before build — exit 0.)

### grep -R "location.href" src || true

```
(zero hits — grep exit code 1)
```

### grep -R "accessToken" src/lib || true

```
(zero hits — grep exit code 1)
```

### gh run list --limit 10

```
STATUS  CONCLUSION  TITLE                                       WORKFLOW  BRANCH              EVENT         ID           ELAPSED  CREATED AT
✓       completed   Epic 4: Links library — ... (PR #3)         CI        epic-4-links-library pull_request  34803859570  18s      2026-09-14T03:50:15Z
```

Run/sha pair (PR head): run `34803859570` → head `65f59d119cc99adca0918d77907e6fee1f21fdb3`
(git rev-parse HEAD), conclusion `success` — CI ran `npm ci` + `npm test` +
`npm run build` green on the PR head.

## 2. Self-audit

- [x] Shas resolve
- [x] Run/sha pair pasted or LOCAL
- [x] Counts from npm test output
- [x] main claims true of origin/main (29d7b02 contains Epic 3)
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 4 CLOSED

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Contract | Renaming nextCursor / hasMore |
| List | Replacing page 1 when fetching page 2 |
| Scope | Charts or Playwright as acceptance |
| Auth | List reachable logged out |

## 4. Checklist

- [x] Stories 4.1-4.6 done
- [x] npm test / check pasted
- [ ] Manual matrix pasted or Hypothesis
- [x] CHANGELOG updated

## 5. Manual matrix

| Case | Expected | Result |
| --- | --- | --- |
| Logged in, no links | Empty copy + link to Home | Hypothesis (TD-13) — backend down |
| Enough links for two pages | Mais fetches page 2, page 1 remains | Hypothesis (TD-13) — backend down |
| Open detail | Fields from GET | Hypothesis (TD-13) — backend down |
| PATCH title | List/detail refresh | Hypothesis (TD-13) — backend down |
| Archive twice | No crash; list consistent | Hypothesis (TD-13) — backend down |
| Other user's id | 403 mapped | Hypothesis (TD-13) — backend down |
| Unknown id | 404 mapped + id: uuid | Hypothesis (TD-13) — backend down |

Closure is the owner channel.
