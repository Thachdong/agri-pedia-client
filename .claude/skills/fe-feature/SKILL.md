---
name: fe-feature
description: Orchestrate implementation of a whole page or feature in this Next.js client (feature-based + layers, atomic design, BFF to NestJS, react-query, joi, react-hook-form). Phase 1 reports a short plan mapped to fe-* skills plus the ordered list of components, and waits for approval; Phase 2 runs exactly one skill per turn in the fixed order and stops after each for developer review and self-test. Use when the user asks to implement/build a page or feature, or invokes /fe-feature.
---

# fe-feature

Two phases. Never run the whole feature in one go.

## Phase 0 — Resume check
If `.claude/plans/<feature-slug>.md` exists and has unchecked steps, show its status and continue Phase 2 from the first unchecked step (after the developer confirms). Otherwise start Phase 1.

## Phase 1 — Report (no code)
1. Understand the feature.
   - Wireframe: `specs/ui-ux/ui-ux.md` + the relevant `specs/ui-ux/image*.png` (read the images).
   - Existing code: `graphify query "<question>"` first, then targeted reads. Find reusable components, hooks, services, query keys.
   - API: the NestJS contract in `../server/src/modules/<module>/infrastructure/http/` (controller, `dto/`, `responses/`). Never guess endpoints or payloads.
   - Ask only questions whose answer changes the plan.
2. Check foundation. Missing → plan it first:
   - `src/shared/lib/{http,query,validation,form}` + `src/shared/providers/app-providers.tsx` + `components.json` → `[data-wrapper]`
   - `src/app/api/auth/*` + `src/proxy.ts` → `[bff-auth]`
   - `src/app/api/[...path]/route.ts` → `[bff-forward]`
   - tokens the wireframe needs but `src/app/globals.css` lacks → `[design-token]`
   - architecture rules in `eslint.config.mjs` → `[arch-lint-setup]`
3. Break the wireframe down: page → template → organisms → molecules → atoms. Tag each component `new` / `reuse` and `shared` / `feature`.
4. Order components bottom-up:
   - level: atom → molecule → organism → template → page
   - same level: a component used by another comes first
   - `shared` before `feature`
   - `reuse` components are listed (so the tree is complete) but get no step.
5. Write a short plan — one line per step, tagged with the skill, WHAT not HOW. No code, no file-by-file detail. Format:

```
Feature: crop-detail | Page: /crops/[id]
Wireframe: specs/ui-ux/image-3.png
API: GET /crops/:id, POST /crops/:id/reviews
1. [feature-scaffold]      feature `crop-detail` — layers: components, hooks, services, schemas, types
2. [feature-api]           GET /crops/:id → TCrop, getCrop, useCropDetail; keys crops.detail
3. [feature-api]           POST /crops/:id/reviews → useCreateReview, invalidates crops.detail
4. [validation-schema]     createReviewSchema
5. [atomic-component]      atom      RatingStars      (new, shared)
6. [atomic-component]      molecule  CropInfoRow      (new, feature)
7. [atomic-component]      organism  CropInfoCard     (new, feature)
8. [atomic-component]      organism  ReviewForm       (new, feature)
9. [page]                  template DetailLayout + page /crops/[id] ← useCropDetail
10. [arch-review]
Components (in order):
  [atom]      RatingStars     new    shared
  [atom]      Button          reuse  shared
  [molecule]  CropInfoRow     new    feature
  [organism]  CropInfoCard    new    feature
  [organism]  ReviewForm      new    feature
  [template]  DetailLayout    reuse  shared
  [page]      CropDetailPage  new    app/(main)/crops/[id]
Open questions: <only if any>
```

6. Save it to `.claude/plans/<feature-slug>.md` as a checklist (`- [ ] 1. [feature-scaffold] ...`), with the Components list below it.
7. **STOP.** Wait for approval or edits. Apply edits to the plan file, re-show, wait again.

## Phase 2 — Implement, one step per turn
Fixed skill order (skip what the plan doesn't need; a step may repeat per endpoint/component):

1. `fe-data-wrapper` / `fe-bff-auth` / `fe-bff-forward` / `fe-design-token` / `fe-arch-lint-setup` (only if missing)
2. `fe-feature-scaffold` / `fe-layer-add`
3. `fe-feature-api` (one endpoint per step)
4. `fe-validation-schema` (only if the page has forms)
5. `fe-shared-unit` (hooks/hocs/utils/constants/providers — before the component that needs them)
6. `fe-atomic-component` (one component per step, bottom-up order from the plan)
7. `fe-page`
8. `fe-arch-review` (always last)

For each step:
1. Invoke the step's skill (Skill tool, `fe-<name>`) and follow it. Stay inside that skill's scope.
2. Run its verification (`npx tsc --noEmit`, `npm run lint`, `npm run build` as the skill says). Fix failures within the same step.
3. Tick the step in the plan file.
4. Report, short:
```
Step 6/10 done — [atomic-component] molecule CropInfoRow
Files: <list>
Checks: tsc ✓  lint ✓
Self-test: <URL / where it renders / states to check: loading, empty, error, dark mode, mobile width>
Notes: <assumptions, temporary props — only if any>
Next: 7. [atomic-component] organism CropInfoCard
```
5. **STOP.** Do not start the next step until the developer says continue (`next`, `ok`, `tiếp`...).
   - Feedback → revise inside the current step, re-verify, report again, stop again.
   - Never commit; committing is the developer's call.

## Plan changes
If during a step the plan turns out wrong (missing component, organism must split, different endpoint/payload), stop, show the delta against the plan, update the plan file after approval. Never silently expand scope.

## Done
After `fe-arch-review`: summarize findings; fixes are new steps only if the developer approves. Run `graphify update .`. Final line: plan file path + all steps checked.
