---
name: fe-validation-schema
description: Create a joi schema for a form/input in src/features/<slug>/schemas/ (or src/shared/lib/validation/rules.ts when reusable) through the project validation wrapper, typed to the feature's input type and mirroring the NestJS DTO constraints, ready for useAppForm. Use when a page has a form, or when fe-feature plans a [validation-schema] step.
---

# fe-validation-schema

**Scope:** `src/features/<slug>/schemas/<entity>.schema.ts` + new reusable rules in `src/shared/lib/validation/rules.ts`. **Out of scope:** the form UI (`fe-atomic-component`), the mutation (`fe-feature-api`), wrapper setup (`fe-data-wrapper`).

## Rules
- Import from `@/shared/lib/validation` only (`v`, `schema`, `rules`). Never `import Joi from 'joi'`.
- Type-link the schema to the feature input type: `schema<TCreateReviewInput>({...})`. Input types live in `types/` (created by `fe-feature-api`).
- Mirror the server DTO: `python3 .claude/scripts/openapi.py op METHOD /path` (or `schema <XxxDto>`) shows required fields, `minLength/maxLength/minimum/maximum/pattern`, enums. Rules the spec can't express (phone format, cross-field like "bussinessType required for DISTRIBUTOR") → grep the action in `specs/api.md`. Client may be stricter only for UX (trim), never looser.
- Messages: Vietnamese via the wrapper's message map. Field-specific message only when the generic one is unclear (`.messages({ 'string.pattern.base': '...' })`).
- A rule used by 2+ schemas (phone, password, username) → `rules.ts` in shared, not copied.
- Cross-field rules (confirm password) with `v.ref`.
- No validation logic in components (`register('x', { required })` is forbidden) — the schema is the single source.

## Template
```ts
// src/features/crop-detail/schemas/review.schema.ts
import { schema, v } from '@/shared/lib/validation';
import type { TCreateReviewInput } from '../types/crop.types';

export const createReviewSchema = schema<TCreateReviewInput>({
  rating: v.number().integer().min(1).max(5).required(),
  content: v.string().trim().min(10).max(1000).required(),
});
```
Used as `useAppForm({ schema: createReviewSchema, defaultValues })`.

## Steps
1. Read the DTO constraints via `openapi.py` + business rules via `api.md` grep.
2. Write the schema (+ shared rule if reusable).
3. `npx tsc --noEmit && npm run lint`.

## Report
Schema name, fields + constraints, DTO it mirrors, differences from server (if any, with reason). Stop.
