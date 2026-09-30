---
name: fe-atomic-component
description: Create ONE UI component at the right Atomic Design level (atom, molecule, organism, template) in the right place (src/shared/components/<level>/ or src/features/<slug>/components/), styled only with design tokens from src/app/globals.css. Use for any new UI component, or when fe-feature plans an [atomic-component] step.
---

# fe-atomic-component

**Scope:** ONE component file + level/feature barrel export. **Out of scope:** routes/pages (`fe-page`), data hooks (`fe-feature-api`), schemas (`fe-validation-schema`), new tokens (`fe-design-token`), non-UI hooks/utils (`fe-shared-unit`).

## Pick the level
| Level | What | May import | Data |
|---|---|---|---|
| atom | one element, no business meaning (Button, Badge, Input, Icon) | `shared/components/ui` (shadcn), native elements | props only |
| molecule | small group of atoms, one purpose (SearchField, InfoRow, FormField) | atoms | props only |
| organism | page section with its own layout (CropInfoCard, ReviewForm, Header) | atoms, molecules, other organisms, feature hooks | may call feature hooks / `useAppForm` |
| template | page skeleton with slots (`children` / named slot props) | organisms, molecules, atoms | none |

A lower level never imports a higher one. If the wireframe block doesn't fit one level, split it and tell the developer (plan change).

## Pick the place
- atoms, templates → always `src/shared/components/<level>/`.
- molecules, organisms → `src/features/<slug>/components/` if tied to that feature's domain; `src/shared/components/<level>/` if domain-agnostic.
- Need a feature component in a second feature → move it to shared (don't copy), update imports.
- shadcn primitives live in `src/shared/components/ui/` (vendor code). Missing one → `npx shadcn@latest add <name>`. Don't restyle inside `ui/`; customise in the atom that wraps it.

## Styling
- Tailwind classes with semantic tokens only: `bg-primary`, `text-primary-foreground`, `bg-surface`, `text-highlight`, `bg-highlight-subtle`, `border-border-subtle`, `text-muted-foreground`, `ring-ring`, `rounded-lg`...
- Prefer the component classes in `globals.css` when they match: `btn-normal`, `btn-highlight`, `card-normal`, `card-highlight`, `table-header`, `table-row-normal`, `table-row-highlight`, `scrollbar-thin`.
- Forbidden: hex/rgb/hsl/oklch values, arbitrary colors (`bg-[#1e4d3b]`), raw Tailwind palette colors (`bg-green-700`, `text-gray-500`), `dark:` color overrides. Dark mode comes from the tokens. Missing token → stop, suggest `fe-design-token`.
- Merge classes with `cn()` from `@/shared/lib/utils`. Variants with `cva` (class-variance-authority).
- Mobile first; check the wireframe at phone width.

## Component rules
- File kebab-case (`crop-info-card.tsx`), named export PascalCase (`CropInfoCard`). No default export.
- Props type `T<Name>Props`. Extend native props when wrapping an element (`React.ComponentProps<'button'>`), always accept `className`.
- Server Component by default. Add `'use client'` only for state, effects, event handlers, browser APIs, or client hooks. Keep the client boundary as low as possible (make the small interactive child a client component, not the whole organism).
- Accessibility: semantic element, `label`/`aria-*` for inputs and icon buttons, visible focus (`focus-visible:ring-ring`), alt text on images (`next/image`).
- Organisms that fetch handle loading (skeleton), empty and error states.
- Forms: organism uses `useAppForm` from `@/shared/lib/form` with the feature schema; field molecules come from `shared/components/molecules`. Never import `react-hook-form` directly.
- Text in Vietnamese per wireframe; no lorem ipsum.

## Template
```tsx
// src/shared/components/atoms/status-badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const statusBadgeVariants = cva('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      normal: 'bg-surface text-surface-foreground border border-border-subtle',
      highlight: 'bg-highlight-subtle text-highlight',
    },
  },
  defaultVariants: { tone: 'normal' },
});

export type TStatusBadgeProps = React.ComponentProps<'span'> & VariantProps<typeof statusBadgeVariants>;

export function StatusBadge({ className, tone, ...props }: TStatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ tone }), className)} {...props} />;
}
```

## Barrels
- Shared: add to `src/shared/components/<level>/index.ts`.
- Feature: add to `src/features/<slug>/index.ts` only if used outside the feature.

## Steps
1. Check reuse: `graphify query "<component purpose>"` + `ls src/shared/components/*`. Existing fits → stop, report reuse.
2. Decide level + place (tables above). State them in one line before writing.
3. Write the component + barrel export.
4. `npx tsc --noEmit && npm run lint`.

## Report
Level, path, props, client/server, states handled, where to see it (page URL, or "visible after [page] step"). Stop.
