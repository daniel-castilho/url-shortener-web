# Epic 2: Gate de qualidade

**Project:** url-shortener-web
**Depends on:** Epic 1 Story 1.1 on origin/main (d74ddc7) — session bus exists
**Objective:** Raise Testes 3.0 and Observable 5.5 without standing up Vitest, Playwright, hexagonal modules, or Caddy.

## Why this epic second

Audit (main @ ab6a949, later d74ddc7) put the gap here: zero tests, no ErrorBoundary, no X-Request-Id. Maintainable is already 8.5. Chasing ADR 0001/0002 now does not move the scorecard.

| Later epic | Needs Epic 2 |
| --- | --- |
| EP3 Encurtar | mapApiError + request id on Home errors |
| EP8 Confianca | node --test kernel to hang Playwright on |
| EP6 Deployable | CI can grow a test job; Caddy stays out |

## In scope

1. node --test on pure modules (no DOM): mapApiError, session-events, refresh mutex extracted enough to call.
2. X-Request-Id generated per request(), sent as header, exposed on ApiError, shown next to mapped copy.
3. ErrorBoundary around the app shell: fallback + retry, no Sentry.
4. HomePage uses mapApiError like Login/Links.
5. CI job runs the new tests. Existing npm run build stays.

## Out of scope

Vitest, Playwright, Result/hexagonal extract, Retry-After copy, Caddy/UAT, BFF, code-splitting, SBOM.

## Elevated Acceptance Criteria

1. npm test (or npm run test) exits 0 with at least the three kernel files.
2. CI on main runs install + test + build; a failing kernel test goes red.
3. Every API call from request() sends X-Request-Id (UUID).
4. ApiError carries requestId; pages that already show mapApiError also show the id.
5. Render throw inside a page is caught; retry remounts children. No location.href.
6. HomePage never String(error) for ApiError.
7. DoD evidence is pasted output only.

## Traceability

| Story | Focus |
| --- | --- |
| 2.1 | node --test kernel |
| 2.2 | X-Request-Id |
| 2.3 | ErrorBoundary |
| 2.4 | HomePage mapApiError |
| 2.5 | CI test job + handoff |
