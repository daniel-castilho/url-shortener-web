# Epic 7 – Technical Tasks

## 7.1 Inventory

- [ ] Quote the ShortUrlResponse fields and any /stats path from api-contract.md into the PR body.
- [ ] If no series path: AGENTS.md debt item "backend: expose click series for EP7.3".

## 7.2 Totals

- [ ] LinksPage row: clickCount (label Clicks).
- [ ] Detail: same number prominent.
- [ ] Do not fetch a second endpoint just to re-read clickCount.

## 7.3 Series (conditional)

- [ ] Add api.* method only if the path exists.
- [ ] Types copied from the contract, not invented.
- [ ] Empty series: "No clicks in this period."

## 7.4 lazy

- [ ] If chart: dynamic import on LinkDetailPage.
- [ ] Prefer CSS bars over a new dep if N <= 30 points.

## 7.5 Docs

- [ ] CHANGELOG
- [ ] Fill epic-7-dod.md

## Completion checklist

- [ ] Contract quote in PR
- [ ] 7.3 done or N/A
- [ ] npm test pasted
