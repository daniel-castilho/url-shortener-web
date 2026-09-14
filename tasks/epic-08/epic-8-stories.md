# Epic 8 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 8.1 | Playwright installed and configured. | @playwright/test in devDependencies. Config: baseURL from env. No extra framework. | package.json |
| 8.2 | Happy path. | Spec covers: register or login, shorten https URL, see shortUrl, go /links, open detail, archive via Dialog. Selectors prefer getByLabel / getByRole. | Audit EP8 |
| 8.3 | CI policy. | Workflow job e2e runs only when a repo variable/secret says the stack is up OR on workflow_dispatch. Default PR CI remains npm test + build. | ci.yml |
| 8.4 | A11y floor. | Login/Register/Home controls have labels (already Input+Label). Archive Dialog has title. Document residual gaps in DoD, do not block on color-contrast tooling. | Epic 5 |
| 8.5 | Gate. | CHANGELOG. README how to run e2e locally. DoD. | Owner |

Out of scope: BFF, axe-core gate, screenshot diffs.
