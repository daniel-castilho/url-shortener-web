# Epic 1 – Stories (Acceptance)

Baseline: main already contains errors/auth/api mutex/AuthProvider/pages/twelve-factors/CI.

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 1.1 | Hard logout is visible to React. A failed refresh must drop the in-memory session, not only sessionStorage. | After failed POST /api/v1/auth/refresh, context user and token are null and isAuthenticated is false. queryClient.clear() runs. Client lands on /login without location.href. src/lib/api.ts still has zero React / router imports. | twelve-factors.md Decision 2 |
| 1.2 | Refresh success keeps storage as source of truth. Headers always read getToken(). | request() uses getToken() per call (already true). If context exposes token, either update it on refresh success via the same listener or stop using context token for API calls. Pages must not send the context token. | src/lib/api.ts |
| 1.3 | Invariants still hold. | No location.href under src/. No getToken( in src/App.tsx or src/pages for gating. No accessToken in src/lib. Private uses useAuth().isAuthenticated. | App shell |
| 1.4 | Handoff. | epic-1-dod.md has pasted git / tsc / build / grep / optional gh run list. CHANGELOG notes the hard-logout bridge if 1.1 ships. Owner channel adjudicates closure. | Rule zero |

Out of scope: src/modules, Result type, Playwright, cookie/BFF, cursor pagination.
