# ADR 0001: Hexagonal frontend — `src/modules/url-shortener`

- **Status:** accepted
- **Date:** 2026-09-13
- **Epic:** 1 (Structure)

## Context

The UI is growing beyond the auth shell: shorten, link list/detail/update, custom
domains, click analytics. The current tree flattens API concerns into
`src/lib/*` and React into `src/pages`. Adding features indiscriminately there
produces the same leak the backend faced before its refactor: presentation
importing transport types, domain logic tangled with `fetch`, and routes that
start depending on how things are stored, not what the domain does.

The backend project (`url-shortener-service`) already settled on Hexagonal
Architecture (Ports & Adapters) with `core/` free of framework/adapter imports,
enforced by a boundary-check script. This frontend is its browser counterpart —
it consumes the exact same REST contract and lives in the same repository
ecosystem (same repo owner, same release discipline). The two projects should
**not** diverge in architecture philosophy.

## Decision

Apply **Hexagonal Architecture (Ports & Adapters)** to the frontend, scoped to a
single bounded context: the **url-shortener** module under
`src/modules/url-shortener/`.

### Structure

```
src/
├── lib/                          # shared infra, deliberately NOT hexagonal (see ADR 0001 §Scope)
│   ├── api.ts                    # fetch adapter (single boundary with `fetch`)
│   ├── auth.ts                   # session storage helpers
│   ├── errors.ts                 # ApiError + mapApiError
├── context/
│   ├── AuthContext.tsx           # reactive session provider
├── shared/
│   ├── kernel/
│   │   ├── result.ts             # Result<T, E> (ADR 0002)
│   │   └── value-object.ts       # shared value-object helpers
├── modules/
│   └── url-shortener/
│       ├── domain/               # models, value objects, rules (pure TS, no React/fetch)
│       ├── application/          # use cases returning Result<T, E>
│       ├── ports/
│       │   ├── in/               # input ports (use-case interfaces)
│       │   └── out/              # output ports (gateway interfaces)
│       ├── adapters/
│       │   └── repositories/     # REST gateway implemented over src/lib/api.ts
│       ├── presentation/         # React components, hooks, pages for this context
│       └── index.ts              # public module exports (only entry point)
```

### Boundary rules (enforced by ESLint)

- `src/modules/url-shortener/domain/**` and `application/**` **must not import**
  anything outside their own subtree, nor `src/lib/*`, React, or `fetch`.
- `adapters/**` may import `ports/` and `src/lib/api.ts`, but never React.
- `presentation/**` may import `application/`, `ports/`, and infra — never
  `domain/` implementation details directly; it speaks through use cases.
- `src/lib/api.ts` stays the **single** boundary with `fetch`; no component
  calls `fetch` for API data.

Rejected alternatives:

- **Full-hexagonal everywhere** (auth included): auth is a thin shell tied to
  React context and `sessionStorage`; forcing use cases over it adds ceremony
  without a two-sided business context (documented in ADR 0001 §Scope).
- **Plain feature folders without ports**: keeps ordering but not the
  dependency direction — the exact leak the hexagonal layering prevents.
- **No architecture (status quo)**: idler path, but the module is already big
  enough that request types and UI render increasingly out of sync.

## Consequences

**Positive**

- Presentation can be swapped (React → any view-layer) without touching domain.
- Use cases become unit-testable with node's built-in runner — inject a fake
  port, no `fetch`, no React, no DOM (ADR 0002's `Result<T, E>` makes error
  paths first-class).
- ESLint rule makes boundary violations fail the build, mirroring the backend's
  `scripts/check-boundaries.sh`.
- Contracts stay in one place (`ports/`), driven by `docs/api-contract.md`.

**Negative / trade-offs**

- More files per feature than a flat `pages/` + `lib/` layout.
- Requires discipline: presentation must not bypass `application/`.
- `src/lib/*` and `src/context` remain non-hexagonal by design — a deliberate,
  documented exception, not an accident.
