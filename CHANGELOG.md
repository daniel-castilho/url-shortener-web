# Changelog

All notable changes to URL Shortener Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project intends to follow [Semantic Versioning](https://semver.org/)
starting from its first tag.

## [Unreleased]

### Added

- **Auth core** — reactive session via `AuthContext` (`user`, `token`,
  `login`, `logout`), `sessionStorage` persistence, single-flight token
  refresh on `401` with hard logout, and error mapping (`ApiError` +
  `mapApiError`). Login/register forms + `/links` shell. See
  `docs/twelve-factors.md` for the three auth decisions.
- **CI workflow** — minimal `.github/workflows/ci.yml` running `npm ci` +
  `npm run build`.
- **Documentation suite** — `docs/api-contract.md` (captured from the backend
  `/v3/api-docs`), `docs/coding-standards.md`, ADRs
  `0001-hexagonal-frontend` and `0002-result-type-errors`, and this changelog.
- **Tooling** — ESLint flat config with module boundary rules
  (`eslint.config.js`), `.prettierrc`, and `package.json` scripts
  (`check`, `lint`, `typecheck`, `format`).

### Changed

- Removed `bootstrap.sh` (dev bootstrap documented in `README.md`).

### Fixed

- (none)

---

## Roadmap (upcoming)

- Extract `src/modules/url-shortener/**` into the hexagonal target shape
  (ADR 0001), with `Result<T, E>` use cases (ADR 0002).
- Add node-built-in test suite (`node --test`, `--experimental-strip-types`).
- Cursor "load more" on `/links`, PATCH form (title, tags, utm, `expiresAt`).
- Domain claim screens; click-analytics charts.
- Cookie/HttpOnly session via a thin BFF (next step for production exposure).
