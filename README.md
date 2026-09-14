# URL Shortener Web

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

URL Shortener Web is the browser UI for
[url-shortener-service](https://github.com/daniel-castilho/url-shortener-service).
It is a **separate repository**: a Vite SPA that talks to the Java REST API over
`/api/v1`. Redirects (`GET /{id}`) stay on the backend. There is no BFF in this
cut — NGINX (prod) or the Vite dev proxy (local) put UI and API on the same
origin.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Commands](#commands)
- [Routes](#routes)
- [API contract](#api-contract)
- [Current State](#current-state)
- [Roadmap](#roadmap)
- [License](#license)

## Tech Stack

| Category          | Technology                                                                                                                                                                                                                  |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language & UI** | ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black) |
| **Bundler**       | ![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)                                                                                                                           |
| **Styling**       | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge)                  |
| **Data**          | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)                                                                                                   |
| **Routing**       | ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)                                                                                                    |

- **UI:** React 19 + Vite, mobile-first Tailwind v4, shadcn/ui (New York, CSS variables).
- **HTTP:** `fetch` in `src/lib/api.ts`. Bearer JWT from `AuthResponse.token`.
  On `401`, one retry after `POST /api/v1/auth/refresh` with `{ refreshToken }`.
- **Session:** `sessionStorage` keys `us.token` / `us.refreshToken` (boilerplate;
  not HttpOnly cookies).
- **Same-origin:** Vite proxies `/api` and `/actuator` to `http://localhost:8080`.
  Production should do the same in NGINX. `GET /{id}` must **not** be swallowed
  by the SPA.

## Architecture

```
src/
├── main.tsx                 # QueryClient + BrowserRouter
├── App.tsx                  # shell + route table + auth gate
├── index.css                # Tailwind v4 + shadcn tokens
├── lib/
│   ├── api.ts               # typed client for /api/v1
│   ├── auth.ts              # token session helpers
│   └── utils.ts             # cn()
├── components/ui/           # shadcn primitives (start: button)
└── pages/
    ├── HomePage.tsx         # anonymous / authenticated shorten
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── LinksPage.tsx        # GET /api/v1/urls (cursor list)
    └── LinkDetailPage.tsx   # GET + DELETE /api/v1/urls/{id}
```

**Boundary rules:**

- This app does not own short-code redirects. The Java service remains the
  only handler for `GET /{id}` (`302` / `404` / `410`).
- Pages call `api.*` only. No raw `fetch` in views.
- DTOs in `src/lib/api.ts` follow the backend records:
  `token` (not `accessToken`), `originalUrl`, `customAlias`, `ttlSeconds`,
  `items` / `nextCursor` / `hasMore`.

## Requirements

- Node.js 22+ (npm)
- Backend running on `http://localhost:8080` for local proxy

## Getting Started

### 1. Start the API

In the service repo: Mongo + Redis + `./mvnw spring-boot:run`.

### 2. Run the UI

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). `VITE_API_BASE_URL` empty
means same-origin (`/api/...`). Do not point the browser at `:8080` unless you
have configured CORS on the service.

### 3. Production build

```sh
npm run build
```

The SPA ships as static files behind the same host as the Java API. The
routing law (single source of truth in [`docs/deploy.md`](docs/deploy.md)):

- `/api*` and `/actuator*` → Java upstream
- `GET /{id}` short code → Java upstream (`302` redirect — **never** fall back to `index.html` here)
- `/`, `/login`, `/register`, `/links`, `/links/*`, `/assets/*` and unknown UI paths → SPA `dist/` (`try_files ... /index.html`)

`VITE_API_BASE_URL` stays **empty** in UAT and prod (same-origin `/api`).

#### Local preview

```sh
npm run build
npm run preview                                   # SPA only, no /api proxy
# or the full routing law (needs dist/):
SITE_ADDRESS=localhost:8081 JAVA_UPSTREAM=localhost:8080 \
  caddy run --config deploy/caddy/Caddyfile
```

#### UAT (Caddy)

```sh
npm run build
SITE_ADDRESS=uat.tyny.ca JAVA_UPSTREAM=localhost:8080 \
  caddy run --config deploy/caddy/Caddyfile
```

Config: [`deploy/caddy/Caddyfile`](deploy/caddy/Caddyfile) — env-driven,
`handle` blocks in law order, `file_server` + `try_files` fallback for the SPA.

#### Prod (NGINX, Blue/Green static)

Include [`deploy/nginx/spa.conf`](deploy/nginx/spa.conf) in the server block.
The `root` points at a `spa` symlink flipped between `spa-blue`/`spa-green`
during a release (see the comment in the file). Exact/`^~` locations for API
and reserved SPA paths take precedence over the short-code regex location.

#### Release artifact

Tagging `vX.Y.Z` triggers [`.github/workflows/release.yml`](.github/workflows/release.yml):
`npm ci` + `npm run build` + `dist/` uploaded as a workflow artifact.

## Commands

| Purpose                                | Command                            |
| :------------------------------------- | :--------------------------------- |
| Dev server (proxy → `:8080`)           | `npm run dev`                      |
| Production bundle                      | `npm run build`                    |
| Preview `dist/`                        | `npm run preview`                  |
| Lint (ESLint, incl. module boundaries) | `npm run lint`                     |
| Type-check                             | `npm run typecheck`                |
| **Done gate** (lint + type + build)    | `npm run check`                    |
| Format                                 | `npm run format`                   |
| Add a shadcn component                 | `npx shadcn@latest add card input` |

## Routes

| UI path      | Page                    | Backend                                      |
| :----------- | :---------------------- | :------------------------------------------- |
| `/`          | Home — shorten          | `POST /api/v1/urls`                          |
| `/login`     | Login                   | `POST /api/v1/auth/login`                    |
| `/register`  | Register                | `POST /api/v1/auth/register`                 |
| `/links`     | List (auth)             | `GET /api/v1/urls?limit=&cursor=`            |
| `/links/:id` | Detail / archive (auth) | `GET` / `PATCH` / `DELETE /api/v1/urls/{id}` |

Auth bodies: register `{ name, email, password }`, login `{ email, password }`,
refresh `{ refreshToken }`. Auth payload:
`{ token, refreshToken, userId, email, name }`.

Shorten body: `{ originalUrl, customAlias?, ttlSeconds?, domain? }`.
Response: `{ id, shortUrl }`.

## API contract

Request/response payloads and status codes are captured verbatim from the
backend's OpenAPI spec in **[`docs/api-contract.md`](docs/api-contract.md)**
(re-generate from `/v3/api-docs` when the backend changes). Backend source of
truth: [url-shortener-service](https://github.com/daniel-castilho/url-shortener-service).

| Status | Meaning in this UI                                           |
| :----- | :----------------------------------------------------------- |
| `400`  | validation / e-mail in use / bad cursor / archived immutable |
| `401`  | refresh then re-login                                        |
| `403`  | not the owner                                                |
| `404`  | unknown or archived id                                       |
| `409`  | vanity alias taken                                           |
| `429`  | rate limit on shorten                                        |

## Current State

Boilerplate cut: shell, auth session, shorten, list, detail, archive.
Responsive layout (mobile-first). No test suite, no cookie session, no BFF.

## Roadmap

- Cookie HttpOnly session (optional thin BFF)
- Cursor “load more” on `/links`
- PATCH form (title, tags, utm, `expiresAt`)
- Domain claim screens
- Click analytics charts
- Vitest + Playwright
- NGINX snippet for SPA vs `/{id}`

## License

[MIT](LICENSE) © 2026 Daniel Castilho (https://tyny.ca).
