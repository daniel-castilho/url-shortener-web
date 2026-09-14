# Epic 3 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 3.1 | Form matches the contract and auth. | Fields: originalUrl required; customAlias visible only if isAuthenticated; ttlSeconds optional numeric. Body uses originalUrl, customAlias, ttlSeconds — never renamed. domain omitted unless product asks. | OpenAPI / api-contract.md |
| 3.2 | Cheap validation and pending. | Invalid or empty URL does not call the API. Submit disabled while mutation is pending. Errors go through ApiErrorMessage. | HomePage |
| 3.3 | 429 shows wait time when the backend sends it. | ApiError can carry retryAfterSec parsed from Retry-After. Copy: "Muitas tentativas. Tente em Ns." when N is a number; else mapApiError(429). Other statuses unchanged. | Audit 429 gap |
| 3.4 | Success is usable. | After 201, shortUrl is on screen. Button Copiar writes it to clipboard. Failure to copy shows a line of text, not an alert storm. | Product |
| 3.5 | Gate and handoff. | npm test + npm run check green. CHANGELOG + DoD. New pure helpers have node --test cases. | EP2 runner |

Out of scope: list page cursor, Caddy, Playwright.
