# Epic 9 – Testing Strategy

## 9.1 Always

    npm test
    npm run check

## 9.2 Grep

    grep -R "credentials" src/lib/api.ts
    grep -R "VITE_AUTH_MODE" src .env.example

## 9.3 Manual (Hypothesis until Java cookies)

| Case | Expected |
| --- | --- |
| bearer default | Login still stores us.token |
| cookie + Java cookies | Application tab: no us.token; Network request has Cookie, no Authorization |
| cookie + XSS console getToken() | null |
| GET /{id} | Still 302, no auth required |

## 9.4 CI

Existing check job. Do not enable cookie mode in CI until Java is on the preview proxy.
