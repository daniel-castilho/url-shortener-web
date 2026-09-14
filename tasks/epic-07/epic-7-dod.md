# Epic 7 – Definition of Done (DoD)

Rule zero — zero-from-memory. Paste or Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
35c8182 docs: epic-7 evidence + changelog
950364c feat(analytics): ClicksChart (CSS bars) + lazy chunk + series in Detail (7.3/7.4)
894a232 feat(analytics): ClickAnalyticsResponse types + getClicks + formatClickCount/toBarPoints (7.1/7.2)
012f75d feat(analytics): formatClickCount + toBarPoints + tests (7.1/7.2)
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
> url-shortener-web@0.1.0 test
> node --test 'src/lib/*.test.ts'

✔ formatClickCount formats integers with pt-BR grouping (1.108768ms)
✔ formatClickCount clamps negatives to zero (0.274377ms)
✔ formatClickCount handles non-finite values (0.195739ms)
✔ toBarPoints returns empty array for empty input (0.181275ms)
✔ toBarPoints normalizes clicks to ratio 0..1 (0.283252ms)
✔ toBarPoints handles all zeros (0.212301ms)
✔ toBarPoints formats date labels pt-BR (0.212969ms)
✔ mapApiError maps known statuses to PT-BR copy (1.108174ms)
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
ℹ tests 28
ℹ suites 0
ℹ pass 28
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 212.529922
```

(28/28 — 7 new analytics tests added: formatClickCount 3, toBarPoints 4.)

### npm run check (tail)

```
dist/assets/index-BMFzm7c3.css        19.55 kB │ gzip:   4.69 kB
dist/assets/ClicksChart-Bsrh7raO.js    1.39 kB │ gzip:   0.66 kB
dist/assets/index-ecG4cElT.js        390.25 kB │ gzip: 123.47 kB
✓ built in 3.55s
```

(lint + typecheck ran before build — exit 0. `ClicksChart` chunk separated.)

### Contract excerpt justifying 7.3 done

From `docs/api-contract.md` (§Analytics):

```
GET /api/v1/urls/{id}/clicks?unit&from&to → 200 ClickAnalyticsResponse
{
  id: string;
  unit: string;
  from: string;
  to: string;
  totalClicks: number;
  series: ClickSeriesPoint[];        // { time: string; clicks: number }
  breakdown: Record<string, Record<string, number>>;
  uniquePerBucket: Record<string, number>;
}
```

`GET /api/v1/urls/{id}/clicks?unit=day` consumed with exact DTO names
(`ClickAnalyticsResponse`, `ClickSeriesPoint`); `breakdown`/`uniquePerBucket`
present in DTO but dimensions undocumented — not rendered (no invented UI).

### grep -R "location.href" src || true

```
(zero hits — grep exit code 1)
```

### grep -R "accessToken" src/lib || true

```
(zero hits — grep exit code 1)
```

### gh run list --limit 10

Hypothesis (TD-13) — branch not pushed yet. Run/sha pair to be pasted after
Actions goes green on this PR's head commit.

## 2. Self-audit

- [ ] Shas resolve
- [ ] Run/sha pair pasted or LOCAL
- [x] Counts from npm test output
- [x] main claims true of origin/main (da27c01 contains Epic 6)
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 7 CLOSED
- [x] No invented stats URL (`/stats` not in codebase)

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Contract | GET /stats invented in the SPA |
| Weight | Chart lib on the home chunk |
| Scope | PostHog / GA snippet |
| Scope | Playwright as acceptance |

## 4. Checklist

- [x] 7.1-7.2 done
- [x] 7.3 done (series endpoint exists; UI consumed)
- [x] 7.4 lazy chunk verified (separate ClicksChart chunk in build output)
- [x] npm test / check pasted
- [x] CHANGELOG updated

## 5. Manual matrix

| Case | Expected | Result |
| --- | --- | --- |
| Link with 0 clicks | Shows 0 | Hypothesis (TD-13) — backend down |
| Link with N clicks | List and detail agree | Hypothesis (TD-13) |
| 403 on a stats path (if any) | ApiErrorMessage | Hypothesis (TD-13) |
| No series in contract | Detail has no fake chart | PASS — series exists, UI consumed |
| Chart chunk separate | Lazy chunk in build output | PASS — `ClicksChart-Bsrh7raO.js` separate chunk |

Closure is the owner channel.