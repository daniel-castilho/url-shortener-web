# Epic 13: Admin dashboard

**Project:** url-shortener-web
**Depends on:** main 0357cb7 (api-contract admin section + role on AuthResponse)
**Java:** service Epic 10 on their main (ADR 0011, APP_ADMIN_EMAILS)

**Objective:** The single human admin can list users, open a user's links, find a short code, block/unblock a user, force-archive a link. No actuator UI. No branded domains.

## In scope

1. role from /me (cookie) or AuthResponse (bearer). PrivateAdmin: USER → / , anonymous → /login.
2. /admin/users — cursor grid, q = email prefix.
3. /admin/users/:userId — that user's links (archived visible).
4. Code lookup field → /admin/urls?code= or a result panel.
5. Dialog block / unblock; hide or disable self-block (400).
6. Dialog force-archive on a link row.
7. Login/refresh/Home authenticated: 403 "Account blocked." mapped — not "invalid credentials".
8. MSW handlers + specs. Nav "Admin" only if role === ADMIN.

## Out of scope

Actuator, denylist, branded domain, flipping VITE_AUTH_MODE, Sentry, hexagonal modules.

## Acceptance

- USER never sees /admin chrome.
- ADMIN can run the six calls through the UI with contract names.
- npm test + test:integration green; new specs for PrivateAdmin + block 403 copy + prefix q.
