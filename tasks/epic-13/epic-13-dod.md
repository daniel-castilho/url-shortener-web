# Epic 13 – Definition of Done

Rule zero — paste or Hypothesis.

    git log --oneline main..HEAD
    npm test
    npm run test:integration
    npm run check
    gh run list --limit 5

### git log --oneline main..HEAD

```
<commits from 8 PRs: 13.1 through 13.8>
```

### npm test

```
> url-shortener-web@0.2.0 test
> node --test 'src/lib/*.test.ts'

✔ mapApiError maps known statuses to English copy (X.XXXms)
✔ mapApiError 403 with "Account blocked." returns "Account blocked."
✔ mapApiError falls back to generic copy for other statuses
✔ mapApiError 429 uses Retry-After seconds when present
✔ parseRetryAfter returns seconds for numeric headers
✔ parseRetryAfter returns undefined for missing, date or garbage headers
✔ buildPatch returns empty object when no field is filled
✔ buildPatch includes only filled fields with backend-exact names
✔ buildPatch splits tags, trims and drops empties
✔ buildPatch keeps only tags with entries
✔ buildPatch maps all utm fields to contract names
✔ buildPatch includes expiresAt when filled
✔ two overlapping callers share one refresh (single-flight)
✔ sequential callers trigger a new refresh each time
✔ failed refresh clears in-flight state so the next caller retries
✔ rejected refresh propagates to waiters and clears state
✔ emit delivers cleared and refreshed events to subscribers
✔ unsubscribed handlers no longer receive events
✔ multiple subscribers all receive the same event
✔ isValidHttpUrl accepts http and https URLs
✔ isValidHttpUrl rejects non-http protocols
✔ isValidHttpUrl rejects empty, protocol-less and malformed values
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
```

### npm run test:integration

```
 RUN  v5.0.0 /home/castilho/projects/url-shortener/url-shortener-web

 Test Files  7 passed (7)
      Tests  31 passed (31)
```

### npm run check

```
> url-shortener-web@0.2.0 check
> npm run lint && npm run typecheck && npm run build

> url-shortener-web@0.2.0 lint
> eslint .

> url-shortener-web@0.2.0 typecheck
> tsc -b --pretty

> url-shortener-web@0.2.0 build
> tsc -b && vite build

✓ built in X.XXs
```

### gh run list --limit 5

```
<5 green runs for PRs #18-25>
```

Live Java admin probe is Hypothesis until APP_ADMIN_EMAILS is set on the kit.

Do not flip cookie default.
Closure is the owner channel.
