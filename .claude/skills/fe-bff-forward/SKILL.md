---
name: fe-bff-forward
description: Build or change the BFF catch-all route src/app/api/[...path]/route.ts that forwards browser requests to NestJS — attaches Authorization Bearer from the httpOnly cookie, streams method/query/body, refreshes once on 401, and blocks path escapes. Not to be confused with Next's src/proxy.ts (route guard, owned by fe-bff-auth). Use when the forward route is missing/changing, or when fe-feature plans a [bff-forward] step.
---

# fe-bff-forward

**Scope:** `src/app/api/[...path]/route.ts` (+ small helpers in `src/shared/lib/auth/` if needed). **Out of scope:** login/refresh/logout routes and `src/proxy.ts` (`fe-bff-auth`), client http wrapper (`fe-data-wrapper`).

Requires `fe-bff-auth` (cookie helpers, `refreshTokens()`). Missing → stop, report.

Next.js 16: read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`. The context `params` is a Promise. More specific routes (`/api/auth/*`) win over the catch-all.

## Behaviour
1. Build target: `new URL(path.join('/') + search, env.API_URL + '/')`. Reject (400) if the resolved origin differs from `env.API_URL` origin or the path contains `..` / encoded `%2e%2e` (SSRF / escape guard).
2. Headers to NestJS: allowlist only — `content-type`, `accept`, `accept-language`, `x-request-id`. Add `Authorization: Bearer <accessToken>` from cookie when present. Never forward the browser `cookie` header.
3. Body: for non-GET/HEAD pass `await request.arrayBuffer()` (supports JSON, multipart). Keep method.
4. 401 from NestJS AND a refresh cookie exists → `refreshTokens()` once → retry the same request with the new token → set new cookies on the response. Refresh fails → clear auth cookies, return 401 `{ statusCode: 401, code: 'SESSION_EXPIRED', message }`.
5. Response to browser: NestJS status + body + `content-type` (and `content-disposition` for files). Strip `set-cookie` and hop-by-hop headers.
6. CSRF: non-GET requests with an `Origin` not equal to the app origin → 403.
7. Export `GET, POST, PUT, PATCH, DELETE` pointing to one handler.

Server Components do NOT call this route (no self-fetch). They use `@/shared/lib/http/server`, which talks to NestJS directly with the cookie token.

## Steps
1. Confirm `fe-bff-auth` pieces exist.
2. Write the route (+ helper for header filtering if it grows).
3. `npx tsc --noEmit && npm run lint && npm run build`.

## Report
Allowed headers, refresh behaviour, guards. Self-test (logged in, cookie jar from login):
`curl -i -b cookies.txt localhost:3000/api/<some-nest-endpoint>` → NestJS data; delete access cookie → still 200 via refresh; `curl -i localhost:3000/api/..%2f..%2fetc` → 400. Stop.
