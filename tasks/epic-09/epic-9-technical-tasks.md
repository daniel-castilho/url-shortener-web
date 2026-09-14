# Epic 9 – Technical Tasks (frontend only)

## 9.1 Mode + fetch

- [ ] src/lib/auth-mode.ts: isCookieAuth() from VITE_AUTH_MODE === "cookie"
- [ ] .env.example: VITE_AUTH_MODE=bearer
- [ ] request() and refreshTokens(): credentials: "include"
- [ ] Authorization header skipped when isCookieAuth()
- [ ] refresh body omitted when isCookieAuth() (cookie carries refresh)

## 9.2 Storage

- [ ] setSession: if cookie mode, return without writing tokens
- [ ] getToken/getRefreshToken: cookie mode → null
- [ ] User keys unchanged (not secrets)

## 9.3 /me and logout

- [ ] api.me(): GET /api/v1/auth/me
- [ ] api.logout(): POST /api/v1/auth/logout
- [ ] AuthProvider mount in cookie mode: me() → setUser; 401 → emit cleared
- [ ] Until Java exists: treat 404 on those two paths as "not deployed" and keep User from last login body only (tab-only). Document that this is temporary.

## 9.4 Tests

- [ ] auth-mode.test.ts
- [ ] Do not mock a fake Set-Cookie in node --test

## 9.5 Docs

- [ ] twelve-factors.md: Decision 1 dual-mode; XSS residual in bearer
- [ ] CHANGELOG
- [ ] Fill epic-9-dod.md

## Completion checklist

- [ ] bearer default: 28+ kernel tests green
- [ ] grep Authorization in cookie branch absent
- [ ] No Java files in the PR
