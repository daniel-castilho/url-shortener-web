# Epic 7: Analytics no painel

**Project:** url-shortener-web
**Depends on:** Epic 6 CLOSED on origin/main (da27c01)
**Objective:** The owner sees usage of a link in the panel. No new analytics pipeline on the frontend.

## Why this epic seventh

List/detail already show clickCount if the field is on ShortUrlResponse. The audit wanted a panel, not Grafana. Anything beyond clickCount exists only if docs/api-contract.md already has it.

## Contract gate (do this first)

Open docs/api-contract.md (regenerate from backend OpenAPI if stale).

- If only clickCount exists: Epic 7 is display + empty/zero states + maybe a simple bar of "total clicks". No chart library.
- If a series/breakdown endpoint exists (by day, country, device): consume it with the exact DTO names. Then a small chart is allowed.
- If the endpoint is missing: do not invent GET /api/v1/urls/{id}/stats. File backend debt in AGENTS.md and still close 7.1-7.2 on clickCount.

## In scope

1. clickCount visible on list row and detail (detail already has it — make list consistent).
2. Zero clicks is a number, not a blank.
3. Optional: last-N-days series ONLY with a real contract type.
4. React.lazy for any chart chunk (audit Performance note).
5. 403/404 stay on ApiErrorMessage.

## Out of scope

PostHog/GA, inventing events in the SPA, heatmap, Playwright (EP8), BFF (EP9), extra Mongo queries from the browser.

## Elevated Acceptance Criteria

1. api-contract.md quoted in the PR for every field rendered.
2. No DTO renamed (clickCount stays clickCount).
3. Chart library added only after a series endpoint is cited.
4. Bundle: if a chart lands, it is a separate lazy chunk.
5. npm test green; pure formatters tested (formatClickCount, date buckets if any).

## Traceability

| Story | Focus |
| --- | --- |
| 7.1 | Contract inventory |
| 7.2 | clickCount UX |
| 7.3 | Series UI or explicit N/A |
| 7.4 | lazy chunk if chart |
| 7.5 | Docs / DoD |
