# Epic 7 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 7.1 | Inventory. | PR lists endpoints/fields from api-contract.md used for analytics. Missing series = N/A + AGENTS debt line pointing at the Java repo. | api-contract.md |
| 7.2 | Totals. | List row shows clickCount. Detail headline shows clickCount. Zero renders 0. | ShortUrlResponse |
| 7.3 | Series or skip. | IF contract has a time series or breakdown: page section renders it with backend field names. ELSE story is N/A in DoD. | OpenAPI |
| 7.4 | Weight. | Chart code (if any) loaded via React.lazy on the detail route only. | Audit Performance |
| 7.5 | Gate. | npm test + check. CHANGELOG. DoD. | EP2 runner |

Out of scope: third-party analytics SaaS, Playwright.
