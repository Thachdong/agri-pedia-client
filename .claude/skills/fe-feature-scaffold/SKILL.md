---
name: fe-feature-scaffold
description: Create a new feature folder src/features/<slug>/ with only the layers it needs (components, hooks, services, schemas, types, utils, constants) and a public index.ts. Use when starting a new feature, or when fe-feature plans a [feature-scaffold] step.
---

# fe-feature-scaffold

**Scope:** `src/features/<slug>/` skeleton + `index.ts`. **Out of scope:** real API code (`fe-feature-api`), components (`fe-atomic-component`), schemas (`fe-validation-schema`), routes (`fe-page`).

## Structure
```
src/features/<slug>/          # kebab-case, business noun (crop-detail, product, auth)
├── components/               # feature molecules/organisms (atoms live in shared)
├── hooks/                    # useXxxQuery / useXxxMutation + feature-only UI hooks
├── services/                 # <entity>.service.ts — calls through @/shared/lib/http
├── schemas/                  # <entity>.schema.ts — joi via @/shared/lib/validation
├── types/                    # <entity>.types.ts
├── utils/                    # <name>.util.ts — pure functions
├── constants/                # <name>.constants.ts
└── index.ts                  # public API of the feature
```
Create ONLY the layers the feature needs now. No empty folders, no `.gitkeep`. Another layer later → `fe-layer-add`.

## Dependency rules (inside a feature)
```
components → hooks → services → @/shared/lib/http
     ↓         ↓         ↓
   schemas, types, constants, utils   (leaf layers, import nothing above them)
```
- Inside the feature: relative imports (`../services/crop.service`).
- Outside the feature (other features, `src/app/`): import ONLY `@/features/<slug>` (the `index.ts`). Never `@/features/<slug>/components/...`.
- A feature may import another feature's `index.ts`; if two features need the same thing, move it to `src/shared/` instead.
- `src/shared/` never imports `@/features/*`.

## index.ts
Exports what pages and other features use: page-level organisms, hooks, public types. Do NOT export services, internal molecules, schemas used only inside the feature.
```ts
// src/features/crop-detail/index.ts
export { CropInfoCard } from './components/crop-info-card';
export { useCropDetail } from './hooks/use-crop-detail';
export type { TCrop } from './types/crop.types';
```
At scaffold time `index.ts` may be `export {};` — later steps add exports.

## Naming
- Files/folders kebab-case. Role suffix for non-components: `.service.ts`, `.schema.ts`, `.types.ts`, `.util.ts`, `.constants.ts`, `.queries.ts`. Hooks `use-xxx.ts`. Components `xxx.tsx`.
- Types `TXxx`, interfaces `IXxx`, enums `EXxx` (same convention as `../server`).

## Steps
1. Check the slug doesn't exist (`ls src/features`) and no existing feature already covers it (`graphify query`).
2. Create the folders the plan lists, each with its first file only if the plan names one; otherwise just `index.ts`.
3. `npx tsc --noEmit && npm run lint`.

## Report
Feature path, layers created, what `index.ts` exports. Stop.
