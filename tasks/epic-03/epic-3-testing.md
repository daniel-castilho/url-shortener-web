# Epic 3 – Testing Strategy

Keep node --test on pure helpers. Do not add Playwright in this epic.

## 3.1 Automated

    npm test
    npm run check

Minimum new cases: parseRetryAfter("12") === 12; missing/garbage === undefined.

## 3.2 Grep invariants

    grep -R "location.href" src || true
    grep -R "String(shorten.error)" src || true
    grep -R "accessToken" src/lib || true

## 3.3 Manual matrix (paste into DoD; Hypothesis until backend is up)

| Case | Expected |
| --- | --- |
| Logged out, valid https URL | 201, shortUrl on screen, no alias field |
| Logged out, try to guess alias in UI | Field absent |
| Logged in, alias + ttlSeconds | Body JSON has customAlias and ttlSeconds |
| Invalid url | No fetch |
| 429 with Retry-After: 7 | Message contains 7 |
| Copy | Clipboard has shortUrl or visible failure |
| Error | id: uuid still shown |

## 3.4 CI

Existing job is enough. Cite run/sha after push or LOCAL.
