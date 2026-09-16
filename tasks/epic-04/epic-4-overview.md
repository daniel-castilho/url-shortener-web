# Epic 4: Links library

**Project:** url-shortener-web
**Depends on:** Epic 3 CLOSED on origin/main (29d7b02)
**Objective:** The owner can list, open, edit and archive their links without Swagger.

## Why this epic fourth

Shorten works. The list on main is a thin GET with no cursor, no empty state, no PATCH, no archive. That is the rest of the authenticated product.

## In scope

1. GET /api/v1/urls with limit + cursor; render items, nextCursor, hasMore.
2. Empty and pending states (skeleton or a single Loading line — pick one and use it on list + detail).
3. Detail by id: GET /api/v1/urls/{id}.
4. PATCH fields that the contract already has: title, tags, utm, expiresAt (and archived if that is how the API hides a link). Names stay backend-exact.
5. Archive/delete via the existing api helper (DELETE or PATCH archived — follow api-contract.md, do not invent).
6. 403 and 404 go through ApiErrorMessage (mapApiError already has 403).
7. Private routes stay as they are.

## Out of scope

Charts (EP7), Caddy (EP6), Playwright (EP8), hexagonal extract, new table library, infinite-scroll library.

## Elevated Acceptance Criteria

1. First page loads; Load more fetches the next cursor without dropping the current items.
2. Empty list is a sentence, not a blank ul.
3. Detail shows originalUrl, short identity, clickCount if present, expiry if present.
4. PATCH sends only dirty fields; empty strings are omitted.
5. Archive is idempotent from the UI (second click does not explode).
6. 403 copy is the existing owner message; 404 is mapped (add to mapApiError if missing).
7. npm test green; new pure helpers tested.

## Traceability

| Story | Focus |
| --- | --- |
| 4.1 | Cursor list |
| 4.2 | Empty / pending |
| 4.3 | Detail |
| 4.4 | PATCH |
| 4.5 | Archive + 403/404 |
| 4.6 | Docs / DoD |
