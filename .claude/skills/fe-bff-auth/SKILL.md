---
name: fe-bff-auth
description: Build or change the BFF auth flow — Next route handlers src/app/api/auth/{login,refresh,logout}/route.ts that call NestJS, keep accessToken/refreshToken in httpOnly cookies (never exposed to browser JS), server-only cookie helpers in src/shared/lib/auth/, and the route guard in src/proxy.ts. Use when auth is missing/changing, or when fe-feature plans a [bff-auth] step.
---

# fe-bff-auth

**Scope:** `src/app/api/auth/**`, `src/shared/lib/auth/`, `src/proxy.ts`, auth env keys in `src/shared/config/env.ts`. **Out of scope:** forwarding other API calls (`fe-bff-forward`), login page UI (`fe-page` + `fe-atomic-component`), login form hook (`fe-feature-api` in feature `auth`).

Next.js 16: read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`, `proxy.md`, and `04-functions/cookies.md` before writing. `cookies()` is async. `middleware.ts` is deprecated — the file is `src/proxy.ts` exporting `proxy`.

## NestJS contract (verify with `python3 .claude/scripts/openapi.py op POST /auth/login` etc.)
- `POST /auth/login` body `{ loginType, identifier, password }` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh-token` body `{ refreshToken }` → new tokens
- `POST /auth/logout` body `{ refreshToken }`
- Errors: `DomainErrorResponse { statusCode, code, message, details? }`, `ValidationErrorResponse { statusCode, message: string[], error }`
Re-check with the script; the spec wins over this list. Auth rules (token TTL, activation) → grep `specs/api.md`.

## Structure
```
src/shared/lib/auth/
├── auth.constants.ts     # cookie names, max ages — plain consts (also imported by proxy.ts)
├── auth-cookies.ts       # 'server-only': setAuthCookies, getAccessToken, getRefreshToken, clearAuthCookies
├── refresh-tokens.ts     # 'server-only': refreshTokens() → calls NestJS, returns new pair or null
└── index.ts
src/app/api/auth/
├── login/route.ts        # POST: forward body to NestJS, set cookies, return { user } only
├── refresh/route.ts      # POST: refreshTokens(), set cookies or clear + 401
└── logout/route.ts       # POST: call NestJS logout (ignore its failure), clear cookies, 204
src/proxy.ts              # route guard
```

## Rules
- Tokens NEVER go to the browser in a response body, JS-readable cookie, `localStorage`, or `NEXT_PUBLIC_*` env.
- Cookies: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'` (read via env module), `sameSite: 'lax'`, `path: '/'`, `maxAge` = token lifetime (decode `exp` of the JWT for access; refresh from NestJS config/constant).
- NestJS base URL: `env.API_URL` (server-only, from `src/shared/config/env.ts`). No `process.env` elsewhere.
- NestJS calls from route handlers use the server http client in `@/shared/lib/http/server` (created by `fe-data-wrapper`); pass through NestJS error status/body as-is (without tokens).
- CSRF: for non-GET auth routes, reject when the `Origin` header doesn't match the app origin (403).
- `src/proxy.ts`:
  - Self-contained and light (runs before render): read cookies from `request.cookies`, import only `auth.constants.ts`. No NestJS calls.
  - No access AND no refresh cookie on a protected route → `NextResponse.redirect('/login?next=<path>')`.
  - Logged-in user on `/login` or `/register` → redirect `/`.
  - `config.matcher` excludes `/api`, `/_next`, static files.
  - Expired access token with valid refresh → let it through; `fe-bff-forward` refreshes on 401.

## Steps
1. Contract of the auth endpoints via `openapi.py op` (not the server source).
2. Env keys (`API_URL`) in `src/shared/config/env.ts` + `.env.example`.
3. `src/shared/lib/auth/*`.
4. Route handlers.
5. `src/proxy.ts`.
6. `npx tsc --noEmit && npm run lint && npm run build`.

## Report
Routes, cookie names/flags, protected matcher, env keys. Self-test:
`curl -i -X POST localhost:3000/api/auth/login -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' -d '{"loginType":"EMAIL","identifier":"...","password":"..."}'` → `Set-Cookie ... HttpOnly`, body has no token; open a protected URL logged out → redirected to `/login`. Stop.
