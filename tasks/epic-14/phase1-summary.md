# Phase 1 Summary (14.4–14.7)

14.4: ✓ CI updated — check job now "Lint + Typecheck + Test + Integration + Build" with explicit lint and typecheck steps. Local check passes (lint/typecheck/build) + tests green.
14.5: ✓ Hygiene already compliant. No .only/.skip in src; conditional skip only in e2e/admin-probe.spec.ts with guards (documented). No code changes.
14.6: ⚠ Coverage baseline blocked pending approval to add @vitest/coverage-v8. Assessment documented; proposed config written.
14.7: 📝 Risk-based policy draft documented (tiers by domain/kernel/admin/pages; exclusions justified; no global 100%).

Artifacts: 14.4-evidence.md, 14.5-evidence.md, 14.6-evidence.md, 14.7-evidence.md
