# Backend Change Request: Epic 14 — Frontend Testing Excellence

**From:** url-shortener-web team (Frontend)  
**To:** url-shortener-service team (Backend) / DevOps  
**Date:** 2026-10-03  
**Epic:** 14 — Frontend Testing Excellence and Confidence  
**Baseline SHA:** e137257 (main)

---

## Summary

Epic 14 establishes systematic test gates, measurement, accessibility, security, mutation testing, and safe-environment policies for the frontend. Several stories require backend coordination or new capabilities. This document formalizes those requests with technical justification.

---

## Request 1: Cookie-Based Refresh Contract (Story 14.24)

### Story Context
**14.24 — Add cookie-session E2E journey**  
*Blocked: backend cookie refresh behavior not available + contract agreement needed*

### Current State
- Backend supports HttpOnly cookies for `access_token` (Path=/, Secure, SameSite=Lax) and `refresh_token` (Path=/api/v1/auth/refresh, Secure, SameSite=Lax)
- Login (`POST /api/v1/auth/login`) returns tokens in **both** JSON body and Set-Cookie headers
- Frontend in cookie mode discards JSON tokens; uses cookies automatically
- Refresh endpoint: `POST /api/v1/auth/refresh` — currently requires `refreshToken` in JSON body (Bearer pattern)
- No cookie-only refresh flow implemented

### What We Need
Implement a **cookie-only refresh flow** where:
1. **Request:** `POST /api/v1/auth/refresh` with **no body**, cookies sent automatically (including `refresh_token` cookie)
2. **Success (204):** Returns new `access_token` and `refresh_token` via `Set-Cookie` headers; no JSON body required
3. **Failure (401):** If refresh token invalid/expired/rotated — clear cookies via `Set-Cookie` with `Max-Age=0`; frontend performs hard logout
4. **Frontend behavior:** Single-flight refresh (concurrent 401s share one refresh), retry once on success, hard logout on terminal failure

### Technical Justification
- **Security:** HttpOnly cookies prevent XSS token theft; no tokens in JavaScript memory
- **Standards compliance:** Aligns with RFC 6265 / SameSite cookie best practices
- **Testability:** Enables Epic 14.24 cookie E2E journey against isolated backend
- **Contract parity:** Frontend already implements single-flight refresh coordinator for Bearer; cookie mode should mirror semantics

### Proposed Contract

#### `POST /api/v1/auth/refresh` (Cookie Mode)
| Aspect | Detail |
|---|---|
| **Auth** | Cookie-based (no Authorization header) |
| **Request Body** | Empty (or omitted) |
| **Cookies Sent** | `refresh_token` (HttpOnly, Path=/api/v1/auth/refresh) |
| **Success (204)** | `Set-Cookie: access_token=...; Path=/; HttpOnly; Secure; SameSite=Lax`<br>`Set-Cookie: refresh_token=...; Path=/api/v1/auth/refresh; HttpOnly; Secure; SameSite=Lax` |
| **Failure (401)** | `Set-Cookie: access_token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`<br>`Set-Cookie: refresh_token=; Max-Age=0; Path=/api/v1/auth/refresh; HttpOnly; Secure; SameSite=Lax` |
| **Error Body** | Optional; frontend ignores JSON on 401 in cookie mode |

#### Frontend Mapping (Already Implemented)
- `api.ts`: `refresh()` detects cookie mode via `VITE_AUTH_MODE=cookie` or cookie presence
- Single-flight coordinator shares refresh across concurrent 401s
- On 401 from refresh: clears `sessionStorage`, invalidates React Query, navigates to `/login`
- Skips refresh for `/login`, `/register`, `/refresh`, `/logout`

### Acceptance Criteria (Frontend Perspective)
- [ ] Cookie mode login leaves no tokens in `sessionStorage`
- [ ] Authenticated requests send cookies, no `Authorization` header
- [ ] 401 on API call triggers **one** `POST /api/v1/auth/refresh` (empty body)
- [ ] Refresh success → original request retries once with new cookies
- [ ] Refresh failure (401) → hard logout (clear cookies + sessionStorage + navigate `/login`)
- [ ] Concurrent 401s share single refresh request

---

## Request 2: Isolated Disposable Backend for E2E (Story 14.23)

### Story Context
**14.23 — Add critical bearer E2E journey**  
*Blocked: needs approved isolated/disposable backend + explicit authorization*

### What We Need
A **dedicated, isolated backend instance** for frontend E2E testing with:
- **Isolation:** No shared data with dev/staging/prod; reset between test runs or dedicated per-run
- **Admin user:** Pre-configured admin account with `APP_ADMIN_EMAILS` set (for admin probe)
- **Clean state:** Database reset capability (or disposable per test run)
- **Base URL:** Stable hostname for `PLAYWRIGHT_BASE_URL` (e.g., `https://e2e-backend.url-shortener.internal`)
- **Auth:** Bearer token flow fully functional (login, refresh, logout, /me)

### Technical Justification
- **Safety:** Current admin probe (`e2e/admin-probe.spec.ts`) writes real users/links and has **no delete-user endpoint** — cannot run against shared environments
- **Determinism:** E2E tests need predictable state; shared backends cause flakes
- **Policy compliance:** Epic 14.3 env policy restricts E2E to local/disposable only; Staging pending (14.26)
- **Admin probe validation:** Validates admin flows (pagination, code search, block/unblock, force-archive, guard) against real backend

### Requirements
| Requirement | Detail |
|---|---|
| **Database** | Dedicated `url_shortener` schema; disposable or reset script |
| **Admin user** | Email in `APP_ADMIN_EMAILS`; credentials via `E2E_EMAIL`/`E2E_PASSWORD` |
| **Rate limits** | Relaxed or disabled for E2E test user (avoid 429 during probe) |
| **CORS** | Allow `PLAYWRIGHT_BASE_URL` origin (SPA preview) |
| **Lifetime** | Available for CI `workflow_dispatch` runs; can be ephemeral |

### Alternative (if dedicated instance not feasible)
- **Local disposable stack:** Docker Compose / Testcontainers spun up in CI before E2E job
- **Frontend owns CI orchestration** if backend provides Docker image

---

## Request 3: Staging Readiness Contract (Story 14.26)

### Story Context
**14.26 — Establish Staging readiness contract**  
*Blocked: DevOps must provide readiness evidence*

### What We Need (DevOps → Frontend)
Before any frontend test runs against Staging, we need documented evidence:

| Category | Required Evidence |
|---|---|
| **Health/Readiness** | `/actuator/health` (or equivalent) returning 200; version endpoint |
| **URL/Origin** | Stable `https://staging.url-shortener.example.com` (or similar) |
| **Backend Version** | Deployed service version + git SHA; matches frontend contract expectations |
| **Synthetic Test Data** | Pre-seeded accounts: admin (for probe), regular users, links; known IDs |
| **Isolation/Reset** | Mechanism to reset synthetic data between runs; no production data leakage |
| **Secrets** | `E2E_EMAIL`/`E2E_PASSWORD` for admin user; `PLAYWRIGHT_BASE_URL` in CI vars |
| **Allowed Scope** | Explicit list: happy-path bearer only; **no admin probe**; non-destructive reads only |
| **Monitoring/Contact** | On-call contact for test failures; alerting if test run impacts shared resources |
| **Rollback/Cleanup** | Procedure to revert test data changes; TTL for test accounts |

### Frontend Constraints
- **14.27 Staging smoke** only runs after 14.26 readiness + explicit authorization
- **Never** run admin probe against Staging (destructive, no cleanup API)
- Staging smoke = non-destructive: login → shorten → list → logout (happy path)
- Run via `workflow_dispatch` only; not on every PR

---

## Request 4: Contract Alignment Verification (Story 14.11)

### Current State
Frontend MSW handlers aligned to `docs/api-contract.md`:
- `AdminUrlLookupResponse = { item: LinkResponse; ownerUserId: string; ownerEmail: string | null }` (nested, per Java record)
- Pagination: `{ items, nextCursor: string | null, hasMore }`
- Auth: `token`, `refreshToken`, `userId`, `email`, `name`
- Shorten: `originalUrl`, `customAlias`, `ttlSeconds`, `domain`
- Error shapes: `ApiError` with `kind` discriminator

### Ask
**Confirm no drift** between backend OpenAPI spec and `docs/api-contract.md` for:
- Admin lookup response shape (nested `item` + `ownerUserId` + `ownerEmail`)
- Cookie refresh endpoint (see Request 1)
- Any new fields/endpoints added since last sync

Frontend will not adopt contract changes without backend confirmation.

---

## Timeline & Priority

| Request | Priority | Target | Blocker For |
|---|---|---|---|
| 1. Cookie Refresh Contract | **High** | Before 14.24 execution | 14.24 (cookie E2E), 14.27 (staging smoke if cookie mode) |
| 2. Disposable Backend | **High** | Before 14.23 execution | 14.23 (bearer E2E), admin probe validation |
| 3. Staging Readiness | **Medium** | Before 14.27 execution | 14.27 (staging smoke) |
| 4. Contract Verification | **Ongoing** | Continuous | All integration/E2E tests |

---

## Frontend Commitments

In return, frontend commits to:
- **Never** run admin probe against Staging/production
- **Never** commit real credentials; all via CI secrets
- Provide MSW handlers mirroring agreed contracts for local development
- Share test run evidence (SHA, logs, reports) for any backend-impacting runs
- Coordinate deployments via shared CHANGELOG / release tags

---

## Contact

**Frontend Owner:** Daniel Castilho  
**Repo:** `daniel-castilho/url-shortener-web`  
**Epic Tracking:** `tasks/epic-14/` (baseline, risk map, evidence)  
**CI:** `.github/workflows/ci.yml` (E2E opt-in via `E2E_ENABLED`)

---

## Appendix: Related Epic 14 Stories

| Story | Status | Depends On |
|---|---|---|
| 14.11 | ✅ Done | Contract alignment (MSW matches api-contract.md) |
| 14.13 | ✅ Done | Bearer + cookie auth boundary tests (cookie E2E needs Request 1) |
| 14.22 | ✅ Done | Fixtures documented (independent contexts, unique data, cleanup) |
| 14.23 | ⏳ Blocked | **Request 2** (disposable backend) |
| 14.24 | ⏳ Blocked | **Request 1** (cookie refresh contract) |
| 14.25 | ✅ Done | Admin probe safety (dev-only, guarded, cleanup recipe) |
| 14.26 | ⏳ Blocked | **Request 3** (DevOps readiness) |
| 14.27 | ⏳ Blocked | 14.26 + explicit auth |

---

**Please review and confirm feasibility / timeline for Requests 1–3.**  
Frontend will pause 14.23/14.24/14.27 until backend coordination complete.