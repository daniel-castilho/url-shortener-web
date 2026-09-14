# Testing strategy — url-shortener-web

Goal: Testing pillar 9+. Not more files. Confidence that a user can log in, shorten, list and archive — in bearer and cookie mode.

Principle (Testing Library / Kent C. Dodds):
The more tests resemble the way the software is used, the more confidence they give.

## Trophy (this SPA, not an SSR app)

| Layer | Tool | When | What |
| --- | --- | --- | --- |
| Static | tsc -b, ESLint | every PR (npm run check) | types, boundaries |
| Unit / kernel | node --test (Node >= 24) | every PR (npm test) | mapApiError, parseRetryAfter, buildPatch, auth-mode, refresh-coordinator, session-events, formatClickCount |
| Integration | Vitest + jsdom + Testing Library + MSW | every PR | pages with MemoryRouter + QueryClient + mocked HTTP |
| E2E | Playwright | opt-in job when Java is up | one happy-path bearer, one cookie after refresh-loop fix |

Do not replace node --test with Vitest for kernel files. Two runners: kernel stays zero-DOM; integration needs a DOM.

Do not adopt Vitest Browser Mode or "E2E as the biggest slice". This app is a static SPA. Integration against MSW is the missing middle.

## Rules

1. Test behaviour, not internals. No useState assertions. Queries: getByRole / getByLabelText first (same as Playwright).
2. Do not mock src/lib/api.ts internals in integration tests. Mock the network with MSW using real contract names.
3. Each test gets its own QueryClient (retry: false, gcTime: 0) and MemoryRouter.
4. Playwright: isolated context per test; web-first expect(locator).toBeVisible(); no page.waitForTimeout. Unique emails from testInfo.testId.
5. Cookie-mode E2E only after the 401-refresh gate is (cookieMode || getRefreshToken()).
6. engines.node >= 24 and .nvmrc are part of the test contract. Node 20 cannot run *.test.ts.
7. Coverage floor is not a gate. Critical paths are.

## Integration pack (required for 9+)

One RTL + MSW file each:

- LoginPage: 401 mapped copy + id visible; 200 calls login.
- HomePage: invalid URL does not hit MSW; 201 shows shortUrl + Copiar; 429 + Retry-After shows N.
- LinksPage: empty state; list + Mais when hasMore.
- LinkDetailPage: PATCH only filled fields; archive Dialog.
- AuthProvider cookie: /me 200 hydrates; /me 401 clears (after refresh-loop fix).

Helper src/test/render.tsx wraps QueryClientProvider + MemoryRouter + AuthProvider.

MSW handlers in src/test/handlers.ts speak the real contract (token, items, nextCursor, hasMore). Never invent accessToken.

## E2E pack

Keep e2e/happy-path.spec.ts (bearer).

Add e2e/cookie-session.spec.ts only when Java plus cookie refresh exist:

- VITE_AUTH_MODE=cookie
- login leaves no us.token in sessionStorage
- request has Cookie, no Authorization
- 401 on a call triggers one POST /api/v1/auth/refresh with empty body, then retry succeeds

CI: npm test + integration on every PR (no browsers). Playwright stays E2E_ENABLED or workflow_dispatch. A 9+ pillar needs that job green at least once against UAT, with run/sha pasted — not a permanent skip.

## Refuse

- Snapshot tests of Tailwind class strings
- Tests for cn() or shadcn primitives
- Mocking useQuery instead of HTTP
- A second API shape in MSW
- Coverage vanity on components/ui

## Definition of 9+

- Kernel 36+ green on Node 24 with engines declared
- Integration suite on every PR (RTL + MSW)
- Playwright happy-path has one pasted green run against Java (bearer)
- Cookie refresh loop tested at kernel and in one integration or E2E spec
- This file linked from AGENTS.md and README

## Execution order

1. Cookie 401-refresh gate + kernel test
2. package.json engines + .nvmrc
3. Vitest/jsdom + RTL + MSW + the five specs
4. UAT probe + one Playwright run pasted
5. Cookie E2E spec
