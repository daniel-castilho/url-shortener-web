# Epic 9 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 9.1 | Dual mode. | VITE_AUTH_MODE default bearer. cookie reads import.meta.env. request() sets credentials include always. Bearer header only in bearer mode when getToken() is set. | api.ts |
| 9.2 | Storage. | cookie mode: setSession is a no-op or unused; User keys still used; getToken() returns null. bearer mode unchanged. | auth.ts |
| 9.3 | Rehydrate / logout. | cookie mode mount: GET /api/v1/auth/me if documented; 401 → cleared. logout POST /api/v1/auth/logout when documented, then existing clear + navigate. If paths absent, helpers exist and 404 is ignored once, documented as blocked-on-Java. | AuthContext |
| 9.4 | Tests. | node --test for isCookieMode / header policy / setSession no-op. Playwright happy-path stays bearer unless E2E_AUTH_MODE=cookie. | EP2 runner |
| 9.5 | Handoff. | CHANGELOG, twelve-factors, AGENTS debt "blocked on Java cookies". DoD. | Owner |

Do not ship cookie as the default until the other squad merges Set-Cookie + /me.
