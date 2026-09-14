# Epic 4 – Testing Strategy

No Playwright. Kernel tests only for new pure helpers.

## 4.1 Automated

    npm test
    npm run check

## 4.2 Grep invariants

    grep -R "location.href" src || true
    grep -R "accessToken" src/lib || true
    grep -R "String(shorten.error)" src || true

## 4.3 Manual matrix (Hypothesis until Java is up)

| Case | Expected |
| --- | --- |
| Logged in, no links | Empty copy + link to Home |
| Enough links for two pages | Mais fetches page 2, page 1 remains |
| Open detail | Fields from GET |
| PATCH title | List/detail refresh |
| Archive twice | No crash; list consistent |
| Other user's id | 403 mapped |
| Unknown id | 404 mapped + id: uuid |

## 4.4 CI

Existing job. Cite run/sha or LOCAL.
