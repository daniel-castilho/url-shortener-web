# Epic 10: Integration tests (RTL + MSW)

**Project:** url-shortener-web
**Depends on:** Ticket A on origin/main (03bebc1)
**Objective:** Every PR runs user-centric page tests against the real API contract, without Java and without Chromium.

Policy: docs/testing.md. Kernel node --test stays. Playwright stays opt-in.

## In scope

1. Vitest + jsdom + @testing-library/react + @testing-library/user-event + msw.
2. src/test/render.tsx and src/test/handlers.ts (contract names only).
3. Five specs listed in docs/testing.md.
4. npm script test:integration; CI check job runs it after npm test.
5. QueryClient per test: retry false, gcTime 0.

## Out of scope

Playwright on every PR, cookie default flip, Caddy headers, SBOM, coverage gate, mocking useQuery, snapshots of className.

## Acceptance

- npm test (kernel) still green
- npm run test:integration green on CI without browsers
- handlers use token, items, nextCursor, hasMore, userId, email, name
- getByRole / getByLabelText; no getByTestId unless role is impossible
