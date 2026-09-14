# Epic 2 – Testing Strategy

This epic introduces the runner. Tests stay unit/kernel. No jsdom unless ErrorBoundary cannot be tested otherwise — then skip UI test and keep the manual check.

## 2.1 Automated (mandatory)

    npm test
    npm run check

Pass = exit 0.

Minimum cases:

- mapApiError 400, 401, 403, 409, 429, 599
- session-events subscribe/emit/unsubscribe
- single-flight: two waiters, one inner start function invoked once

## 2.2 Grep invariants

    grep -R "location.href" src || true
    grep -R "X-Request-Id" src/lib/api.ts
    grep -R "ErrorBoundary" src
    grep -R "String(shorten.error)" src || true

Pass: no location.href; header present; boundary present; Home no longer String(shorten.error).

## 2.3 Manual matrix (paste into DoD)

| Case | Expected |
| --- | --- |
| Trigger API 400 on login | Mapped copy + request id visible |
| Throw in a page (temporary throw) | Fallback, Tentar de novo restores |
| Network panel on any api call | Request header X-Request-Id |
| npm test in CI log | Suite ran, not skipped |

## 2.4 CI

Job must fail if a kernel assertion fails. Do not add coverage floors in this epic.

Post-epic: new pure helpers ship with a test file in the same PR.
