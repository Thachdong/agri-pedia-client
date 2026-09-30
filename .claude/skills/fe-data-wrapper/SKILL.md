---
name: fe-data-wrapper
description: Wrap a data/config package behind a project API in src/shared/lib/<concern>/ — http client (browser → BFF, server → NestJS), react-query setup (QueryClient defaults, provider, central query keys, useAppQuery/useAppMutation, SSR hydration), joi (validation), react-hook-form (useAppForm), plus shadcn config and the app providers. Use before any feature needs such a package, or when fe-feature finds the wrapper missing.
---

# fe-data-wrapper

**Scope:** `src/shared/lib/<concern>/`, `src/shared/providers/`, `src/shared/config/`, `components.json`, `package.json`, wiring in `src/app/layout.tsx`. **Out of scope:** using the wrapper inside features (`fe-feature-api`, `fe-validation-schema`).

## Wrap or not?
- Wrap: packages that talk to data or carry app-wide config — fetch client, `@tanstack/react-query`, `joi`, `react-hook-form` + `@hookform/resolvers`, socket/upload SDKs.
- Do NOT wrap: pure utilities (`cn`, `class-variance-authority`, `radix-ui`, date libs, `lucide-react`). Import directly.
- Only files inside `src/shared/lib/<concern>/` import the wrapped package. Exception: shadcn vendor files in `src/shared/components/ui/` (e.g. `form.tsx` imports `react-hook-form`).
- `index.ts` exports the project API only — never `export * from '<package>'`.

## Concerns

### config — `src/shared/config/`
The only place reading `process.env` (lint-enforced).
- `env.server.ts` — `'server-only'`; validates with `v` at import → `serverEnv.API_URL` (trailing `/` stripped). Import path `@/shared/config/env.server` (not re-exported from the index).
- `env.public.ts` — `publicEnv` (`isDev`, `isProd`, later `NEXT_PUBLIC_*`). Access each key literally (`process.env.NEXT_PUBLIC_X`) so Next inlines it.
- `index.ts` exports `publicEnv` only. Keep `.env.example` in sync (`.gitignore` has `!.env.example`).

### http — `src/shared/lib/http/`
```
openapi.d.ts       # GENERATED from specs/openapi.json — `npm run gen:api`, never hand-edit
api-types.ts       # TApiSchema<K extends keyof components['schemas']> = components['schemas'][K]
http.types.ts      # IHttpClient { get, post, put, patch, delete }, TRequestOptions
app-error.ts       # AppError { status, code, message, details }, APP_ERROR_CODE, isAppError, toAppError(status, body)
create-http-client.ts # createHttpClient({ baseUrl, credentials, getHeaders, onError }) → IHttpClient
client.ts          # `http`: baseUrl '/api' (BFF forward), credentials 'same-origin',
                   #   on 401 SESSION_EXPIRED → location.assign('/login?next=...') (full reload clears cache)
server.ts          # 'server-only' `serverHttp`: baseUrl serverEnv.API_URL, Bearer from cookie
                   #   (name from `@/shared/lib/auth/auth.constants`). Import `@/shared/lib/http/server`.
index.ts           # export { http } from client, types, TApiSchema, AppError
```
- Type generation: dev dependency `openapi-typescript`; `package.json` script `"gen:api": "openapi-typescript specs/openapi.json -o src/shared/lib/http/openapi.d.ts"`. Re-run whenever `specs/openapi.json` is re-exported from the server.
- `AppError` body types come from the generated `DomainErrorResponse` / `ValidationErrorResponse`.
- Built on native `fetch`; JSON by default, `FormData` passthrough.
- `toAppError` understands both NestJS shapes: domain `{ statusCode, code, message, details }` and validation `{ statusCode, message: string[], error }` (→ `code: 'VALIDATION_ERROR'`, `details: messages`).
- Services accept the client as a parameter defaulting to browser `http`, so Server Components can pass the server client for prefetch.

### query — `src/shared/lib/query/`
```
query.types.ts     # declare module Register { defaultError: AppError; queryMeta/mutationMeta: TQueryMeta { silent? } }
query-error.ts     # handleGlobalError(error, meta) + setQueryErrorNotifier(fn) — register toast here later
query-client.ts    # makeQueryClient(); getQueryClient(): new per request on server, singleton in browser
query-keys.ts      # CENTRAL registry — the only place query keys are written
query-provider.tsx # 'use client' QueryClientProvider + ReactQueryDevtools (dev only)
use-app-query.ts   # useAppQuery / useAppSuspenseQuery / useAppInfiniteQuery (cursor pagination)
use-app-mutation.ts# useAppMutation({ mutationFn, invalidates: ((vars, data) => QueryKey[]) | false }) — required;
                   #   false only when the mutation updates cache itself (setQueryData / optimistic)
query-options.ts   # appQueryOptions / appInfiniteQueryOptions for feature *.queries.ts
server.tsx         # prefetch(options[]) → dehydrated state; <HydrateQueries state>
index.ts           # client API (no server.tsx exports)
```
Defaults in `makeQueryClient()`:
```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => !(isAppError(error) && error.status >= 400 && error.status < 500) && count < 2,
    },
    mutations: { retry: false },
    dehydrate: { shouldDehydrateQuery: (q) => defaultShouldDehydrateQuery(q) || q.state.status === 'pending' },
  },
  queryCache: new QueryCache({ onError: handleGlobalError }),     // toast unless meta.silent
  mutationCache: new MutationCache({ onError: handleGlobalError }),
});
```
`query-keys.ts` — one namespace per feature, factory pattern, all `as const`:
```ts
export const queryKeys = {
  crops: {
    all: ['crops'] as const,
    lists: () => [...queryKeys.crops.all, 'list'] as const,
    list: (filters: TCropFilters) => [...queryKeys.crops.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.crops.all, 'detail', id] as const,
  },
} as const;
```
Filter types used in keys are imported with `import type` from the feature (type-only, allowed).

### validation — `src/shared/lib/validation/`
```
joi.ts             # configured Joi instance: abortEarly false, stripUnknown true, errors.wrap.label false
messages.ts        # Vietnamese messages for joi error types ('string.empty', 'any.required', 'string.email'...)
rules.ts           # reusable rules: phone(), password(), username(), id() — mirror NestJS DTO constraints
schema.ts          # schema<T>(keys) → Joi.ObjectSchema<T> (typed link between schema and TInput)
index.ts           # export { v, schema, rules }  (v = configured Joi)
```

### form — `src/shared/lib/form/`
```
use-app-form.ts    # useAppForm<T>({ schema, defaultValues, mode = 'onTouched', ... }) = useForm + joiResolver(schema)
form-error.ts      # applyServerErrors(form, error): NestJS "<field> must ..." → field error; else → FORM_ROOT_ERROR ('root.server')
index.ts           # export { useAppForm, applyServerErrors, FORM_ROOT_ERROR }, types TAppForm<T>, TAppFormOptions<T>
```
Field UI = shadcn `form.tsx` (in `ui/`) wrapped by molecules (`FormField`, `FormInput`...) via `fe-atomic-component`.

### utils — `src/shared/lib/utils.ts`
`export { cn } from "cn";` — shadcn 4 uses the `cn` package (by shadcn) instead of clsx + tailwind-merge. Generated shadcn components import `cn` directly.

### providers — `src/shared/providers/app-providers.tsx`
`'use client'`; composes `QueryProvider` (+ Toaster, theme later). Wrapped around `{children}` in `src/app/layout.tsx`.

### shadcn config
NEVER run `shadcn init` — it overwrites the semantic tokens in `src/app/globals.css`. `components.json` is hand-written (style `radix-nova`, `tailwind.css: src/app/globals.css`, aliases `ui: @/shared/components/ui`, `utils: @/shared/lib/utils`, `components: @/shared/components`, `lib: @/shared/lib`, `hooks: @/shared/hooks`). Add primitives with `npx shadcn@latest add <name>`; if it touches `globals.css`, diff and restore the tokens.

## Steps
1. Decide which concerns are missing (`ls src/shared/lib`). Only build those.
2. `npm install` the packages (`@tanstack/react-query @tanstack/react-query-devtools joi react-hook-form @hookform/resolvers server-only cn class-variance-authority radix-ui lucide-react`; dev: `openapi-typescript shadcn tw-animate-css`), as needed; `gen:api` script exists — run it after re-exporting the spec.
3. Create files above; wire providers in `layout.tsx`.
4. New wrapped package → add it to `WRAPPED` in `eslint.config.mjs` (its folder under `src/shared/lib/**` is already allowlisted).
5. `npx tsc --noEmit && npm run lint && npm run build`.

## Report
Packages + versions, concerns created, exported API per concern, defaults chosen. Stop.
