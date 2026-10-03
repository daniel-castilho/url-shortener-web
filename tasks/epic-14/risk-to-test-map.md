# Epic 14.2 — Risk-to-Test Map

Source: epic-14-overview/testing/stories, AGENTS.md (auth boundaries), current baseline

## Critical journeys → risk → layer → owner → evidence
| Journey | Failure/Risk | Layer | Owner | Evidence to capture | Accepted gap |
|---|---|---|---|---|---|
| Login/session | Wrong creds/blocked/account state; /me hydration; logout behavior | Integration (RTL+MSW) | FE | spec assertions for LoginPage/AuthContext; no backend revocation claim | UI cannot prove server-side revocation; require provider evidence if ever asserted |
| Auth refresh | Concurrent 401s share refresh; retry once; terminal → hard logout; skip for auth paths; no recursion | Kernel + Integration | FE | refresh-coordinator.test.ts, api-refresh.test.ts; AuthContext/MSW tests linking outcomes | Cookie-mode refresh behavior depends on backend (see 14.24) |
| Shorten (create link) | Invalid URL → no API call; 400/429/Retry-After; 401/403; network/5xx; customAlias maxLength | Integration + Kernel | FE | HomePage spec; url.test.ts; handlers capture last request | Backend is authority for 65+ alias (enforced at API) |
| List/detail/paginate | Empty/loading/error/success; cursor pagination; no dup/lost; detail states | Integration | FE | LinksPage/LinkDetailPage specs; realistic MSW cursor shapes | Contract field names must match exactly (nextCursor: string|null) |
| Edit/archive | PATCH shape partial only; confirm/cancel; archive immutable (409); failure not shown as success | Integration | FE | LinkDetailPage/edit/archive specs | MSW handlers for admin mutations currently stateless; live probe proves reality |
| Admin: guards + actions | Role guard; users list/search/paginate; user links; code lookup; block/unblock self-block; force-archive | Integration + E2E probe (dev-only) | FE/Admin | UsersPage/UserLinksPage specs; admin-probe asserts all flows | Admin probe writes real data; must stay isolated/disposable dev only |
| Cookie auth mode | Cookie transmission/no sessionStorage token; mode-specific paths; unauth/expired | Integration + E2E (if authorized) | FE+BE | Auth boundary tests per contract; 14.24 blocked until backend supports cookie refresh | 14.24 blocked; not ready. Current: tokens returned in JSON even in cookie mode (SPA discards) |
| Refresh (cookie) | Refresh via cookies (no body/header token); 401→refresh→retry once; Set-Cookie handling | Kernel+Integration+E2E | FE+BE | Depends on backend contract; 14.24 | Blocked — backend cookie refresh availability + contract unknown; story 14.24 remains blocked |
| Admin probe safety | Refuses non-local without E2E_ALLOW_REMOTE; requires admin creds; test.skip() without env | E2E | FE | Guard present; recipe for cleanup (mongosh) in docs/testing.md | Cleanup is manual/recipe; no API delete-user; blast radius requires disposable target |
| Client a11y/security | Focus/order/dialog/escape; labels/errors; token leakage in logs/traces; DOM injection surfaces | Integration + Manual + (axe if approved) | FE | RTL semantic queries + 14.19–14.21 | axe needs dep approval; manual keyboard/AT required |
| Determinism | Fresh state, no DOM/network in kernel, controlled clocks/IDs, no real sleeps | Kernel+Integration | FE | setup resets handlers/QueryClient; unhandled requests fail | Node 24; kernel uses node:test; integration Vitest |
| Gates | Required checks match reality; no .only/critical skip; nonzero exit | CI | FE | CI job name/checks: currently kernel+integration+build; lint/typecheck separate | Epic 14.4 targets adding lint+typecheck as required PR checks (pre-approved) |

## High-value E2E (only if safe)
- Highest-risk bearer flow (14.23) — only against approved isolated/disposable backend
- Cookie flow (14.24) — blocked until backend + explicit auth
- Admin probe (14.25) — dev-only, never Staging/prod
- Staging smoke (14.27) — blocked until 14.26 readiness + explicit auth; non-destructive; no admin probe
