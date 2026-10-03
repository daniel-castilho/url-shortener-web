# Backend Change Request: Epic 14 — Frontend Testing Excellence

**From:** url-shortener-web team (Frontend)  
**To:** url-shortener-service team (Backend) / DevOps  
**Date:** 2026-10-03  
**Epic:** 14 — Frontend Testing Excellence and Confidence  
**Baseline SHA:** 06fee1c (main)

---

## Summary

Epic 14 establishes systematic test gates, measurement, accessibility, security, mutation testing, and safe-environment policies for the frontend. Several stories required backend coordination or new capabilities. This document formalized those requests with technical justification.

---

## Status: DELIVERED ✅ (Backend PRs #22, #23 merged to main)

All four requests have been implemented by the backend team and are available in `url-shortener-service` main branch.

---

## Request 1: Cookie-Based Refresh Contract (Story 14.24) ✅ DONE

**Backend delivered (Phase A):**
- `InvalidRefreshTokenException` mapped to 401 in `GlobalExceptionHandler` (was 400)
- `AuthController.refresh` scoped try/catch: on refresh failure → 401 + both cookies cleared with `Max-Age=0` (reusing `clearAuthCookies`)
- **Success unchanged:** `200` + `AuthResponse` + cookies (dual-write, ADR 0010 maintained). Frontend ignores JSON in cookie mode.
- `REQ-AUTH-009` updated, `backend-frontend-contract.md` §6 documented, `ADR 0010` reviewed
- `AuthCookieIT` added: refresh invalid/expired → 401 + cookies cleared; body token invalid → 401 no improper cleanup; blocked → 403

**Frontend alignment:** Updated `docs/api-contract.md` to document 200 success (not 204), dual-write, and hard logout on 401.

---

## Request 2: Isolated Disposable Backend for E2E (Story 14.23) ✅ DONE

**Backend delivered (Phase B):**
- `docker-compose.e2e.yaml` — MongoDB + Redis + API (production image, no JVM/Maven)
- `scripts/seed-e2e.sh` — seeds admin (`admin@example.com` / `password123`, role ADMIN when `APP_ADMIN_EMAILS=admin@example.com`) + regular users + links
- Rate limit ON by default; relax for E2E with `RATE_LIMITER_LIMIT=100000 RATE_LIMITER_AUTH_LIMIT=100000`
- Docs: `docs/e2e-backend.md`, `docs/staging-readiness.md` (checklist)
- Same-origin via edge (Caddy/nginx) — **no CORS** (ADR 0010), cookie mode requires same-origin

**Frontend action needed:** Update CI/admin probe to use disposable backend.

---

## Request 3: Staging Readiness Contract (Story 14.26) ✅ DONE

**Backend delivered (Phase B):**
- `/actuator/info` public with `build.version` (`management.info.build.enabled=true` + spring-boot-maven-plugin `build-info.properties`)
- `scripts/seed-e2e.sh` for synthetic data
- `docs/staging-readiness.md` checklist covering: health 200, stable URL, version+git SHA, seed, reset, CI secrets, happy-path bearer scope, contact/rollback

**Frontend action:** Can poll `/actuator/info` for `build.version` on staging (advisory).

---

## Request 4: Contract Alignment Verification (Story 14.11) ✅ IN PROGRESS

**Backend delivered (Phase C):**
- OpenAPI 3.1 spec committed at `docs/openapi.json` (19 endpoints, 20 schemas)
- Security schemes: `bearerAuth` (HTTP Bearer), `cookieAuth` (API key in `access_token` cookie)
- Swagger UI enabled in dev/staging (`APP_SECURITY_SWAGGER_ENABLED`), fail-closed in prod
- Drift identified:
  - `AuthResponse` has extra `role` field — **confirmed tolerated** (frontend already includes optional `role`)
  - Error shape: backend emits `{status, error, message, timestamp}`; frontend `ApiError` uses `kind` — **mapped** (backend `error`/`status` → frontend `kind`)
  - Admin lookup nested + pagination already match

**Frontend alignment:** `docs/api-contract.md` updated to match OpenAPI spec (source of truth).

---

## Additional Backend Deliveries (Bonus)

| Feature | Detail |
|---------|--------|
| **Canonical `shortUrl`** | `ShortLinkBaseUrlResolver`: verified custom domain → `APP_PUBLIC_BASE_URL` → request origin fallback. **Frontend must not reconstruct URLs** — use `shortUrl` field as-is. |
| **Custom domains** | Caddy on-demand TLS gated by `ACTIVE` registration (`/internal/edge/domain-ask`, shared token). Non-ACTIVE hosts rejected (404). Spec: `docs/custom-domain-edge.md`. |
| **Custom alias rules** | Alphabet `[a-zA-Z0-9-_]`, max 64, min by plan (FREE 8 / SILVER 5 / GOLD 4 / DIAMOND 3), reserved words list (api, auth, admin, swagger, v1-v3, login, register, refresh, logout, dashboard, profile, billing, settings, users, urls, static, public, assets, css, js, images, img, favicon, robots, sitemap). |
| **Pagination** | `{items, nextCursor: string|null, hasMore}`, cursor opaque Base64url, limit default 20 / cap 100. |
| **429** | Empty body, `Retry-After`, `RateLimit-*` headers; independent buckets `SHORTEN`/`REDIRECT`/`AUTH`. |
| **Redirect** | `GET /{id}` → 302; 404 unknown/archived; 410 expired; 429 rate limited. |
| **Errors** | Always `{status, error, message, timestamp}` (+ `validationErrors` on 400). No CORS (same-origin). |
| **X-Request-Id** | Every request/response carries `X-Request-Id` (UUID per attempt); retry after 401 gets fresh id. Frontend already implements this. |

---

## Frontend Follow-up Actions

| Action | Status |
|--------|--------|
| Update `docs/api-contract.md` to match OpenAPI spec | ✅ Done |
| Update MSW handlers (`src/test/handlers.ts`) for new auth/refresh/rate-limit/version | ✅ Done |
| Verify integration tests pass | ✅ 33/33 pass |
| Update admin probe to use disposable backend (`docker-compose.e2e.yaml`) | ⏳ Pending |
| Update CI to use `/actuator/info` for version check on staging | ⏳ Pending |
| Add plan-based min alias length validation (FREE 8 / SILVER 5 / GOLD 4 / DIAMOND 3) | ⏳ Optional enhancement |

---

## Verification

- `npm run check` — PASS (lint, typecheck, build)
- `npm test` — 38/38 kernel tests pass
- `npm run test:integration` — 33/33 integration tests pass
- All green locally