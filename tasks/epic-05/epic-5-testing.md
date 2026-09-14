# Epic 5 – Testing Strategy

No jsdom suite in this epic. Visual check is the matrix.

## 5.1 Automated

    npm test
    npm run check

Must not drop below current kernel count without a pasted reason.

## 5.2 Grep invariants

    grep -R "location.href" src || true
    grep -R "accessToken" src/lib || true

## 5.3 Manual matrix (can be done without Java for layout; API cases stay Hypothesis)

| Case | Expected |
| --- | --- |
| / /login /register /links /links/:id | Same header |
| 375px width | Fields usable, nav wraps, no horizontal scrape |
| Empty list | EmptyState |
| Archive | Dialog then existing archive call |
| Kernel tests | Still green |

## 5.4 CI

Existing job. Cite run/sha or LOCAL.
