# Epic 14 — Definition of Done

## Rule zero — evidence, not assertion

For each story, paste real local or CI evidence tied to the code SHA. Do not infer a pass from a prior run, a report in another checkout, a retry-only green, a skipped test, or a planned environment. No story may claim Staging verification while Staging remains pending.

## Story-level completion

- [ ] Story acceptance criteria are met and demonstrated by its named tests/reviews.
- [ ] Tests follow layer boundaries and are user/contract-oriented, not coupled to implementation detail.
- [ ] Relevant kernel, integration, lint/typecheck/build gates pass. E2E is required only where the story's approved environment is available.
- [ ] New/changed tests are isolated, deterministic, have meaningful assertions and clean up only their own synthetic data.
- [ ] No unapproved dependency or remote environment operation was introduced.
- [ ] Relevant docs and error/risk decisions are synchronized.
- [ ] Changed files are limited to approved story scope; local work is preserved.
- [ ] Evidence is recorded in the format below; open items are called blocked or accepted, never mislabeled complete.

## Epic-level completion gates

### 1. Traceability and scope

- [ ] Critical frontend risks and journeys are mapped to a test, external provider proof, or formally accepted exception with owner and expiry.
- [ ] User-visible functional flows and the API/auth assumptions in scope have appropriate kernel/integration/browser coverage.
- [ ] The test pyramid/trophy is proportionate: rich integration coverage, high-value E2E only, pure kernel retained.

### 2. Required automated feedback

- [ ] Every applicable PR runs kernel tests, RTL/MSW integration tests, lint, typecheck and build as required checks.
- [ ] The CI job label accurately describes checks; a failure returns nonzero and blocks the required check.
- [ ] No `only`, silent critical skip, swallowed rejection or vacuous pass weakens the gate.
- [ ] Coverage scope/baseline/thresholds are documented and reviewed by risk area; coverage is not used alone as a quality claim.
- [ ] Mutation testing has a documented feasibility/baseline decision; if adopted, score and exclusions are reviewed and do not rely on a global 100% target.

### 3. Reliability and diagnostics

- [ ] Critical suites pass independently, in clean runs and under supported parallel execution.
- [ ] First-attempt and retry outcomes are visible; every known critical flake has an owner and tracked remediation.
- [ ] Test duration and flaky rate have a baseline plus approved improvement targets.
- [ ] CI provides actionable logs/reports and Playwright traces/screenshots as configured; artifacts do not leak secrets, session tokens or real user data.

### 4. Accessibility, security and API compatibility

- [ ] Automated accessibility checks cover selected route/states; manual keyboard/focus and assistive-technology review has dated evidence.
- [ ] Client security risks selected from OWASP guidance have tests/reviews and no unsupported claim about server-side controls.
- [ ] MSW/test fixtures match the current API contract; provider verification/consumer contract evidence exists if agreed by frontend/backend owners.

### 5. E2E and environment safety

- [ ] Critical E2E journey has a green, reproducible run against an explicitly approved isolated environment and SHA; mock-only browser tests are not mislabeled as full-stack.
- [ ] Staging readiness was confirmed by DevOps before any Staging test; authorization, target, scope, synthetic identities/data, isolation and artifact policy are recorded.
- [ ] If Staging is still pending, Staging stories remain **blocked** and the epic cannot claim Staging evidence. The team may decide to defer the final 5/5 score rather than waive the gate.
- [ ] Admin probe has run only against isolated/disposable dev under the current policy. It is not routed to Staging/UAT or production.
- [ ] No production operation or test run occurred as part of the epic.

### 6. Documentation and ownership

- [ ] `docs/testing.md` reflects actual commands, required gates, supported layers, environment policy and evidence links.
- [ ] Any UAT/Staging statement cites a real authorized run, timestamp and SHA; planned/pending status is explicit.
- [ ] Owners for future flakiness, thresholds, browser matrix, contract maintenance and Staging integration are named.
- [ ] Epic closure decision is reviewed and approved by project owner; 5/5 remains an evidence-based maturity judgment, not a claim of certification.

## Evidence template — fill per story/run

```text
Story:
Scope:
Commit SHA:
Environment (local / isolated dev / Staging):
Authorization / approved scope (remote only):
Commands or CI workflow:
Run URL / artifact:
First-attempt result:
Retry/flaky result:
Relevant report / trace:
Data cleanup / reset confirmation:
Known limitations / blocked dependencies:
Reviewer / date:
```

## Epic closure record — intentionally blank until execution

```text
Baseline SHA:
PR gates and branch-protection evidence:
Kernel run(s):
Integration run(s):
Lint/typecheck/build run(s):
Coverage report + approved thresholds:
Mutation spike decision/report:
Accessibility automated report + manual review:
Client security test/review evidence:
Contract/provider verification evidence:
Playwright isolated-backend run(s):
Staging status (DevOps): PENDING until evidenced
Staging authorization and run (if later approved):
Admin probe target (must be disposable dev under current policy):
Flaky rate/first-attempt trend:
Open risks/exceptions and owners:
Final maturity decision and approver:
```

**No evidence has been populated by the planning task.** No tests, CI changes, staging access, probe, commit, push, merge or release are represented as completed.
