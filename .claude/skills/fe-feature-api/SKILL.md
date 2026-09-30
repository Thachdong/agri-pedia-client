---
name: fe-feature-api
description: Connect ONE NestJS endpoint to a feature — types from the server DTO/response, a namespace entry in the central query-keys.ts, a service function via the http wrapper, query options, and a useXxx query or mutation hook (mutations declare what they invalidate). Use for any data read/write a feature needs, or when fe-feature plans a [feature-api] step.
---

# fe-feature-api

**Scope:** ONE endpoint → `types/`, `services/`, `hooks/`, `<entity>.queries.ts` of one feature + its keys in `src/shared/lib/query/query-keys.ts` + `index.ts` exports. **Out of scope:** wrappers (`fe-data-wrapper`), BFF routes (`fe-bff-*`), form schema (`fe-validation-schema`), UI.

Requires `src/shared/lib/{http,query}`. Missing → stop, suggest `fe-data-wrapper`.

## Contract first
Read the endpoint in `../server/src/modules/<module>/infrastructure/http/`: `<x>.controller.ts` (method, path, guards), `dto/` (request), `responses/` (response), `<x>.api-docs.ts` (status codes). Never guess field names — the server spelling wins (e.g. `bussinessType`). Dates arrive as ISO strings.

## Files
```ts
// types/crop.types.ts
export type TCrop = { id: string; name: string; createdAt: string };
export type TCreateReviewInput = { rating: number; content: string };

// src/shared/lib/query/query-keys.ts   (add the namespace; never write keys elsewhere)
crops: {
  all: ['crops'] as const,
  detail: (id: string) => [...queryKeys.crops.all, 'detail', id] as const,
},

// services/crop.service.ts — plain async functions, no React
import { http, type IHttpClient } from '@/shared/lib/http';
export const getCrop = (id: string, client: IHttpClient = http) => client.get<TCrop>(`/crops/${id}`);
export const createReview = (id: string, input: TCreateReviewInput, client: IHttpClient = http) =>
  client.post<TReview>(`/crops/${id}/reviews`, input);

// hooks/crop.queries.ts — reused by hooks and by page prefetch
import { appQueryOptions, queryKeys } from '@/shared/lib/query';
export const cropDetailQuery = (id: string, client?: IHttpClient) =>
  appQueryOptions({ queryKey: queryKeys.crops.detail(id), queryFn: () => getCrop(id, client) });

// hooks/use-crop-detail.ts
export const useCropDetail = (id: string) => useAppQuery(cropDetailQuery(id));

// hooks/use-create-review.ts
export const useCreateReview = (id: string) =>
  useAppMutation({
    mutationFn: (input: TCreateReviewInput) => createReview(id, input),
    invalidates: () => [queryKeys.crops.detail(id)],
  });
```

## Rules
- Only `@/shared/lib/http` and `@/shared/lib/query` — never `fetch`, `@tanstack/react-query`, or the NestJS URL directly.
- Paths are NestJS paths; the browser client prefixes `/api` (BFF forward), the server client prefixes `env.API_URL`.
- Keys: add to the central registry under the feature namespace; hooks/services use `queryKeys.*` only. List keys include the filter object.
- Mutations must declare `invalidates` (or `setQueryData` for optimistic updates with rollback in `onError`). Invalidate the narrowest key that is stale.
- Query hooks return what `useAppQuery` returns; no extra state copies. Mapping/formatting belongs in `select` or a `utils/` function.
- Pagination: `useAppInfiniteQuery` if the wrapper has it; otherwise stop and extend the wrapper first (`fe-data-wrapper`).
- Export from feature `index.ts`: hooks, query options (for page prefetch), public types.

## Steps
1. Read the server contract.
2. Types → keys → service → queries → hook → `index.ts`.
3. `npx tsc --noEmit && npm run lint`.

## Report
Endpoint, types, keys added, hook signature, invalidations. Self-test: once a component uses it — React Query Devtools shows key `<key>`; Network tab shows `/api/<path>` 200. Stop.
