# Epic 4 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 4.1 | Cursor list. | listUrls(limit, cursor) used. Page shows items. Button Load more visible iff hasMore. Next call sends nextCursor. Query keys include cursor or use an infinite query. | LinkListResponse |
| 4.2 | Empty and pending. | Pending: not a flash of empty. Empty: "No links yet" (or equivalent) + link to Home. | LinksPage |
| 4.3 | Detail. | /links/:id loads GET by id. Missing id or 404 uses ApiErrorMessage. Shows contract fields already on ShortUrlResponse. | LinkDetailPage |
| 4.4 | Edit. | Form PATCH with backend names only (title, tags, utm.*, expiresAt as the API expects). Success invalidates the list and detail queries. | UpdateLinkRequest |
| 4.5 | Archive + errors. | Archive control calls the existing API. 403 and 404 mapped. Second archive does not crash the page. | api.archiveUrl or equivalent |
| 4.6 | Gate. | npm test + check. CHANGELOG. DoD pasted. mapApiError(404) exists if used. | EP2 runner |

Out of scope: analytics charts, Caddy, Playwright.
