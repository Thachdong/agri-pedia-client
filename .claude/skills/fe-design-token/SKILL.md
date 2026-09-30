---
name: fe-design-token
description: Add or change design tokens in src/app/globals.css following its 3 tiers (raw palette → semantic tokens in :root/.dark → @theme inline mapping) and add @layer components classes when a pattern repeats. Use when a component needs a color/radius/shadow the tokens don't provide, or when fe-feature plans a [design-token] step.
---

# fe-design-token

**Scope:** `src/app/globals.css` only. **Out of scope:** components using the token.

There is no Figma. Tokens in `globals.css` + wireframes in `specs/ui-ux/` are the design source.

## Tiers (keep this order in the file)
1. **Raw palette** — `:root { --palette-*: #hex; }`. The ONLY place raw brand values live.
2. **Semantic tokens** — `:root { --<purpose>: var(--palette-*); }` and the dark values in `.dark { --<purpose>: ...; }`. Named by purpose (`--warning`, `--surface`), never by color (`--orange`).
3. **Theme mapping** — `@theme inline { --color-<purpose>: var(--<purpose>); }` so Tailwind generates `bg-<purpose>`, `text-<purpose>`...
4. **Component classes** — `@layer components { .<name>-<variant> { @apply ...; } }` only for a pattern used 3+ times (like `btn-normal`, `card-highlight`).

## Rules
- First check an existing token doesn't already cover the need (e.g. `accent` vs `highlight-subtle`). Prefer reuse.
- Every new semantic token gets both a `:root` value and a `.dark` value. `.dark` palette is provisional (see comment in file) — pick a darker equivalent and keep the comment.
- Foreground pairs: a background token gets its `-foreground` partner when text sits on it; check contrast ≥ 4.5:1 for text.
- Don't rename or remove tokens in use without grepping usages (`grep -rn "<token>" src`) and updating them in the same step.
- Keep the Vietnamese section comments style of the file.

## Steps
1. Read `src/app/globals.css`.
2. Add palette value (if a new raw color) → semantic token (`:root` + `.dark`) → `@theme inline` line → component class (if any).
3. `npm run build` (Tailwind compiles the CSS).

## Report
Tokens added/changed (light / dark values), Tailwind classes now available, contrast check. Self-test: toggle `class="dark"` on `<html>`. Stop.
