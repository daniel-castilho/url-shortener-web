# Epic 8 – Testing Strategy

This epic IS the e2e layer. Kernel tests stay mandatory on every PR.

## 8.1 Automated (always)

    npm test
    npm run check

## 8.2 Automated (when stack is up)

    PLAYWRIGHT_BASE_URL=... E2E_EMAIL=... E2E_PASSWORD=... npm run e2e

## 8.3 Grep invariants

    grep -R "location.href" src || true
    grep -R "accessToken" src/lib || true

## 8.4 Manual / e2e matrix

| Case | Expected |
| --- | --- |
| Login | Lands on /links or home authenticated |
| Shorten | shortUrl visible |
| List | New id appears (or detail reachable) |
| Archive dialog | Confirm archives |
| npm test on PR | Does not start Chromium |

## 8.5 CI

Default PR: no browsers. e2e job opt-in. Cite run/sha or LOCAL.
