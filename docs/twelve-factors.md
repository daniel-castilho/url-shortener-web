# Twelve-Factor App — Frontend Auth Decisions

This document records the three authentication decisions for the SPA that are not dictated by the backend's twelve-factor compliance.

## Backend Contract (Fixed)

The backend (`url-shortener-service`) defines:

- Stateless JWT (HS256), no server session — Factor 6
- Two tokens: `access` (~24h, `app.jwt.expiration-ms`), `refresh` (~7d, `app.jwt.refresh-expiration-ms`)
- Endpoints: `POST /api/v1/auth/register|login|refresh`
- Payload: `{ token, refreshToken, userId, email, name }` — field is `token`, not `accessToken`
- Usage: `Authorization: Bearer <token>`
- Refresh: `POST /api/v1/auth/refresh` with `{ refreshToken }` → new access token
- Same-origin via Vite proxy `/api` → `:8080`; no CORS required
- Secret (`APP_JWT_SECRET`) in env only — Factor 3

This contract is closed. The frontend does not need: HttpOnly cookies, CSRF tokens, server-side logout, OpenID, or roles for current features.

---

## Decision 1 — Token Storage: `sessionStorage`

**Choice**: Store `token`, `refreshToken`, `userId`, `email`, `name` in `sessionStorage`.

**Rationale**:

- Aligns with backend's stateless JWT model (Factor 6) — tokens live in client memory/storage, not server
- `sessionStorage` clears on tab close — matches "no session" philosophy; no persistent credential across browser restarts
- `localStorage` would survive XSS = account takeover; `sessionStorage` limits blast radius to the tab
- No mixed storage (some keys in session, some in local) — single source of truth

**Keys**:

```
us.token          → access token
us.refreshToken   → refresh token
us.userId         → user identifier
us.email          → user email
us.name           → user display name
```

> **Security note**: `sessionStorage` is accessible to JavaScript — XSS can exfiltrate tokens. This is acceptable for boilerplate. The next step for production exposure is a thin BFF emitting `HttpOnly; Secure; SameSite=Strict` cookies (Factor 3: config in env, not code).

---

## Decision 2 — 401 Handling: Single-Flight Refresh + Hard Logout

**Behavior**:

1. Request receives `401`
2. **One** refresh attempt shared across all concurrent 401s (mutex / "single flight")
3. Refresh succeeds → update tokens in storage → retry original request **once**
4. Refresh fails (401/400/network/no new token) → **hard logout**:
   - Clear all `us.*` keys from `sessionStorage`
   - Invalidate React Query cache
   - Navigate to `/login` (SPA transition, no full reload)
5. No proactive refresh timer — access TTL (24h) makes reactive-on-401 correct
6. Skip refresh for: `/login`, `/register`, `/refresh` endpoints

**Why not rotation / proactive refresh**:

- Backend refresh endpoint returns new `access` (+ optionally new `refreshToken`); no documented rotation requirement
- Access TTL is 24h — proactive renewal adds complexity without benefit
- Single-flight prevents refresh token burnout under concurrent 401s

---

## Decision 3 — Reactive Session: React Context (`AuthProvider`)

**Choice**: Wrap app in `AuthProvider` exposing:

```ts
interface AuthContextValue {
  user: User | null; // { userId, email, name } | null
  token: string | null; // access token
  isAuthenticated: boolean; // !!token
  login(auth: AuthResponse): void;
  logout(): void; // clears storage, invalidates queries, navigate("/")
}
```

**Lifecycle**:

- On mount: read `sessionStorage` → hydrate `user` + `token`
- `login(auth)`: write to storage + update context → instant UI update (nav, Private routes)
- `logout()`: clear storage + `queryClient.invalidateQueries()` + `navigate("/")`
- Reload: `AuthProvider` re-reads storage → UI stays authenticated without full reload

**What this is NOT**:

- Not a server session (Factor 6 unchanged)
- Not cookie/HttpOnly/BFF — tokens remain in JS memory/storage
- Not OpenID / SSO — purely local React state synced with `sessionStorage`

---

## Summary Table

| Decision           | Option Chosen                       | Backend Factor        |
| ------------------ | ----------------------------------- | --------------------- |
| Token storage      | `sessionStorage` (all keys)         | 6 (stateless)         |
| 401 strategy       | Single-flight refresh → hard logout | —                     |
| Session reactivity | React Context + storage sync        | 6 (no server session) |

---

## Out of Scope (Not Auth)

- Cursor pagination, PATCH forms, NGINX `/{id}` proxy, English copy, shadcn forms
- Analytics charts, branded domains, i18n, BFF/Cookie migration
