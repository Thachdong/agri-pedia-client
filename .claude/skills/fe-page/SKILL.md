---
name: fe-page
description: Build a route in src/app/ from a wireframe in specs/ui-ux/ — thin page.tsx (Server Component) that prefetches queries, hydrates react-query, composes a template with feature organisms, plus loading/error/not-found and metadata. Use when fe-feature plans a [page] step or the user asks to wire a page.
---

# fe-page

**Scope:** `src/app/<route>/` files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) and, if missing, the template in `src/shared/components/templates/`. **Out of scope:** new organisms/molecules/atoms (`fe-atomic-component`), data hooks (`fe-feature-api`).

Next.js here is 16.x — read `node_modules/next/dist/docs/01-app/` for any file convention you are unsure of (`page.md`, `layout.md`, `loading.md`, `error.md`, `route-groups.md`, `dynamic-routes.md`). `params` and `searchParams` are Promises.

## Rules
- `page.tsx` is thin: no business logic, no styling beyond layout glue, no `'use client'`. It imports only from `@/features/<slug>` (index) and `@/shared/*`.
- Route groups: `(auth)` for login/register, `(main)` for logged-in app. Group-wide chrome (header, sidebar) goes in the group `layout.tsx` using a template.
- Data: prefetch on the server with the feature's query options, wrap children in hydration so client hooks start with data:
```tsx
// src/app/(main)/crops/[id]/page.tsx
import { HydrateQueries, prefetch } from '@/shared/lib/query/server';
import { DetailLayout } from '@/shared/components/templates';
import { CropInfoCard, cropDetailQuery } from '@/features/crop-detail';

export default async function CropDetailPage({ params }: PageProps<'/crops/[id]'>) {
  const { id } = await params;
  const state = await prefetch([cropDetailQuery(id)]);
  return (
    <HydrateQueries state={state}>
      <DetailLayout main={<CropInfoCard id={id} />} />
    </HydrateQueries>
  );
}
```
  Use the helper names that actually exist in `src/shared/lib/query/` — check before writing.
- Metadata: `export const metadata` or `generateMetadata` (Vietnamese title/description).
- States: `loading.tsx` (skeleton matching the layout), `error.tsx` (`'use client'`, friendly message + retry via `reset`), `notFound()` when the API returns 404 for the resource.
- Protected routes: covered by `src/proxy.ts` matcher — check the new route is inside it (or public on purpose).
- Match the wireframe layout; if the wireframe is ambiguous, pick the simpler layout and note it.

## Steps
1. Read the wireframe image + `specs/ui-ux/ui-ux.md` section for this page.
2. Confirm every organism/template the page needs exists (plan steps done). Missing → stop, report.
3. Create/extend the template if the plan says so.
4. Write route files.
5. `npx tsc --noEmit && npm run lint && npm run build`.

## Report
Route, files, prefetched queries, states covered, protected or public. Self-test: `npm run dev` → `http://localhost:3000/<route>`; check loading, empty, error, dark mode, phone width. Stop.
