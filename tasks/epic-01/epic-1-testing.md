# Epic 1 – Testing Strategy

No Vitest on main. Do not add a runner just to close this epic.

## 1.1 Type / lint / build

    npm run check

Pass = exit 0. CI on main today only runs npm run build; local gate is stricter.

## 1.2 Grep invariants

    grep -R "location.href" src || true
    grep -R "getToken(" src/App.tsx src/pages || true
    grep -R "accessToken" src/lib || true
    grep -R "from \"react" src/lib/api.ts || true

Pass: no location.href; no getToken( in pages/App.tsx; no accessToken; api.ts does not import React.

## 1.3 Manual matrix (paste into DoD)

| Case | Expected |
| --- | --- |
| Login, F5 on /links | Still authenticated (already true on main) |
| Sair | /, Entrar visible, us.* empty |
| Two parallel 401s | One POST /api/v1/auth/refresh |
| Refresh 401/400 | Nav logged out, URL /login, us.* empty |
| Token without user keys | Mount clears storage (already true) |

## 1.4 CI

.github/workflows/ci.yml already exists. Cite a real gh run list row or mark LOCAL.

Post-epic: authenticated pages keep using useAuth(), never read sessionStorage in views.
