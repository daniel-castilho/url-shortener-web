# Epic 8 – Technical Tasks

## 8.1 Runner

- [ ] npm i -D @playwright/test
- [ ] npx playwright install --with-deps documented for CI image or use playwright container
- [ ] playwright.config.ts: testDir, baseURL: process.env.PLAYWRIGHT_BASE_URL ?? http://127.0.0.1:5173
- [ ] script "e2e": "playwright test"

## 8.2 Spec

- [ ] e2e/happy-path.spec.ts
- [ ] Credentials from env (E2E_EMAIL, E2E_PASSWORD) — never commit secrets
- [ ] If API is down locally, spec is not part of npm test

## 8.3 CI

- [ ] Keep existing job check (ci + test + build)
- [ ] Optional job e2e: if: vars.E2E_ENABLED == 'true'
- [ ] Do not download browsers on every PR unless e2e is enabled

## 8.4 A11y

- [ ] Grep pages: inputs have Label
- [ ] Dialog has DialogTitle
- [ ] One paragraph in README or DoD listing what was checked by hand

## 8.5 Docs

- [ ] CHANGELOG
- [ ] README E2E section
- [ ] Fill epic-8-dod.md

## Completion checklist

- [ ] npm test still green without Playwright
- [ ] e2e script exists
- [ ] CI policy written
