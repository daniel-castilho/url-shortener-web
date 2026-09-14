# AGENTS.md — Guidelines for AI & Human Contributors

**URL Shortener Web** — the browser UI for
[`url-shortener-service`](https://github.com/daniel-castilho/url-shortener-service).
A Vite + React 19 SPA (TypeScript strict, Tailwind v4, TanStack Query, React
Router 7) talking to the REST API over `/api/v1`. Redirects (`GET /{id}`) stay
on the backend; there is no BFF in this cut.

- **Repository:** `daniel-castilho/url-shortener-web`
- **Runtime:** Node (check `.nvmrc`/`engines` if present) + Vite dev server.
- **State:** auth session in `sessionStorage` (see `docs/twelve-factors.md`),
  server cache via TanStack Query.

Sources of truth: `README.md`, `package.json`, `docs/api-contract.md`,
`docs/coding-standards.md`, `docs/adr/*`, `docs/testing.md`,
`docs/twelve-factors.md`. Re-read the relevant parts before starting any task.

> **Scope:** this documents the **target** architecture we are building toward,
> not only current on-disk code. `src/modules/url-shortener/**` is the module
> under refactor; gaps are tracked in [Known Technical Debt](#known-technical-debt)
> and must not be silently ignored.

---

## Critical Rules (Never Violate)

1. **API Contract is the law.** Field names, parameter names, and status codes
   in this UI **must match the backend OpenAPI spec exactly**
   (`docs/api-contract.md`): `token`, `refreshToken`, `userId`, `email`, `name`,
   `originalUrl`, `customAlias`, `ttlSeconds`, `domain`, `items`, `nextCursor`,
   `hasMore`. No renamed aliases in DTO types.

2. **Hexagonal boundaries in `src/modules/url-shortener/**` (ADR 0001):**
   - `domain/**` and `application/**` must **never** import `src/lib/*`, React,
     or call `fetch`.
   - `adapters/**` may import `ports/**` and `src/lib/api.ts` only.
   - `presentation/**` speaks through use cases — never through adapter or
     domain internals.
   - **`src/lib/api.ts` is the single boundary with `fetch`.** No component or
     hook calls `fetch` for API data.

   _Verification command before declaring a task done:_

   ```bash
   npm run check      # runs eslint (incl. boundary rules) + typecheck + build
   ```

3. **Use cases return `Result<T, E>`, never throw (ADR 0002).**
   Module error types are discriminated unions keyed on `kind` (`ShortenError`,
   `LinkError`, …). Adapt translate HTTP statuses into business errors; use
   cases stay within their declared `E`.

4. **Auth is single-flight.** One shared refresh on `401`, retry once; on
   refresh failure **hard logout** (clear `sessionStorage`, invalidate React
   Query, SPA `navigate("/login")`). Never add a second refresh path. Skip
   refresh for `/login`, `/register`, `/refresh`. (See `docs/twelve-factors.md`.)

5. **Security & secrets:**
   - `sessionStorage` tokens are JS-readable — never log them, never put them
     in query strings or URLs.
   - **Never commit** `.env` or any real token. `.env.*` are gitignored;
     `.env.example` documents variables (mirrors `VITE_API_BASE_URL`).
   - No credentials in comments, `console.log`, or committed files.

6. **English only in the codebase.** Identifiers, comments, commit messages,
   docs, DTOs, error codes — all English.

7. **No unapproved dependencies.** Do not `npm install` a package (or remove
   one) without explicit human approval. Check `package.json` first — native
   APIs (`fetch`, `navigator`, node test runner) are preferred.

8. **Doc sync is part of "done".** After a feature or architecture change,
   update `README.md`, `docs/api-contract.md` (if wire behavior changed),
   `CHANGELOG.md`, and this file's debt matrix where affected.

9. **`npm run check` must pass green** (lint + typecheck + build) before a
   task is considered complete.

10. **Only commit/push when explicitly asked.** Run `git status`, `git diff`,
    and stage only intended files. Commit messages: `type(scope):` in English.

---

## Verification commands

```bash
npm run check      # lint (+ boundaries) + typecheck + build  ← "done" gate
npm test           # node --test kernel suite (src/lib)
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # eslint (flat config)
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write .
```

Tests: `npm test` runs `node --test` on `src/lib/*.test.ts` (TS via native
strip-types on Node 24, no flags needed). Domain/application tests never touch
`fetch`, React, or the DOM. New pure helpers ship with a test file in the same
PR. CI runs `npm ci` + `npm test` + `npm run build`.

---

## Releases & tagging

Mirrors the backend discipline (`url-shortener-service/docs/release-runbook.md`),
simplified for the SPA:

- **Version source of truth:** `package.json` `"version"`. Bump it before a
  release; tag `vX.Y.Z` **must** match.
- **Annotated tags only:** `git tag -a vX.Y.Z -m "release summary"`.
- **Tag commit contract:** `## [Unreleased]` in `CHANGELOG.md` is **empty** at
  the tag commit — its content is promoted into a `## [X.Y.Z] - YYYY-MM-DD`
  section in the same commit.
- **`npm run check` is green** at the tagged commit.
- **Release assets:** the tag workflow publishes `url-shortener-web-<tag>.tar.gz`
  (dist archive), `sbom-url-shortener-web-<tag>.json` (CycloneDX SBOM of the
  production dependency tree, via native `npm sbom`) and `SHA256SUMS` (verified
  with `sha256sum -c` inside the job) to the `release-<tag>` artifact **and**
  a GitHub Release. Recipe in `docs/deploy.md` → *Release artifacts*.
- Pushing a tag: `git push origin vX.Y.Z` (after the release commit is pushed).

Every release commit also updates `CHANGELOG.md` (Keep a Changelog) and, if the
wire contract changed, `docs/api-contract.md`.

---

## Architecture

```
src/
├── lib/                       # shared infra — deliberate NOT hexagonal (ADR 0001 §Scope)
│   ├── api.ts                 #   fetch boundary + single-flight refresh
│   ├── auth.ts                #   sessionStorage helpers (session rehydration)
│   └── errors.ts              #   ApiError + mapApiError
├── context/
│   └── AuthContext.tsx        # reactive session provider (user, token, login, logout)
├── shared/
│   └── kernel/
│       └── result.ts          # Result<T, E> helpers (ADR 0002)
├── modules/
│   └── url-shortener/         # hexagon — see docs/adr/0001-hexagonal-frontend.md
│       ├── domain/            #   pure models, value objects, error unions
│       ├── application/       #   use cases → Result<T, E>
│       ├── ports/{in,out}/    #   port interfaces
│       ├── adapters/          #   REST gateway over src/lib/api.ts
│       └── presentation/      #   React hooks/components/pages
└── pages/                     # route shells (auth-flavored today)
```

---

## Known Technical Debt

| Area                           | Gap                                                                                                          |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `src/modules/url-shortener/**` | Not yet extracted — current UI lives in `src/pages/*` + `src/lib/api.ts`; hexagon is target state (ADR 0001) |
| `Result<T, E>` (ADR 0002)      | Use cases not yet in module form; `src/lib/api.ts` still throws `ApiError`                                   |
| ESLint boundaries              | Config added; existing flat code not yet under module gates                                                  |
| Tests                          | Kernel suite (`npm test` = `node --test` on `src/lib`) + integration suite (`npm run test:integration` = Vitest + jsdom + RTL + MSW on `src/**/*.spec.tsx`, no browsers); no coverage floors. Map in `docs/testing.md` |
| Cookie/HttpOnly session        | `sessionStorage` is JS-readable by design (see `docs/twelve-factors.md`); Java HttpOnly cookies are delivered (service ADR 0010); remaining blocker is UAT probe, not missing endpoints. Test coverage map in `docs/testing.md` |
| Release SBOM                  | RESOLVED (Epic 12): tag workflow ships dist archive + CycloneDX SBOM + SHA256SUMS to artifact and GitHub Release; see *Releases & tagging* |

## Backend parity

Behaviors that must match the service:

- **The SPA is served at the edge; redirects stay on Java.** Edge configs
  (`deploy/caddy/Caddyfile`, `deploy/nginx/spa.conf`, law in
  `docs/deploy.md`) proxy `/api*`, `/actuator*` and short-code paths
  (`GET /{id}`) to the API and must never fall back to `index.html` for a
  short code.
- Redirects happen on the backend (`GET /{id}` → 302). The SPA prettifies
  errors like `410` (expired) and `404`, it does **not** redirect.
- Rate limiting on shorten (`429`) is backend-enforced — surface it in the UI,
  don't retry blindly.
- `PATCH /api/v1/urls/{id}` `409` means "archived, immutable".
- Cursor pagination: `GET /api/v1/urls?limit&cursor` → `{ items, nextCursor, hasMore }`.
- Custom domains have verification states `PENDING | VERIFIED | ACTIVE | FAILED`.
