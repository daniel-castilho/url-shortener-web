# Epic 1: Sessao de verdade

**Project:** url-shortener-web
**Context (main as of 2026-09-13):** Vite 7, React 19, TanStack Query, React Router 7

**Already on main (do not recreate):**

- src/lib/errors.ts — mapApiError
- src/lib/auth.ts — User + keys us.token, us.refreshToken, us.userId, us.email, us.name
- src/lib/api.ts — refreshingPromise, skip refresh on login/register/refresh
- src/context/AuthContext.tsx — AuthProvider, login, logout, rehydrate
- src/App.tsx — useAuth, Private, Sign out calls logout()
- Login/Register call login(auth); LinksPage uses mapApiError
- docs/twelve-factors.md — three auth decisions
- .github/workflows/ci.yml — npm ci + npm run build
- npm run check = lint + typecheck + build

**Objective:** Close the remaining session holes and produce a zero-from-memory handoff. This is not a greenfield auth build.

## Why the old Epic 1 pack is stale

The first draft assumed those files did not exist. They landed under Auth core (CHANGELOG.md). Recreating them is rework.

ADR 0001 (src/modules/url-shortener hexagonal) and ADR 0002 (Result) are target state / known debt in AGENTS.md. They are out of scope for Epic 1.

## Gap versus the written contract

| Contract | Code on main | Gap |
| --- | --- | --- |
| Refresh failure = hard logout: clear storage, invalidate Query, navigate to /login | api.ts only clearSession + clearUser. Context user/token stay set. No navigate. | P0 — UI stays logged in on /links |
| Successful refresh updates session | Storage updated; Context token stays the previous value | P2 — fetch reads storage so API works; context token is stale |
| isAuthenticated means a real session | !!token in context, not Boolean(user) | P2 — mount already drops token-without-user |
| logout() goes to / | Implemented | OK |
| Refresh failure goes to /login | Not implemented from api.ts | P0 |

## Elevated Acceptance Criteria

1. Failed refresh notifies the session layer: storage cleared, context user/token null, Query cache cleared, navigate("/login").
2. api.ts does not import React Router. Use a small session listener/callback registered by AuthProvider.
3. Successful refresh does not require a remount for subsequent Authorization headers (already true via getToken()).
4. mapApiError remains only in src/lib/errors.ts as source of copy.
5. No new hexagonal folders. No BFF. No Vitest mandate.
6. npm run check green. CI build green.
7. DoD evidence is pasted command output only.

## Traceability

| Story | Focus |
| --- | --- |
| 1.1 | Hard-logout bridge api.ts to AuthProvider |
| 1.2 | Align context after successful refresh (optional but cheap) |
| 1.3 | Invariants + grep + manual matrix |
| 1.4 | Docs / CHANGELOG / DoD evidence |

Next: implement 1.1 only. Everything else is already on main.
