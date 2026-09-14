# Epic 8: Confianca

**Project:** url-shortener-web
**Depends on:** Epic 7 CLOSED on origin/main (4abe461)
**Objective:** CI fails if the happy path of the panel breaks. Not coverage theater.

## Why this epic eighth

Kernel tests (28) do not click the product. Manual matrices for EP1-7 are still Hypothesis until Java is up. Playwright against a running API (or a thin mock server) is the missing gate. A11y here is labels/focus/contrast already mostly in place — encode a short checklist, not axe-everything.

## In scope

1. Playwright: login, register optional, shorten, list, open detail, archive (dialog confirm).
2. npm script + CI job that runs e2e when secrets/base URL exist; skip-or-fail documented.
3. Keyboard: login form submittable; Dialog archive focus trap from shadcn left intact.
4. Timeout/offline: one test or a documented UI line if navigator.onLine is false — pick the cheaper one.
5. Do not rewrite the app to please the test runner.

## Out of scope

Full axe CI, visual regression, load test, BFF (EP9), hexagonal extract, 90% UI coverage.

## Elevated Acceptance Criteria

1. playwright.config.ts exists; test dir e2e/ or tests/e2e/.
2. Happy path spec is one file, readable, uses data-testid only where role/label is not enough.
3. CI: new job e2e needs PLAYWRIGHT_BASE_URL (and API up). If the job cannot see Java, it is skip with an explicit if: — do not red-fail main on a missing UAT.
4. npm test (node --test) still 28+ and stays the default gate.
5. DoD pasted; live e2e against Java may stay Hypothesis if no environment in this machine.

## Traceability

| Story | Focus |
| --- | --- |
| 8.1 | Runner + config |
| 8.2 | Happy path spec |
| 8.3 | CI job policy |
| 8.4 | A11y checklist |
| 8.5 | Docs / DoD |
