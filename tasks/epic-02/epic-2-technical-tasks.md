# Epic 2 – Technical Tasks

## 2.1 node --test

- [ ] Add script "test": "node --test --experimental-strip-types" (or the flag set that works on Node 24 for .ts). If strip-types is painful, use .test.mjs importing compiled JS — prefer TS-in-node if CI Node is 24.
- [ ] src/lib/errors.test.ts (or tests/errors.test.ts) — mapApiError table.
- [ ] src/lib/session-events.test.ts — subscribe, emit cleared/refreshed, unsubscribe does not fire.
- [ ] Extract refresh single-flight into a function testable without fetch mock soup OR test a tiny refreshCoordinator module. Do not mount React.
- [ ] npm test green locally.

## 2.2 X-Request-Id

- [ ] Helper newRequestId() using crypto.randomUUID().
- [ ] request() creates one id, sets header X-Request-Id. Retry-after-401 reuses the same id or a new one — pick new-id-per-attempt and document it in twelve-factors or api-contract note.
- [ ] refreshTokens() also sends X-Request-Id.
- [ ] ApiError(status, body, requestId?).
- [ ] Pages that already map errors: Login, Register, Links, Detail, and Home after 2.4 — show id when present.

## 2.3 ErrorBoundary

- [ ] src/components/ErrorBoundary.tsx — fallback + button Tentar de novo.
- [ ] Wire in App.tsx around routes (not around the entire document if Nav should survive).
- [ ] No Sentry. No window.onerror pipeline.

## 2.4 HomePage

- [ ] Replace String(shorten.error) with mapApiError when instanceof ApiError.
- [ ] Optional: input type="url".

## 2.5 CI

- [ ] .github/workflows/ci.yml: after npm ci run npm test then npm run build.
- [ ] Node 24 already in workflow — keep it.

## 2.6 Docs

- [ ] CHANGELOG [Unreleased] line.
- [ ] AGENTS.md debt: tests runner exists; X-Request-Id exists.
- [ ] Fill epic-2-dod.md with pasted outputs.

## Completion checklist

- [ ] npm test pasted
- [ ] npm run check pasted
- [ ] CI run/sha pasted or LOCAL
- [ ] grep ErrorBoundary src hits
- [ ] grep X-Request-Id src/lib/api.ts hits
