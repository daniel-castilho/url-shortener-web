# Epic 9: Sessao dura (frontend)

**Project:** url-shortener-web
**Depends on:** Epic 8 CLOSED on origin/main (2e7c0f9)
**Blocked on:** url-shortener-service cookie transport (separate squad). This repo does not change Java.

**Objective:** When the API sets HttpOnly cookies, the SPA no longer keeps access or refresh tokens in sessionStorage. Until that ships, the front lands dual-mode and stays green on Bearer.

## Why last

sessionStorage + XSS = both tokens leave the tab. Factor 6 on the Java side is "no server session store", not "JWT must be readable by JavaScript". Same-origin edge (Epic 6) is the prerequisite that makes SameSite=Lax cookies viable without a BFF.

## In scope (this repo)

1. VITE_AUTH_MODE=bearer|cookie (default bearer).
2. All fetch() use credentials: "include" (harmless on same-origin today).
3. cookie mode: do not write us.token / us.refreshToken; do not send Authorization; login/register persist only User; refresh POST has empty body; rehydrate via GET /api/v1/auth/me when that path exists.
4. logout: still emitSession(cleared); in cookie mode also POST /api/v1/auth/logout if the contract has it (no-op helper until then).
5. Docs: twelve-factors Decision 1 becomes "cookie when mode=cookie".
6. Kernel tests for auth-mode branching (no DOM).

## Out of scope

Implementing Set-Cookie in Java. Inventing a Node BFF. CSRF token UI before the API documents one. Breaking current Bearer e2e/kernel tests.

## Elevated Acceptance Criteria

1. Default build (bearer) behaves as Epic 1-8. npm test does not drop.
2. cookie mode has zero token writes (grep us.token setItem guarded).
3. request() always credentials: "include".
4. PR body quotes the backend brief fields this front expects: cookies, /me, logout, Bearer still accepted.
5. DoD pasted. Live cookie probe is Hypothesis until Java lands.

## Traceability

| Story | Focus |
| --- | --- |
| 9.1 | credentials + auth mode |
| 9.2 | storage split |
| 9.3 | /me rehydrate + logout call |
| 9.4 | tests |
| 9.5 | docs / DoD |
