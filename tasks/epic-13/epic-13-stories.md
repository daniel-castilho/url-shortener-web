# Epic 13 – Stories

| # | Story | Acceptance |
| --- | --- | --- |
| 13.1 | Contract client | api.adminUsers, adminUserUrls, adminUrlByCode, adminBlock, adminUnblock, adminForceArchive. Exact paths. |
| 13.2 | role + guard | User type has role. PrivateAdmin. Nav link only for ADMIN. |
| 13.3 | Users grid | limit/cursor/hasMore. q prefix. Columns: email, name, role, blocked, createdAt. |
| 13.4 | User links | Click row → list including deletedAt. Force-archive Dialog. |
| 13.5 | Code search | Input → GET ?code= → owner email + link fields. 404 mapped. |
| 13.6 | Block | Dialog. 204. Self (userId === me) control disabled. Unblock symmetric. |
| 13.7 | 403 blocked | Login and authenticated shorten show Account blocked. / mapApiError. Not 401 copy. |
| 13.8 | Tests + CI | MSW admin handlers. Specs. CHANGELOG. DoD. |
