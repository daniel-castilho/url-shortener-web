# API Contract — url-shortener-service

**Source of truth:** OpenAPI 3.1 spec at `docs/openapi.json` in `url-shortener-service`
(19 endpoints, 20 schemas). This document mirrors the spec for the UI layer.

- Base URL (local dev): `http://localhost:8080`
- Content type: `application/json` on all request/response bodies
- Security schemes (OpenAPI `components.securitySchemes`):
  - `bearerAuth` — HTTP Bearer (JWT in `Authorization` header)
  - `cookieAuth` — API key via `access_token` cookie (HttpOnly, Secure, SameSite=Lax)
- Not applied globally (public endpoints: redirect, auth, actuator).

> Workflow: frontend generates typed client from `docs/openapi.json` (no live backend needed). Any contract change regenerates the spec and commits the delta.

---

## Endpoints

### Auth

| Method | Path | Summary |
| :----- | :--- | :------ |
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Rotate (refresh) tokens |
| GET | `/api/v1/auth/me` | Get current authenticated user |
| POST | `/api/v1/auth/logout` | Logout (clears cookies / local session) |

### Auth Details

**Cookie mode** (backend sets HttpOnly cookies):
- `access_token` — Path=/, HttpOnly, Secure, SameSite=Lax, 24h
- `refresh_token` — Path=/api/v1/auth/refresh, HttpOnly, Secure, SameSite=Lax, 7d
- `Authorization: Bearer` still accepted (Bearer wins if both present).

**Refresh failure = hard logout:** Any `401` from `POST /api/v1/auth/refresh` (token absent, invalid, or expired — via body or cookie) clears **both** cookies with `Max-Age=0` and returns `401`. Scoped **only** to refresh — `401` from `/login` or `/me` does **not** clear cookies.

**Frontend guidance:** Treat refresh `401` as logout → clear local state, navigate to `/login`. On successful refresh, retry the original request **once**.

**Rate limiting:** Auth endpoints (`login`, `register`, `refresh`) have IP-based rate limit (scope `AUTH`) → `429` with `Retry-After` header.

**Response payloads (both modes):**
- `AuthResponse` (login/register/refresh): `{ token, refreshToken, userId, email, name, role? }`
- `UserResponse` (me): `{ userId, email, name, role? }`

Backend returns `token`/`refreshToken` in JSON even in cookie mode — SPA ignores them when cookies are source of truth.

**Refresh success:** `200` + `AuthResponse` + cookies (dual-write, ADR 0010). **Not 204.** Frontend ignores JSON body in cookie mode.

### URLs

| Method | Path | Summary |
| :----- | :--- | :------ |
| GET | `/api/v1/urls` | List authenticated user's links |
| POST | `/api/v1/urls` | Shorten a URL |
| GET | `/api/v1/urls/{id}` | Get link details |
| PATCH | `/api/v1/urls/{id}` | Update a link |
| DELETE | `/api/v1/urls/{id}` | Archive a link |
| GET | `/api/v1/urls/{id}/clicks` | Get link click analytics |
| GET | `/{id}` | Redirect to original URL |

### Domains

| Method | Path | Summary |
| :----- | :--- | :------ |
| GET | `/api/v1/domains` | List claimed domains |
| POST | `/api/v1/domains` | Claim a custom domain |
| POST | `/api/v1/domains/{host}/verify` | Re-trigger DNS verification |
| DELETE | `/api/v1/domains/{host}` | Remove a custom domain |

### Admin (Epic 10)

Requires authenticated user with `role: "ADMIN"`. Anonymous → `401`, authenticated non-admin (`USER`) → `403`.

| Method | Path | Summary |
| :----- | :--- | :------ |
| GET | `/api/v1/admin/users?limit&cursor&q` | List users (email prefix filter) |
| GET | `/api/v1/admin/users/{userId}/urls` | List user's links (includes archived) |
| GET | `/api/v1/admin/urls?code=` | Find link by short code |
| POST | `/api/v1/admin/users/{userId}/block` | Block a user (idempotent) |
| POST | `/api/v1/admin/users/{userId}/unblock` | Unblock a user (idempotent) |
| DELETE | `/api/v1/admin/urls/{id}` | Force-archive any link (idempotent) |

---

## Data Types

### Auth

`RegisterRequest` (all required): `name` (min 1), `email` (format email, min 1), `password` (min 6). → `200` `AuthResponse`.

`LoginRequest` (all required): `email` (format email, min 1), `password` (min 1). → `200` `AuthResponse`.

`RefreshTokenRequest` (required): `refreshToken` (min 1). → `200` `AuthResponse`.

`AuthResponse`:

```ts
{
  token: string;           // access token, ~24h
  refreshToken: string;    // ~7d
  userId: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN"; // absent = USER
}
```

### Shorten

`ShortenRequest` (`originalUrl` required):

```ts
{
  originalUrl: string;   // pattern ^https?://.*
  customAlias?: string;  // pattern ^[a-zA-Z0-9-_]*$, maxLength 64
  ttlSeconds?: number;   // int64, exclusiveMinimum 0
  domain?: string;       // DNS hostname pattern
}
```

**Alias validation (backend enforced):**
- Alphabet: `[a-zA-Z0-9-_]`
- Max length: **64 chars** (new limit — mirror in frontend input)
- Min length by plan: FREE 8 / SILVER 5 / GOLD 4 / DIAMOND 3
- Reserved words: `api`, `auth`, `health`, `admin`, `swagger`, `v1`…`v3`, `login`, `register`, `refresh`, `logout`, `dashboard`, `profile`, `billing`, `settings`, `users`, `urls`, `static`, `public`, `assets`, `css`, `js`, `images`, `img`, `favicon`, `robots`, `sitemap`

`POST /api/v1/urls` → `200` `ShortenResponse`:

```ts
{
  id: string;
  shortUrl: string;
}
```

Errors: `400` invalid URL or custom alias (including exceeding 64 chars), `409` custom alias in use, `429` rate limit exceeded.

### Links (list / detail / update)

`GET /api/v1/urls?limit&cursor` → `200` `LinkListResponse` (`{ items: ShortUrlResponse[]; nextCursor: string | null; hasMore: boolean }`); `400` malformed cursor, `401` unauthenticated. `limit` max 100.

`GET /api/v1/urls/{id}` → `200` `ShortUrlResponse`; `401`, `403` not owner, `404`.

`PATCH /api/v1/urls/{id}` body `UpdateLinkRequest` (all optional): `originalUrl`, `title`, `tags` (array of strings, pattern `[a-z0-9_-]+`, 1–50 chars), `utm` (`UtmParamsRequest`), `expiresAt` (date-time), `domain`. → `200` `ShortUrlResponse`; `400`, `401`, `403`, `404`, `409` (archived immutable).

`DELETE /api/v1/urls/{id}` → `204`; `401`, `403`, `404`.

`ShortUrlResponse`:

```ts
{
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;         // date-time
  userId: string | null;
  isCustomAlias: boolean;
  clickCount: number;        // int64
  expiresAt: string | null;  // date-time
  title: string | null;
  tags: string[] | null;
  utm: UtmParamsResponse | null;
  deletedAt: string | null;  // date-time
  domain: string | null;
}
```

**Canonical `shortUrl`:** Every endpoint that exposes `shortUrl` uses the same resolver (`ShortLinkBaseUrlResolver`):
1. Verified custom domain → `https://<domain>/<id>`
2. `APP_PUBLIC_BASE_URL` (required in prod, always `https://`)
3. Fallback: request origin (dev direct only)

**Do not reconstruct URLs in the frontend** — use the `shortUrl` field as-is.

### Analytics

`GET /api/v1/urls/{id}/clicks?unit&from&to` → `200` `ClickAnalyticsResponse`.

Query params: `unit` (`day` rollup or `hour`, bounded raw series max 30 days), `from` (UTC `yyyy-MM-dd`, defaults to 29 days before `to`), `to` (UTC `yyyy-MM-dd`, defaults to today). `400` invalid unit/range, `401`, `403`, `404`.

`ClickAnalyticsResponse`:

```ts
{
  id: string;
  unit: string;
  from: string;          // date-time
  to: string;            // date-time
  totalClicks: number;   // int64
  series: ClickSeriesPoint[];            // { time: string; clicks: number }
  breakdown: Record<string, Record<string, number>>;
  uniquePerBucket: Record<string, number>;
}
```

### Domains

`ClaimDomainRequest` (required): `host` (min 1). `POST /api/v1/domains` → `201` `DomainResponse`; `400` invalid host, `401`, `409` already claimed.

`GET /api/v1/domains` → `200` `DomainListResponse` (`{ domains: DomainResponse[] }`); `401`.

`POST /api/v1/domains/{host}/verify` → `200`; `400`, `401`, `403` not owner, `404`.

`DELETE /api/v1/domains/{host}` → `204`; `400`, `401`, `403`, `404`.

`DomainResponse`:

```ts
{
  host: string;
  status: "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";
  verificationToken: string;
  createdAt: string; // date-time
}
```

### Admin (Epic 10)

`GET /api/v1/admin/users?limit&cursor&q` → `200` `AdminUserListResponse`:

```ts
{
  items: AdminUserResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

`AdminUserResponse`:

```ts
{
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN"; // live env list, not a stale JWT claim
  blocked: boolean;
  createdAt: string; // date-time
}
```

Query params: `limit` (max 100), `cursor`, `q` (email prefix filter, not contains). Errors: `401`, `403`.

---

`GET /api/v1/admin/users/{userId}/urls` → `200` `LinkListResponse` (uses existing `ShortUrlResponse` items, includes `deletedAt` for archived links). Errors: `401`, `403`, `404` unknown user.

---

`GET /api/v1/admin/urls?code=` → `200` `AdminUrlLookupResponse`:

```ts
{
  item: ShortUrlResponse;    // standard link view, same item shape as GET /api/v1/urls
  ownerUserId: string;       // the link's owning user
  ownerEmail: string | null; // null when the owner document no longer exists
}
```

`code` is the short code (document id). Errors: `401`, `403`, `404` unknown code.

---

`POST /api/v1/admin/users/{userId}/block` → `204` (idempotent). Errors: `400` self-block, `401`, `403`, `404` missing user.

---

`POST /api/v1/admin/users/{userId}/unblock` → `204` (idempotent). Errors: `401`, `403`, `404` missing user.

---

`DELETE /api/v1/admin/urls/{id}` → `204` (idempotent; force-archive, evicts cache). Errors: `401`, `403`, `404` missing link.

---

### Block semantics (for existing SPA)

- Blocked `POST /api/v1/auth/login` and `POST /api/v1/auth/refresh` → `403` body `"Account blocked."` (not `401`).
- Authenticated `POST /api/v1/urls` while blocked → `403`.
- Authenticated `GET /api/v1/urls` while blocked → `200` (read-only access retained).
- Anonymous `POST /api/v1/urls` remains public.

> Backend references: Java ADR 0011 defines the admin role; `APP_ADMIN_EMAILS` environment variable seeds initial admins. This document only mirrors the wire contract.

### Redirect

`GET /{id}` (e.g. `vE1GpYK`) → `302` to original URL; `404` not found, `410` expired, `429` rate limited.

### Version / Build Info

`GET /actuator/info` (public) → `200` with `build.version`:

```ts
{
  build: {
    artifact: "url-shortener-service",
    version: "0.X.Y",
    time: "..."
  }
}
```

Frontend can read `build.version` for compatibility checks on staging (advisory only).

### Error Format

All errors: `{ status, error, message, timestamp }` (+ `validationErrors` on `400`). No CORS (same-origin).

### Client mapping (`src/lib/api.ts`)

Consumes exact fields above — no renamed aliases:

- `api.register(name, email, password)` → `POST /api/v1/auth/register`
- `api.login(email, password)` → `POST /api/v1/auth/login`
- `api.me()` → `GET /api/v1/auth/me`
- `api.logout()` → `POST /api/v1/auth/logout`
- `api.shorten(body)` → `POST /api/v1/urls`
- `api.listUrls(limit, cursor?)` → `GET /api/v1/urls?limit&cursor`
- `api.getUrl(id)` → `GET /api/v1/urls/{id}`
- `api.updateUrl(id, body)` → `PATCH /api/v1/urls/{id}`
- `api.archiveUrl(id)` → `DELETE /api/v1/urls/{id}`

Token refresh: `POST /api/v1/auth/refresh` with `{ refreshToken }` (bearer) or cookie-based (cookie mode), single-flight on 401; hard logout clears `sessionStorage`/cookies and React Query when refresh fails. **Refresh failure (401) clears both cookies with `Max-Age=0`.**

Every request sends `X-Request-Id` header (UUID per attempt; retry after 401/refresh gets fresh id). Carried on `ApiError.requestId` for support triage.

On `429` client reads `Retry-After` (seconds form only; HTTP-date ignored) → `ApiError.retryAfterSec`; error copy shows wait time. Note: `Retry-After` only readable cross-origin if backend exposes via `Access-Control-Expose-Headers`.