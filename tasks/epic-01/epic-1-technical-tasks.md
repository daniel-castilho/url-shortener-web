# Epic 1 – Technical Tasks

Do not recreate errors.ts, auth.ts, AuthContext.tsx, or twelve-factors.md.

## 1.1 Hard-logout bridge (the actual work)

- [ ] Add a tiny session notifier in src/lib (e.g. src/lib/session-events.ts) with subscribeSession(handler) and emitSession({ type: "cleared" | "refreshed" }). No React.
- [ ] In api.ts, on refresh failure (after clearSession + clearUser): emitSession({ type: "cleared" }).
- [ ] Optional: on refresh success: emitSession({ type: "refreshed" }).
- [ ] AuthProvider subscribes on mount: cleared sets user/token null, queryClient.clear(), navigate("/login") if not already there; refreshed sets token/user from getToken()/getUser().
- [ ] Unsubscribe on unmount.
- [ ] Confirm api.ts imports stay: auth + session-events only.

## 1.2 Do not regress what main already does

- [ ] Keep mutex + skip list for /api/v1/auth/login, register, refresh.
- [ ] Keep storage keys split (us.userId / us.email / us.name), not a single us.user JSON blob.
- [ ] Keep login() writing tokens + user and navigating to /links.
- [ ] Keep button Sair calling logout() then queryClient.clear() + navigate("/").

## 1.3 Gates

- [ ] npm run check
- [ ] Leave CI as npm run build unless you explicitly add lint/typecheck jobs (not required to close 1.1).

## 1.4 Docs after 1.1

- [ ] One line in CHANGELOG.md
- [ ] twelve-factors.md Decision 2: state that api.ts emits cleared and the provider navigates
- [ ] Fill epic-1-dod.md with pasted outputs

## Completion checklist

- [ ] Failed refresh from /links ends on /login with empty us.* and logged-out nav
- [ ] grep -R location.href src is empty
- [ ] npx tsc -b and npm run build pasted in the DoD
