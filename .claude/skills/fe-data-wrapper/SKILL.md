---
name: fe-data-wrapper
description: Wrap a data/config package behind a project API in src/shared/lib/<concern>/ — http client (browser → BFF, server → NestJS), react-query setup (QueryClient defaults, provider, central query keys, useAppQuery/useAppMutation, SSR hydration), joi (validation), react-hook-form (useAppForm), plus shadcn init and the app providers. Use before any feature needs such a package, or when fe-feature finds the wrapper missing.
---

# fe-data-wrapper

**Scope:** `src/shared/lib/<concern>/`, `src/shared/providers/`, `src/shared/config/env.ts`, `components.json`, `package.json`, wiring in `src/app/layout.tsx`. **Out of scope:** using the wrapper inside features (`fe-feature-api`, `fe-validation-schema`).

## Wrap or not?
- Wrap: packages that talk to data or carry app-wide config — fetch client, `@tanstack/react-query`, `joi`, `react-hook-form` + `@hookform/resolvers`, socket/upload SDKs.
- Do NOT wrap: pure utilities (`clsx`, `tailwind-merge`, `class-variance-authority`, date libs, icons). Import directly.
- Only files inside `src/shared/lib/<concern>/` import the wrapped package. Exception: shadcn vendor files in `src/shared/components/ui/` (e.g. `form.tsx` imports `react-hook-form`).
- `index.ts` exports the project API only — never `export * from '<package>'`.

## Concerns

### config — `src/shared/config/env.ts`
The only place reading `process.env`. Validates with joi at import; server-only keys (`API_URL`) in a `server-only` file, public ones (`NEXT_PUBLIC_*`) in a separate file. Keep `.env.example` in sync.

### http — `src/shared/lib/http/`
```
http.types.ts      # IHttpClient { get, post, put, patch, delete }, TRequestOptions
app-error.ts       # class AppError { status, code, message, details } + toAppError(res body)
client.ts          # browser client: baseURL '/api' (BFF forward), credentials 'same-origin',
                   #   on 401 SESSION_EXPIRED → location.assign('/login?next=...')
server.ts          # 'server-only': baseURL env.API_URL, Authorization from cookies (lib/auth)
index.ts           # export { http } from client, types, AppError
```
- Built on native `fetch`; JSON by default, `FormData` passthrough.
- `toAppError` understands both NestJS shapes: domain `{ statusCode, code, message, details }` and validation `{ statusCode, message: string[], error }` (→ `code: 'VALIDATION_ERROR'`, `details: messages`).
- Services accept the client as a parameter defaulting to browser `http`, so Server Components can pass the server client for prefetch.

### query — `src/shared/lib/query/`
```
query-client.ts    # makeQueryClient(); getQueryClient(): new per request on server, singleton in browser
query-keys.ts      # CENTRAL registry — the only place query keys are written
query-provider.tsx # 'use client' QueryClientProvider + ReactQueryDevtools (dev only)
use-app-query.ts   # useAppQuery / useAppSuspenseQuery → TData, AppError
use-app-mutation.ts# useAppMutation({ mutationFn, invalidates: (vars, data) => QueryKey[] }) — invalidates required
query-options.ts   # appQueryOptions() re-typed queryOptions for feature *.queries.ts
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
      retry: (count, error) => !(error instanceof AppError && error.status < 500) && count < 2,
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
use-app-form.ts    # useAppForm<T>({ schema, defaultValues, ... }) = useForm + joiResolver(schema, { messages })
form-error.ts      # applyServerErrors(form, appError) — maps AppError.details to field errors
index.ts           # export { useAppForm, applyServerErrors }, types TAppForm<T>
```
Field UI = shadcn `form.tsx` (in `ui/`) wrapped by molecules (`FormField`, `FormInput`...) via `fe-atomic-component`.

### utils — `src/shared/lib/utils.ts`
`cn()` (clsx + tailwind-merge). Created by `shadcn init`.

### providers — `src/shared/providers/app-providers.tsx`
`'use client'`; composes `QueryProvider` (+ Toaster, theme later). Wrapped around `{children}` in `src/app/layout.tsx`.

### shadcn init (first time only)
`npx shadcn@latest init`, then set `components.json` aliases:
`"ui": "@/shared/components/ui"`, `"utils": "@/shared/lib/utils"`, `"components": "@/shared/components"`, `"lib": "@/shared/lib"`, `"hooks": "@/shared/hooks"`; `"tailwind.css": "src/app/globals.css"`. Do NOT let init overwrite the tokens in `globals.css` — diff and restore if it does.

## Steps
1. Decide which concerns are missing (`ls src/shared/lib`). Only build those.
2. `npm install` the packages (`@tanstack/react-query @tanstack/react-query-devtools joi react-hook-form @hookform/resolvers server-only`, as needed).
3. Create files above; wire providers in `layout.tsx`.
4. If `eslint.config.mjs` has architecture rules, make sure the new wrapper folder is in their allowlist.
5. `npx tsc --noEmit && npm run lint && npm run build`.

## Report
Packages + versions, concerns created, exported API per concern, defaults chosen. Stop.
