# Epic 10 – Testing Strategy

This epic IS the integration layer.

Always:

    npm test
    npm run test:integration
    npm run check

Grep:

    grep -R "accessToken" src/test || true
    grep -R "vi.mock(.*api" src || true

CI: existing check job grows one step. No Playwright browsers.
