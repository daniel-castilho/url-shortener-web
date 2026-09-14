# Epic 2 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 2.1 | Kernel tests with node --test. No Vitest. | package.json has test script using node --test. Tests cover mapApiError statuses 400/401/403/409/429/default. Tests cover subscribe/emit cleared and refreshed. Tests cover single-flight: two overlapping refresh callers share one promise (extract if needed). npm test exit 0. | Audit red flag 1 |
| 2.2 | Client generates X-Request-Id. | request() sets header X-Request-Id on every fetch including refresh. Value is one UUID per attempt. ApiError has requestId. Error UI that uses mapApiError also prints the id. Backend contract unchanged (echo only). | Audit red flag 3 |
| 2.3 | ErrorBoundary on the shell. | Class or react-error-boundary around AppRoutes (or equivalent). Fallback is PT-BR, has retry that resets. Does not wrap the whole AuthProvider if that hides nav on purpose — pick one; document it. grep confirms a boundary exists. | Audit red flag 2 |
| 2.4 | HomePage matches other pages. | ApiError on shorten uses mapApiError(status). requestId shown if 2.2 landed in the same PR. No String(shorten.error) for ApiError. type=url on the URL field is allowed here (nit). | Audit red flag 5 |
| 2.5 | CI runs tests. | Workflow job: npm ci, npm test, npm run build. DoD pastes gh run list pair or LOCAL. | ci.yml |

Out of scope: src/modules, Playwright, Caddy, Retry-After sentence, cookie/BFF.
