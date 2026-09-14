# Epic 4 – Technical Tasks

Read docs/api-contract.md before changing DTOs. Do not rename items/nextCursor/hasMore.

## 4.1 List + cursor

- [ ] LinksPage: useQuery or useInfiniteQuery with limit (e.g. 20).
- [ ] Mais disabled while fetching next page.
- [ ] Append items; do not replace the first page when loading page two.

## 4.2 Empty / pending

- [ ] isPending first paint is Carregando or skeletons, not an empty list.
- [ ] items.length === 0 && !hasMore → empty copy + link to /.

## 4.3 Detail

- [ ] useParams id → api.getUrl.
- [ ] Show originalUrl, id/shortUrl if present, clickCount, expiresAt, archived if present.
- [ ] Back link to /links.

## 4.4 PATCH

- [ ] Controlled fields matching UpdateLinkRequest.
- [ ] Build a patch object with only defined values.
- [ ] invalidateQueries ["urls"] and ["url", id] on success.

## 4.5 Archive

- [ ] Call the current helper (DELETE or PATCH). Follow the contract.
- [ ] After success, go to /links or mark the row archived in place — pick one, document in CHANGELOG.
- [ ] mapApiError: add 404 if absent ("Link nao encontrado.").

## 4.6 Tests / docs

- [ ] Pure helper tests if you extract buildPatch or query-string cursor.
- [ ] CHANGELOG [Unreleased]
- [ ] Fill epic-4-dod.md

## Completion checklist

- [ ] Two-page cursor works against a live API or is Hypothesis in DoD
- [ ] Empty state visible with zero items
- [ ] PATCH body uses contract names
- [ ] npm test pasted
