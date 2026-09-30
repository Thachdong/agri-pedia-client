---
name: fe-layer-add
description: Add one missing layer (components, hooks, services, schemas, types, utils, constants) to an existing feature in src/features/<slug>/, following the same naming and dependency rules as fe-feature-scaffold. Use when a feature needs a layer it doesn't have yet.
---

# fe-layer-add

**Scope:** one new layer folder in one existing feature + its first file + `index.ts` export if public. **Out of scope:** writing the layer's real logic (that is the owning skill: `fe-feature-api`, `fe-validation-schema`, `fe-shared-unit`, `fe-atomic-component`).

## Rules
- Layer names, file suffixes, dependency direction and `index.ts` policy: exactly as in `fe-feature-scaffold` (read it if not loaded).
- The feature must exist. If not → stop, suggest `fe-feature-scaffold`.
- The layer must not exist yet. If it does → nothing to do, say so.
- Only add a layer the feature needs now. If the content is domain-agnostic (useful to 2+ features), it belongs in `src/shared/<layer>/` instead — say so and stop.

## Steps
1. `ls src/features/<slug>` to confirm current layers.
2. Create `src/features/<slug>/<layer>/` with the first file the plan names.
3. Export from `src/features/<slug>/index.ts` only if used outside the feature.
4. `npx tsc --noEmit && npm run lint`.

## Report
Feature, layer added, file(s), `index.ts` change. Stop.
