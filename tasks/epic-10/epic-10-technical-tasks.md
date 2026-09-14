# Epic 10 – Technical Tasks

- [ ] npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
- [ ] vitest.config.ts environment jsdom; include src/**/*.spec.tsx
- [ ] Keep *.test.ts on node --test (do not double-run kernel under Vitest)
- [ ] src/test/render.tsx
- [ ] src/test/handlers.ts + setupServer in src/test/setup.ts
- [ ] Five *.spec.tsx files
- [ ] package.json "test:integration": "vitest run"
- [ ] ci.yml: after npm test, npm run test:integration
- [ ] CHANGELOG + DoD

Refuse: mock of src/lib/api.ts, inventing accessToken in JSON, testing shadcn.
