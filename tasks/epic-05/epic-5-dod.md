# Epic 5 – Definition of Done (DoD)

Rule zero — zero-from-memory. Paste or Hypothesis (TD-13).

## 1. Mandatory evidence

### git log --oneline main..HEAD

```
48f2fa8 docs: epic-5 evidence + changelog
4df04aa feat(detail): archive confirmation dialog + inline success feedback
156deba feat(links): EmptyState, card rows, detail card layout
bd20583 feat(ui): shadcn Input/Label/Card primitives + all forms migrated
b2f4b88 feat(shell): shared header with Tyny URL product name
```

### git status --porcelain

```
(empty — tree clean after docs commit)
```

### npm test

```
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 128.925901
```

(21/21 — count unchanged from Epic 4, per testing doc floor.)

### npm run check (tail)

```
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-qvhQLZHL.css   19.26 kB │ gzip:   4.62 kB
dist/assets/index-DEkPJRHi.js   388.54 kB │ gzip: 122.84 kB
✓ built in 2.61s
```

(lint + typecheck ran before build — exit 0.)

### grep -R "location.href" src || true

```
(zero hits — grep exit code 1)
```

### Dependencies added (Critical Rule 7 disclosure)

```
"@radix-ui/react-dialog": "^1.1.23"
"@radix-ui/react-label": "^2.1.15"
```

Sanctioned by owner before install ("Sancionar CLI" — this epic's question
round). Installed via `npx shadcn@latest add input label card dialog`; the CLI's
transitive `radix-ui` monolith and `cn` packages were removed in favor of
scoped Radix packages + the existing `@/lib/utils` cn helper.

### Browser evidence (layout matrix — no Java needed)

Headless Chromium via browser-automation skill against `vite dev` on :5173:

```
url        http://localhost:5173/          http 200, title "URL Shortener"
text       Tyny URL Início Entrar Registrar Encurtar URL URL Encurtar
console errors/warnings (0)   requests failed (0)

url        http://localhost:5173/login     http 200
text       Tyny URL Início Entrar Registrar Entrar Email Senha Login
console errors/warnings (0)   requests failed (0)

url        http://localhost:5173/register  http 200
text       Tyny URL Início Entrar Registrar Criar conta Nome Email Senha Registrar
console errors/warnings (0)   requests failed (0)
```

Shared header ("Tyny URL" + Nav) confirmed on all three public routes.

Mobile 375×812, scripted DOM measurements (screenshots also captured to
/tmp/opencode/mobile-{home,login,register}.png):

```
home:     scrollW 375 = clientW 375 (no horizontal overflow), nav wraps,
          1 field full-width (343px), submit reachable
login:    scrollW 375 = clientW 375, nav wraps, 2 fields full-width (343px)
register: scrollW 375 = clientW 375, nav wraps, 3 fields full-width (343px)
```

### gh run list --limit 10

Hypothesis (TD-13) — branch not pushed yet. Run/sha pair to be pasted after
Actions goes green on this PR's head commit.

## 2. Self-audit

- [ ] Shas resolve
- [ ] Run/sha pair pasted or LOCAL
- [x] Counts from npm test output
- [x] main claims true of origin/main (53c5831 contains Epic 4)
- [ ] Owner sanctions quoted
- [x] No self-declared EPIC 5 CLOSED

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Scope | Inventing a brand kit |
| Scope | Adding Playwright to "prove" CSS |
| Deps | Chart or animation library |
| Shell | Pages reimplement Nav |

## 4. Checklist

- [x] Stories 5.1-5.5 done
- [x] npm test / check pasted
- [x] Manual matrix pasted or Hypothesis (layout done via browser evidence above; API-dependent cases below)
- [x] CHANGELOG updated

## 5. Manual matrix

| Case | Expected | Result |
| --- | --- | --- |
| / /login /register /links /links/:id | Same header | PASS on /, /login, /register (browser evidence); /links, /links/:id need auth → Hypothesis (TD-13) |
| 375px width | Fields usable, nav wraps, no horizontal scrape | PASS — DOM measurements on the three public routes; auth routes Hypothesis (TD-13) |
| Empty list | EmptyState | Hypothesis (TD-13) — needs auth + zero links (component in place, used by LinksPage) |
| Archive | Dialog then existing archive call | Hypothesis (TD-13) — needs auth (Dialog in place, wraps archive.mutate) |
| Kernel tests | Still green | PASS — 21/21 pasted above |

Closure is the owner channel.
