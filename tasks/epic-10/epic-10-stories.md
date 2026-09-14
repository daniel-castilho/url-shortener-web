# Epic 10 – Stories

| # | Story | Acceptance |
| --- | --- | --- |
| 10.1 | Tooling | vitest, jsdom, RTL, user-event, msw as devDeps. vitest.config.ts. test:integration script. engines still >=24. |
| 10.2 | Harness | render.tsx: QueryClientProvider + MemoryRouter + AuthProvider. handlers.ts: login, me, logout, refresh, shorten, list, detail, patch, archive. |
| 10.3 | LoginPage | 401 shows mapped copy + request id if present. 200 hydrates user. |
| 10.4 | HomePage | invalid URL does not call MSW. 201 shows shortUrl. 429 + Retry-After shows N seconds. |
| 10.5 | LinksPage | empty copy + link home. list + Mais when hasMore. |
| 10.6 | LinkDetailPage | PATCH only filled fields. Archive Dialog confirm. |
| 10.7 | Cookie AuthProvider | VITE_AUTH_MODE=cookie in the spec file only: /me 200 sets user; /me 401 after failed refresh clears. |
| 10.8 | CI + docs | CI runs test:integration. CHANGELOG. DoD. |
