# Epic 3: Encurtar como produto

**Project:** url-shortener-web
**Depends on:** Epic 2 CLOSED on origin/main (767f50a)
**Objective:** Home is a usable shorten flow on phone and desktop, not a Swagger form.

## Why this epic third

Session and the quality gate exist. The audit still flags Home as thin: no ttl, no vanity unless you know the API, 429 without Retry-After, raw success with no copy. Epic 4 (library) needs a link that was created here.

## In scope

1. Home form: originalUrl (type=url already), optional customAlias only when isAuthenticated, optional ttlSeconds.
2. Client checks: empty/invalid URL blocked before fetch; alias hidden or disabled when logged out.
3. 429 uses Retry-After seconds in the copy when the header exists; fallback stays mapApiError(429).
4. Success: show shortUrl, copy-to-clipboard, keep the last result visible.
5. Pending disables submit; ApiErrorMessage for failures (requestId already exists).
6. Contract fields stay backend names: originalUrl, customAlias, ttlSeconds. No domain picker unless you explicitly add it.

## Out of scope

Cursor list (EP4), PATCH form, Caddy (EP6), charts (EP7), Playwright (EP8), BFF (EP9), hexagonal extract, new toast library.

## Elevated Acceptance Criteria

1. Anonymous can POST /api/v1/urls with only originalUrl.
2. Logged-in user can send customAlias and ttlSeconds; logged-out UI cannot submit alias.
3. 429 with Retry-After: N shows in the message; without header: generic 429 copy.
4. Success row offers copy; clipboard failure is visible, not silent.
5. npm test still green; add tests only for pure helpers (parseRetryAfter, copy wrapper optional).
6. DoD pasted outputs only.

## Traceability

| Story | Focus |
| --- | --- |
| 3.1 | Form fields vs auth |
| 3.2 | Validation + pending |
| 3.3 | 429 + Retry-After |
| 3.4 | Success + copy |
| 3.5 | Tests/docs/handoff |
