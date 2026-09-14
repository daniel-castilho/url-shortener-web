# Epic 7 – Testing Strategy

No Playwright. Test formatters only.

## 7.1 Automated

    npm test
    npm run check

## 7.2 Grep invariants

    grep -R "location.href" src || true
    grep -R "accessToken" src/lib || true

## 7.3 Manual matrix (Hypothesis until Java is up)

| Case | Expected |
| --- | --- |
| Link with 0 clicks | Shows 0 |
| Link with N clicks | List and detail agree |
| 403 on a stats path (if any) | ApiErrorMessage |
| No series in contract | Detail has no fake chart |

## 7.4 CI

Existing job. Cite run/sha or LOCAL.
