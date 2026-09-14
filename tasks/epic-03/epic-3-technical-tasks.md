# Epic 3 – Technical Tasks

## 3.1 Home form

- [ ] originalUrl input stays type=url.
- [ ] customAlias input rendered only when useAuth().isAuthenticated.
- [ ] ttlSeconds optional; send number or omit; do not send empty string.
- [ ] api.shorten already typed — do not invent DTO fields.

## 3.2 Validation / pending

- [ ] Guard before mutate: URL must parse as http(s).
- [ ] Button disabled on isPending.
- [ ] Errors: ApiErrorMessage only.

## 3.3 Retry-After

- [ ] Parse header in request() when status is 429; attach retryAfterSec to ApiError.
- [ ] Pure parseRetryAfter(header: string | null): number | undefined — test it.
- [ ] mapApiError stays status-only; the sentence with N lives next to it (helper or page).

## 3.4 Success + copy

- [ ] Keep last ShortenResponse in page state or mutation data.
- [ ] Copiar uses navigator.clipboard.writeText; catch and set a local message.

## 3.5 Tests and docs

- [ ] parseRetryAfter cases: "12", "0", missing, garbage.
- [ ] CHANGELOG [Unreleased]
- [ ] tasks/epic-03/epic-3-dod.md filled
- [ ] No CI workflow change required unless tests fail today

## Completion checklist

- [ ] Anonymous shorten works
- [ ] Logged-in alias + ttl in the network body
- [ ] 429 copy uses N when header present
- [ ] Copiar works or shows failure
- [ ] npm test pasted
