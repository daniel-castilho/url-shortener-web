# API Contract — url-shortener-service

Source of truth: the OpenAPI spec served at `/v3/api-docs` by the backend
(`ca.tyny.urlshortener`). Field names, payloads, and status codes below are
captured verbatim from that spec so the UI layer can mirror the API exactly.

- Base URL (local dev): `http://localhost:8080`
- Content type: `application/json` on all request/response bodies
- Auth: `Authorization: Bearer <token>` header (spec does **not** declare a
  security scheme; the access token comes from `POST /api/v1/auth/login|register`)

> Regenerate this file with the current spec. The OpenAPI endpoint is gated:
> the backend must run with `app.security.swagger.enabled=true`.

## Endpoints

### Auth

| Method | Path                    | Summary                 |
| :----- | :---------------------- | :---------------------- |
| POST   | `/api/v1/auth/register` | Register a new user     |
| POST   | `/api/v1/auth/login`    | Login                   |
| POST   | `/api/v1/auth/refresh`  | Rotate (refresh) tokens |

### URLs

| Method | Path                       | Summary                         |
| :----- | :------------------------- | :------------------------------ |
| GET    | `/api/v1/urls`             | List authenticated user's links |
| POST   | `/api/v1/urls`             | Shorten a URL                   |
| GET    | `/api/v1/urls/{id}`        | Get link details                |
| PATCH  | `/api/v1/urls/{id}`        | Update a link                   |
| DELETE | `/api/v1/urls/{id}`        | Archive a link                  |
| GET    | `/api/v1/urls/{id}/clicks` | Get link click analytics        |
| GET    | `/{id}`                    | Redirect to original URL        |

### Domains

| Method | Path                            | Summary                     |
| :----- | :------------------------------ | :-------------------------- |
| GET    | `/api/v1/domains`               | List claimed domains        |
| POST   | `/api/v1/domains`               | Claim a custom domain       |
| POST   | `/api/v1/domains/{host}/verify` | Re-trigger DNS verification |
| DELETE | `/api/v1/domains/{host}`        | Remove a custom domain      |

### Admin (Epic 10)

Requires authenticated user with `role: "ADMIN"`. Anonymous → `401`, authenticated non-admin (`USER`) → `403`.

| Method | Path                                        | Summary                             |
| :----- | :------------------------------------------ | :---------------------------------- |
| GET    | `/api/v1/admin/users?limit&cursor&q`        | List users (email prefix filter)    |
| GET    | `/api/v1/admin/users/{userId}/urls`         | List user's links (includes archived) |
| GET    | `/api/v1/admin/urls?code=`                  | Find link by short code             |
| POST   | `/api/v1/admin/users/{userId}/block`        | Block a user (idempotent)           |
| POST   | `/api/v1/admin/users/{userId}/unblock`      | Unblock a user (idempotent)         |
| DELETE | `/api/v1/admin/urls/{id}`                   | Force-archive any link (idempotent) |

## Data Types

### Auth

`RegisterRequest` (all required): `name` (min 1), `email` (format email, min 1),
`password` (min 6). → `200` `AuthResponse`.

`LoginRequest` (all required): `email` (format email, min 1), `password` (min 1).
→ `200` `AuthResponse`.

`RefreshTokenRequest` (required): `refreshToken` (min 1). → `200` `AuthResponse`.

`AuthResponse`:

```ts
{
  token: string; // access token, ~24h
  refreshToken: string; // ~7d
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
  customAlias?: string;  // pattern ^[a-zA-Z0-9-_]*$
  ttlSeconds?: number;   // int64, exclusiveMinimum 0
  domain?: string;       // DNS hostname pattern
}
```

`POST /api/v1/urls` → `200` `ShortenResponse`:

```ts
{
  id: string;
  shortUrl: string;
}
```

Also documented: `400` invalid URL or custom alias, `409` custom alias in use,
`429` rate limit exceeded.

### Links (list / detail / update)

`GET /api/v1/urls?limit&cursor` → `200` `LinkListResponse`
(`{ items: ShortUrlResponse[]; nextCursor: string; hasMore: boolean }`);
`400` malformed cursor, `401` unauthenticated. `limit` max 100.

`GET /api/v1/urls/{id}` → `200` `ShortUrlResponse`; `401`, `403` not owner, `404`.

`PATCH /api/v1/urls/{id}` body `UpdateLinkRequest` (all optional): `originalUrl`,
`title`, `tags` (array of strings, pattern `[a-z0-9_-]+`, 1–50 chars),
`utm` (`UtmParamsRequest`), `expiresAt` (date-time), `domain`.
→ `200` `ShortUrlResponse`; `400`, `401`, `403`, `404`, `409` (archived immutable).

`DELETETE /api/v1/urls/{id}` → `204`; `401`, `403`, `404`.

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

`UtmParamsRequest` / `UtmParamsResponse`: `source`, `medium`, `campaign`, `term`,
`content` — all optional strings.

### Analytics

`GET /api/v1/urls/{id}/clicks?unit&from&to` → `200` `ClickAnalyticsResponse`.

Query params: `unit` (`day` rollup or `hour`, bounded raw series max 30 days),
`from` (UTC `yyyy-MM-dd`, defaults to 29 days before `to`), `to` (UTC
`yyyy-MM-dd`, defaults to today). `400` invalid unit/range, `401`, `403`, `404`.

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

`ClaimDomainRequest` (required): `host` (min 1). `POST /api/v1/domains` →
`201` `DomainResponse`; `400` invalid host, `401`, `409` already claimed.

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

`GET /api/v1/admin/urls?code=` → `200` `AdminUrlResponse`:

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
  ownerUserId: string;
  ownerEmail: string | null; // may be null
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

These are documented for the UI; no new pages are implemented in this sync.

- Blocked `POST /api/v1/auth/login` and `POST /api/v1/auth/refresh` → `403` body `"Account blocked."` (not `401`).
- Authenticated `POST /api/v1/urls` while blocked → `403`.
- Authenticated `GET /api/v1/urls` while blocked → `200` (read-only access retained).
- Anonymous `POST /api/v1/urls` remains public.

> Backend references: Java ADR 0011 defines the admin role; `APP_ADMIN_EMAILS` environment variable seeds initial admins. This document only mirrors the wire contract.

### Redirect

`GET /{id}` (e.g. `vE1GpYK`) → `302` to original URL; `404` not found,
`410` expired, `429` rate limited.

## Client mapping (`src/lib/api.ts`)

The client requests below consume the exact fields above — no renamed aliases:

- `api.register(name, email, password)` → `POST /api/v1/auth/register`
- `api.login(email, password)` → `POST /api/v1/auth/login`
- `api.shorten(body)` → `POST /api/v1/urls`
- `api.listUrls(limit, cursor?)` → `GET /api/v1/urls?limit&cursor`
- `api.getUrl(id)` → `GET /api/v1/urls/{id}`
- `api.updateUrl(id, body)` → `PATCH /api/v1/urls/{id}`
- `api.archiveUrl(id)` → `DELETE /api/v1/urls/{id}`

Token refresh: `POST /api/v1/auth/refresh` with `{ refreshToken }`, single-flight
on 401; hard logout clears `sessionStorage` and React Query when refresh fails.

Client-only addition (backend echoes, no contract change): every request,
including the refresh call, sends an `X-Request-Id` header (UUID generated per
attempt — a retry after 401/refresh gets a fresh id). The id is carried on
`ApiError.requestId` and displayed in the error UI for support triage.

On `429` the client reads `Retry-After` (seconds form only; HTTP-date is
ignored) and carries it on `ApiError.retryAfterSec`; when present the error
copy shows the wait time. Note: `Retry-After` is only readable cross-origin
if the backend exposes it via `Access-Control-Expose-Headers` — otherwise the
generic `429` copy applies. Wire format unchanged.
