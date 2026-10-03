# Epic 13 – Testing Strategy

    npm test
    npm run test:integration
    npm run check

Specs:
- USER visiting /admin → home or login, no grid
- ADMIN grid renders items; Mais when hasMore
- q does not need contains behaviour
- Block Dialog → POST .../block
- Self row: block disabled
- Force archive → DELETE admin urls
- Login 403 Account blocked.

Playwright remains opt-in. No E2E_ENABLED on every PR.
