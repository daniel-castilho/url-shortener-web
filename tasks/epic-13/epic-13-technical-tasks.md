# Epic 13 – Technical Tasks

- [ ] src/lib/api.ts functions only; field names from docs/api-contract.md
- [ ] Routes in App.tsx: /admin, /admin/users, /admin/users/:userId
- [ ] Pages under src/pages/admin/
- [ ] Same Card / Dialog / EmptyState / ApiErrorMessage
- [ ] Query keys ["admin","users"], ["admin","user", id, "urls"], ["admin","code", code]
- [ ] Invalidate those keys after block/archive
- [ ] mapApiError: 403 on login/refresh/shorten → Account blocked when body/message matches; do not steal owner 403 on another user's link
- [ ] MSW in src/test/handlers.ts
- [ ] CHANGELOG + DoD

Self-block: compare userId to context user.userId.
