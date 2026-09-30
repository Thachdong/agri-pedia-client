---
name: fe-shared-unit
description: Create ONE non-data support unit — a UI/behaviour hook, HOC, util, constant, type, or context provider — decide feature vs shared placement, name it, export it, and keep client/server boundaries right. Data hooks are NOT here (fe-feature-api). Use when a component needs such a helper, or when fe-feature plans a [shared-unit] step.
---

# fe-shared-unit

Argument: kind = `hook` | `hoc` | `util` | `constant` | `type` | `provider`.

**Scope:** ONE unit + barrel export. **Out of scope:** query/mutation hooks (`fe-feature-api`), components (`fe-atomic-component`), wrappers of packages (`fe-data-wrapper`).

## Should it exist?
- Used in one place only → keep it inline in that file. Say so and stop.
- Already exists (`graphify query`, `ls src/shared/{hooks,hocs,utils,constants,types}`) → reuse. Stop.

## Placement
- Domain-agnostic (debounce, media query, format currency, pagination constants) → `src/shared/<kind-folder>/`.
- Tied to one feature's domain → `src/features/<slug>/<layer>/` (`hooks/`, `utils/`, `constants/`, `types/`).
- Feature unit needed by a second feature → move to shared, update imports.

| kind | shared folder | file | export |
|---|---|---|---|
| hook | `src/shared/hooks/` | `use-debounce.ts` | `useDebounce` |
| hoc | `src/shared/hocs/` | `with-permission.tsx` | `withPermission` |
| util | `src/shared/utils/` | `format-currency.util.ts` | `formatCurrency` |
| constant | `src/shared/constants/` | `pagination.constants.ts` | `PAGE_SIZE` (UPPER_SNAKE), objects `as const` |
| type | `src/shared/types/` | `pagination.types.ts` | `TPagination`, `IXxx`, `EXxx` |
| provider | `src/shared/providers/` | `theme-provider.tsx` | `ThemeProvider` |

Each shared folder has an `index.ts` barrel.

## Rules per kind
- **util:** pure, deterministic, no React, no I/O, no `window`. Safe on server and client. Input/output typed.
- **hook:** name starts with `use`; only for stateful/effectful UI behaviour. Browser APIs guarded for SSR (inside `useEffect` or `useSyncExternalStore` with server snapshot). No data fetching.
- **hoc:** last resort. First check a hook, composition (`children`/slot props) or a layout does the job — prefer those and stop. If a HOC is truly needed: preserve props typing (`<P extends object>(C: React.ComponentType<P>)`), set `displayName`, client-only if it uses hooks. Auth gating belongs in `src/proxy.ts` / server layout, not a HOC.
- **constant:** no magic strings/numbers in components; routes in `src/shared/constants/routes.constants.ts`.
- **type:** shared only if used by 2+ features; API types stay in the feature.
- **provider:** `'use client'`, value memoized, custom hook `useXxx()` that throws outside the provider; register in `src/shared/providers/app-providers.tsx`.
- Files importing server-only modules add `import 'server-only'`; never import them from a client unit.

## Steps
1. Should-it-exist + reuse check.
2. Decide placement (one line), write the unit + barrel export.
3. `npx tsc --noEmit && npm run lint`.

## Report
Kind, path, signature, client/server safety, who uses it. Stop.
