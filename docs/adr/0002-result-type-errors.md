# ADR 0002: Result type for use-case errors

- **Status:** accepted
- **Date:** 2026-09-13
- **Epic:** 1 (Structure)

## Context

The url-shortener use cases hit a REST gateway that fails in two distinct ways:
transport errors (network, `5xx`) and business errors mapped from HTTP status
(`409` alias taken, `410` expired, `403` not owner). Today the API layer throws
`ApiError(status, message)`, and call sites `try/catch` to reconstruct the
outcome.

Throwing has three problems in a hexagonal module:

1. **Ause-case contract is untyped.** A thrown error carries `status` as
   `unknown` — the caller cannot see, at compile time, which failures a use
   case can produce.
2. **The happy path and the error path are not symmetric.** Returning a value
   vs. `throw` splits the flow; `try/catch` inverts control at every call site.
3. **Fake/partial results are tempting.** Without a typed error, an unfinished
   implementation tends to `return null` or `throw new Error("...")`, silently
   losing the HTTP status the UI needs.

The backend solves the same problem in a REST context differently (exceptions +
`@ControllerAdvice`), but the frontend is pure TypeScript — there is no
framework converting exceptions to responses.

## Decision

Use cases (and any `application/` orchestrator) **return `Result<T, E>`**,
never throw, as their contract:

```ts
// src/shared/kernel/result.ts
export type Err<E> = { ok: false; error: E };
export type Ok<T> = { ok: true; value: T };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T, E = never>(value: T): Result<T, E> => ({ ok: true, value });
export const err = <T = never, E = unknown>(error: E): Result<T, E> => ({ ok: false, error });
```

Module-level error types are **discriminated unions** with a `kind`:

```ts
// src/modules/url-shortener/domain/errors.ts
export type ShortenError =
  | { kind: "invalid-url" }
  | { kind: "alias-taken" }
  | { kind: "rate-limited" }
  | { kind: "transport"; cause: unknown };
```

Mapping rules:

- **Adapters** translate transport/HTTP failures into the domain error union;
  they own `fetch` error knowledge (they know `status`, network, etc.).
- **Use cases** return `Result<T, ShortenError>` and do not throw. A use case
  may map one port error to another, but must stay within its declared `E`.
- **`ApiError` stays** at the `src/lib` layer (auth shell calls it directly —
  see ADR 0001 §Scope); it is not the module's error contract.
- **The `shared/kernel` layer** is the single place `Result` is defined; both
  the module and any future hexagonal context reuse it.

Rejected alternatives:

- **Exceptions keep** (`try/catch` everywhere): fastest to write, but the
  module contract gets no compile-time error surface.
- **ADT keyed by HTTP status only** (`{ status: number }`): collapses business
  semantics to transport codes; the UI would re-parse numbers.
- **Library (`fp-ts`, `neverthrow`)**: a dependency for a 10-line abstraction;
  the project keeps its no-unapproved-dependencies discipline.

## Consequences

**Positive**

- Use-case signatures read like a spec: `shorten(input): Promise<Result<ShortUrl, ShortenError>>`.
- Every error path is explicit; exhaustive handling is enforced by
  discriminated-union narrowing (a missing case is a compile error).
- Adapters stay the only place aware of HTTP status codes — domain and
  presentation speak business language.
- Trivially testable: node's built-in test runner asserts on
  `result.ok === false` without mocking throws.

**Negative / trade-offs**

- Slight ceremony: returns bubble up instead of `throw` unwinding the stack.
- Requires discipline that adapters, not use cases, own transport mapping.
- `Result` helpers (`ok`/`err`) must be used consistently; a stray
  non-result return is a silent contract break the type checker still catches
  at the boundary.
