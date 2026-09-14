# Coding Standards — TypeScript / React / Vite (URL Shortener Web)

Practical reference for solo and AI-assisted development. Goal: **consistency
over time**, not ceremony. Living document — edit as the project evolves.

> **Scope:** this documents the **target** state we are building toward
> (Hexagonal `src/modules/url-shortener/**`, `Result<T, E>` use cases). Code
> that does not yet conform is tracked in `AGENTS.md` and must not be silently
> ignored.

**Language:** All code, comments, commit messages, documentation, DTOs, and
error codes **must be in English**. This is a hard requirement.

**Relationship to other docs:**

| Doc                    | Wins when                                            |
| :--------------------- | ---------------------------------------------------- |
| `AGENTS.md`            | Project conventions, hard agent rules                |
| **This file**          | Day-to-day coding detail that does not fit in AGENTS |
| `docs/api-contract.md` | Wire-level contract (field names, status codes)      |
| `docs/adr/*`           | Architecture decisions and their rationale           |

Where this file conflicts with `AGENTS.md`, **`AGENTS.md` wins**.

---

## 1. Naming

| Element                    | Convention                                 | Example                          |
| :------------------------- | :----------------------------------------- | :------------------------------- |
| Source files (components)  | `PascalCase.tsx`                           | `SignInForm.tsx`                 |
| Source files (modules/lib) | `camelCase.ts`                             | `auth.ts`, `api.ts`, `result.ts` |
| React components           | `PascalCase`, exported function components | `export function LinksTable()`   |
| React hooks                | `use*`                                     | `useLinks()`, `useAuth()`        |
| Types / interfaces         | `PascalCase`                               | `ShortUrlResponse`, `User`       |
| Use-case interfaces        | `*UseCase`                                 | `ShortenUseCase`                 |
| Output ports               | `*Port` / `*Repository`                    | `UrlRepositoryPort`              |
| Request/response DTOs      | `*Request` / `*Response`                   | `ShortenRequest`, `AuthResponse` |
| Error unions               | `*Error`, discriminated on `kind`          | `ShortenError`                   |
| Constants                  | `UPPER_SNAKE_CASE`                         | `ACCESS_TOKEN_KEY`               |
| URL params / query keys    | match the API exactly (`camelCase`)        | `limit`, `cursor`, `ttlSeconds`  |

Name for **what it is or does**, not its transport: `UrlRepositoryPort`, not
`RestApiClientV2`.

---

## 2. Folder structure (Hexagonal frontend)

Only `src/modules/url-shortener/**` is hexagonal (ADR 0001). Everything else
follows the current flat conventions.

```
src/modules/url-shortener/
├── domain/          # models, value objects, error unions — pure TS, no React/fetch
├── application/     # use cases, orchestration — return Result<T, E> (ADR 0002)
├── ports/
│   ├── in/          # use-case interfaces
│   └── out/         # repository/gateway interfaces
├── adapters/
│   └── repositories/  # REST gateway over src/lib/api.ts; owns fetch/HTTP knowledge
├── presentation/    # React components, hooks, pages
└── index.ts         # module public API — the only entry point
```

### Dependency rules (enforced by ESLint — see AGENTS.md)

- `domain/**` → nothing outside its own subtree.
- `application/**` → `domain/**` and `ports/**` only.
- `adapters/**` → `ports/**` and `src/lib/api.ts`; no React, no `fetch` anywhere
  else.
- `presentation/**` → `application/**`, `ports/**`, and infra; never imports
  adapter or domain internals directly.
- `src/lib/api.ts` is the **single** place that calls `fetch`.

---

## 3. TypeScript

- **Strict mode** is on (`tsconfig.app.json`). No `any`; use `unknown` and
  narrow. `as` casts are rare and must have a comment.
- API DTO field names **always match the wire contract** (`docs/api-contract.md`):
  `originalUrl`, `customAlias`, `ttlSeconds`, `nextCursor`, `hasMore`, `token`,
  `refreshToken` — no renamed aliases.
- Nullable DTO fields are `T | null` (mirror JSON `null`), not `T | undefined`.
- Use-case errors are **discriminated unions** keyed on `kind`; exhaustiveness
  is the compiler's job.
- No opinionated utility types; prefer explicit types at public boundaries.

---

## 4. React

- **Function components + hooks only** (no classes).
- One component per file, named after the file. Named exports for
  components; default exports only for route-level pages when the router
  config needs them.
- Data fetching goes through **TanStack Query**; UI never calls `fetch` or a
  repository directly — it calls hooks that wrap use cases.
- **shadcn/ui (New York)** for primitives — extend existing components, don't
  hand-roll buttons/inputs.
- Tailwind v4 utility classes in `className`; keep presentation styling out of
  `application/` and `domain/`.

---

## 5. Auth shell (non-hexagonal by design)

- Session lives in `sessionStorage` via `src/lib/auth.ts` (see
  `docs/twelve-factors.md`); `AuthProvider` (`src/context/AuthContext.tsx`)
  exposes `user`, `token`, `isAuthenticated`, `login`, `logout`.
- 401 handling is **single-flight refresh + hard logout** (`src/lib/api.ts`).
  Never add a second refresh path.
- `ApiError` keeps its shape (`status`, `message`); `mapApiError` stays in
  `src/lib/errors.ts`.

---

## 6. Testing (node built-in runner)

- Runner: **node's built-in test runner** (`node --test`) with
  `--experimental-strip-types`. No Jest/Vitest dependency.
- Tests live next to the code (`.test.ts`/`.test.tsx`) or under the module's
  `__tests__` if they need a shared harness.
- **Domain + application tests do not touch `fetch`, DOM, or React.** Inject a
  fake port; assert on `Result` (ADR 0002).
- Presentation tests (when introduced) use the DOM assertions through the same
  runner setup — no rendering framework dependency unless required.

---

## 7. Linting, formatting, verification

```sh
npm run check      # == lint && typecheck && build
npm run lint       # eslint (flat config)
npm run typecheck  # tsc --noEmit (project exports)
npm run format     # prettier --write .
npm run build      # tsc -b && vite build
```

- **`npm run check` must pass before a task is "done".**
- ESLint flat config (`eslint.config.js`) enforces the ADR 0001 boundaries.
- Prettier is configurable via `.prettierrc` (explicit config, not editor
  settings).

---

## 8. Git

- Commits: `type(scope):` summary — e.g. `feat(module):`, `refactor(auth):`,
  `docs(adr):`, `ci(lint):`. Body in English, imperative mood.
- **Only commit/push what is explicitly requested.** Wait for the human before
  `git add`/`commit`/`push`.
- One logical change per commit; keep the working tree clean between tasks.
