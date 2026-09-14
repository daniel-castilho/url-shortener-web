# Epic 5 – Technical Tasks

Add shadcn pieces with the project CLI/pattern already in components.json. Do not hand-roll a second button.

## 5.1 Shell

- [ ] Keep AuthProvider / ErrorBoundary / Private as they are.
- [ ] Header spacing unified; product label links to /.
- [ ] Sair stays logout() from context.

## 5.2 Primitives

- [ ] components/ui/input.tsx, label.tsx, card.tsx at minimum.
- [ ] Replace raw inputs on the four forms.
- [ ] ApiErrorMessage stays; restyle only if needed (text-sm / muted id).

## 5.3 List / empty / detail

- [ ] components/EmptyState.tsx — title + optional action slot.
- [ ] LinksPage rows: id/title + originalUrl + clickCount if present.
- [ ] Detail field list inside Card.

## 5.4 Dialog / feedback

- [ ] Dialog on archive.
- [ ] Do not introduce sonner and a custom toast and alert — one path.

## 5.5 Docs

- [ ] CHANGELOG [Unreleased]
- [ ] Fill epic-5-dod.md
- [ ] README screenshot not required

## Completion checklist

- [ ] Login and Home share Input look
- [ ] Empty list uses EmptyState
- [ ] Archive confirm exists
- [ ] npm test pasted
