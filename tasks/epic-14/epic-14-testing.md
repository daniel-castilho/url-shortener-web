# Epic 14 — Testing Strategy

## Goal

The epic is itself about testing. This document sets the test layers and evidence expected while implementing the stories. It does **not** report any test as executed or green.

## Layered strategy

| Layer | Current tool | Appropriate scope | Required evidence |
| --- | --- | --- | --- |
| Static | ESLint, TypeScript (`npm run lint`, `npm run typecheck`) | syntax/type errors, test-code correctness, agreed boundaries | command/run log and nonzero failure behavior |
| Kernel | Node `node:test` (`npm test`) | pure parsing, URL rules, error mapping, patch rules, auth mode, refresh coordination, session events | deterministic assertions for critical normal/error/boundary/concurrent cases |
| Integration | Vitest + jsdom + RTL + user-event + MSW (`npm run test:integration`) | React pages/providers/router/query/API boundary; states visible to users | semantic interaction, MSW request/response assertions, no unexpected network, isolated setup |
| Browser E2E | Playwright (`npm run e2e`) | small number of high-risk journeys through built SPA and approved API/backend | exact base URL/environment, unique synthetic data, HTML report and failure trace/screenshot |
| Contract | Existing `docs/api-contract.md`; optionally Pact with provider-owner participation | consumer request/response assumptions and cross-repository drift | provider verification result tied to compatible consumer/provider revision |
| Accessibility | RTL semantic queries; axe in Playwright if approved; manual keyboard/AT checks | interactive route/state accessibility | automated report plus dated human-review record; no claim based solely on axe |
| Mutation | Stryker spike, only after dependency approval | strength of assertions in selected high-risk logic | baseline, scope, surviving mutant review, runtime, justified exclusions |

## Test data and isolation

- Every unit/integration test is independent, repeatable and safe to run in any order.
- MSW handlers are the only network mock for RTL integration. They speak the exact documented API contract; unhandled calls fail.
- Each RTL test receives fresh providers and reset handlers/query state.
- Each Playwright test receives its own browser context and unique synthetic data. No test depends on a prior test's account/session or shared mutation.
- Do not rely on real time, arbitrary sleeps, external services, production credentials or real user data.
- Do not expose secrets in source, artifacts, logs, traces or screenshots.

## Scenario matrix

### Auth/session

- Bearer: expected `Authorization` behavior, `/me` hydration, logout local behavior, terminal 401, blocked 403.
- Cookie: expected cookie request behavior and no unintended storage token, only when backend supports and documents the mode.
- Refresh: concurrent 401 calls share a refresh; successful refresh retries once; refresh rejection clears local session according to current contract; auth endpoints do not recursively refresh.
- UI: loading/anonymous/authenticated/blocked/failure states and correct navigation/copy.
- Evidence boundary: UI tests do not prove cookie flags, server-side revocation, or authorization enforcement; those require provider/backend evidence.

### URL/link lifecycle

- Client-side validation prevents invalid requests.
- Creation success surfaces canonical returned short URL and copy affordance.
- 400, 401/403, 429 plus `Retry-After`, server and network errors have the expected presentation.
- List tests cover loading, empty, failure, items, cursor pagination and stable identity.
- Edit tests verify partial PATCH shape exactly; archive tests verify confirm/cancel and error handling.

### Administration

- Anonymous/user/admin route and navigation behavior.
- User list and cursor/search; user links; code lookup; block/unblock; self-block protection; force archive.
- Every positive assertion must be tied to visible outcome or the intended network request; prevent vacuous success.
- The live admin probe writes data and remains limited to isolated/disposable dev under current policy.

### Accessibility/security

- Prefer roles and accessible names; verify labels and user-visible errors.
- Include keyboard focus/order, dialog containment/return, Escape behavior and visible focus.
- Run automated accessibility rules on representative dynamic states and review incomplete findings manually.
- Use OWASP client-side guidance to prioritize DOM/HTML injection surfaces, redirects, storage/token exposure, external links and unsafe artifact/log content.
- No security testing of remote hosts without explicit authorized scope.

## Playwright environment policy

1. **Local development:** local SPA + local isolated test backend or explicitly isolated fake API as the scenario requires. Do not describe an MSW-only test as backend E2E.
2. **CI pull request:** fast required static/kernel/integration checks on every PR. Browser E2E becomes a required PR gate only when it can use an owned ephemeral backend/test data safely and reproducibly; otherwise use an approved release gate until that environment exists.
3. **Disposable dev backend:** permitted for admin probe only when explicitly configured as isolated/disposable; reset instructions and destructive write effects must be understood.
4. **Staging/UAT:** DevOps is preparing it; status is currently pending. After readiness, access controls, test data, isolation, owner and explicit authorization are established, run only the approved scope. Start with non-destructive smoke/representative journeys. Staging's existence does not itself authorize a run.
5. **Production:** out of scope for this epic's test runs.

Current standing restriction: `e2e/admin-probe.spec.ts` must not be run against Staging/UAT or production. Changing that restriction requires explicit approval plus a review of its writes, account creation, cleanup and blast radius.

## Gate and diagnostic policy

- Required PR checks should cover kernel, integration, lint, typecheck and build. The current workflow's actual contents must be reviewed before changing it.
- E2E job status must distinguish `passed`, `failed`, and `flaky` (failed first run but passed retry); retries never erase the underlying evidence.
- Retain Playwright HTML reports and trace on failure/retry according to approved storage/retention. Review artifacts for secrets before upload.
- No critical tests are silently skipped; each exception has owner, issue and expiry/review date.
- Track per-layer duration, first-attempt pass rate and failure category. Define targets from observed baseline rather than arbitrary industry numbers.
- Reproduce failing commands locally from documented Node/browser versions; all test commands must have a nonzero exit on relevant failures.

## Coverage and mutation policy

- Capture Vitest coverage on an explicit source scope; separately account for the Node kernel if the chosen tool supports it.
- Review branches for critical decision logic. Do not use project-wide line percentage as proof of a critical path.
- Establish baseline before thresholds. Agree a gradual, per-risk threshold and document exclusions.
- Mutation testing is a planned evaluation, not a prerequisite for the first test improvements. Stryker's official Vitest runner applies to Vitest; the project's kernel uses `node:test`, so compatibility and runtime need a spike.
- Review equivalent/unreachable survivors instead of mechanically pushing to 100% mutation score.

## Completion evidence

Each story's evidence entry should identify:

- Story ID and scope.
- Exact command(s), environment and result.
- Commit SHA / CI run link / report artifact.
- First-attempt status and retry/flaky status.
- Test-data cleanup or environment reset evidence where applicable.
- Open failures, accepted risks, owner and expiry.
- Explicit statement if the story is blocked by Staging, backend provider work, dependency approval or authorization.
