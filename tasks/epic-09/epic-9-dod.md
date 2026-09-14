# Epic 9 – Definition of Done (DoD)

Frontend slice only. Cookie issuance is a Java merge.

Rule zero — zero-from-memory. Paste or Hypothesis (TD-13).

## 1. Mandatory evidence

    git log --oneline main..HEAD
    git status --porcelain
    npm test
    npm run check
    grep -R "credentials" src/lib/api.ts
    gh run list --limit 10

## 2. Self-audit

- [ ] Shas resolve
- [ ] Run/sha pair pasted or LOCAL
- [ ] Default mode is still bearer
- [ ] No Java repo files
- [ ] Owner sanctions quoted
- [ ] No self-declared EPIC 9 CLOSED

## 3. Failures this document encodes

| Rule | Failure |
| --- | --- |
| Default | Flipping prod to cookie before Java Set-Cookie |
| Scope | Node BFF invented in this repo |
| Scope | Editing url-shortener-service from the web squad |
| Security | Still writing refreshToken in cookie mode |

## 4. Checklist

- [ ] Stories 9.1-9.5 done on the front
- [ ] Java brief sent to the other squad (not this DoD)
- [ ] npm test / check pasted

Closure of "sessao dura" as a product requires BOTH repos. This file closes only the web slice.
