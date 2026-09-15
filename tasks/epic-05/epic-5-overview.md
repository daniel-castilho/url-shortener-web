# Epic 5: Shell & design system

**Project:** url-shortener-web
**Depends on:** Epic 4 CLOSED on origin/main (53c5831)
**Objective:** /, /login, /register, /links and /links/:id look like one product. Not a brand system. Not Tyny marketing.

## Why this epic fifth

Auth, shorten and the library work. The chrome is still raw inputs + one Button. The audit called this consistency, not observability. Do it before Caddy so UAT is not ugly-and-live.

## In scope

1. App shell: header with product name, Nav, user greeting, Sign out — same on every route.
2. shadcn primitives actually used: Input, Label, Card, Textarea if needed, Separator optional, existing Button.
3. Shared EmptyState, PageTitle, form stack spacing.
4. Toast or a single inline Alert pattern for copy/success — pick one; do not add two libraries.
5. Mobile-first: fields full width; Load more and Copy are thumb-reachable; nav wraps.
6. No new visual language beyond the current CSS variables / New York tokens already in index.css.

## Out of scope

Custom brand, charts, Caddy, Playwright, dark-mode project, animation library, replacing TanStack Query.

## Elevated Acceptance Criteria

1. All five routes share the same header/footer spacing (max-w already exists — keep it).
2. Forms use Input+Label, not naked <input className="w-full rounded-md..."> except if a primitive is missing and documented.
3. Empty list uses EmptyState, not an ad-hoc <p>.
4. Destructive actions (archive) ask once (Dialog or confirm window — Dialog preferred).
5. npm test remains 21+; no DOM tests required.
6. DoD pasted outputs.

## Traceability

| Story | Focus |
| --- | --- |
| 5.1 | Shell |
| 5.2 | Form primitives |
| 5.3 | List / empty / detail layout |
| 5.4 | Dialog / feedback |
| 5.5 | Docs / DoD |
