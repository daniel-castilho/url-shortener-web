# Epic 5 – Stories (Acceptance)

| # | Story | Acceptance Criteria | Anchor |
| --- | --- | --- | --- |
| 5.1 | Shell is shared. | Header: name + Nav + user + Sair. App.tsx owns it. Pages do not duplicate the nav. | App.tsx |
| 5.2 | Forms use primitives. | Home, Login, Register, Detail PATCH: Label + Input (and Button). type=url / password preserved. | shadcn |
| 5.3 | List and empty look finished. | LinksPage: list rows in a consistent card/row. EmptyState component used. Detail is a Card of fields, not a dump of <p>. | Links + Detail |
| 5.4 | Confirm archive + feedback. | Archive opens Dialog (or equivalent). Success of copy/shorten/PATCH uses one pattern (toast component or persistent inline text already on Home). | shadcn Dialog |
| 5.5 | Gate. | npm test + check. CHANGELOG. DoD. No new heavy deps beyond shadcn primitives. | EP2 runner |

Out of scope: Caddy, Playwright, analytics charts.
