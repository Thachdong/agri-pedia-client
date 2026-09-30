---
name: fe-arch-review
description: Read-only audit of this Next.js client's architecture rules in src/ (or given paths/features) — deep cross-feature imports, shared→feature imports, wrapped packages used directly, browser calling NestJS directly, hardcoded query keys, mutations without invalidation, hardcoded colors, atomic-level violations, client/server leaks, token exposure, process.env outside config, naming. Outputs file:line findings, never edits. Use at the end of a feature or on demand.
---

# fe-arch-review

**Scope:** read and report only. Never edit files. Default target: files changed on the current branch (`git diff --name-only main...HEAD` + uncommitted); if empty, all of `src/`.

## Checks (grep-driven, then read to confirm)

| # | Rule | How to find |
|---|---|---|
| 1 | Deep import into a feature | `grep -rnE "@/features/[a-z-]+/" src` (anything after the slug is a violation); relative `../../<other-feature>/` imports inside `src/features` |
| 2 | Shared depends on features | `grep -rn "@/features" src/shared` (except `import type` in `src/shared/lib/query/query-keys.ts`) |
| 3 | Wrapped package used directly | imports of `@tanstack/react-query`, `joi`, `react-hook-form`, `@hookform/resolvers` outside `src/shared/lib/` and `src/shared/components/ui/` |
| 4 | Data access bypasses wrapper/BFF | `fetch(` outside `src/shared/lib/http/`, `src/shared/lib/auth/`, `src/app/api/`; `API_URL` or NestJS host referenced in client code |
| 5 | Hardcoded query key | `queryKey: \[` or `queryKey: '` outside `src/shared/lib/query/`; keys built from string literals instead of `queryKeys.*` |
| 6 | Mutation without invalidation | `useAppMutation(` blocks missing `invalidates` / `setQueryData` |
| 7 | Hardcoded colors | in `src/**/*.tsx`: `#[0-9a-fA-F]{3,8}\b`, `rgb\(`, `hsl\(`, `oklch\(`, `-\[#`, raw palette classes `(bg|text|border|ring|fill|stroke)-(red|green|blue|gray|slate|zinc|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-[0-9]`, `dark:(bg|text|border)-`; raw colors in `globals.css` outside the palette block and `.dark` |
| 8 | Atomic level violations | `src/shared/components/atoms` importing molecules/organisms/templates; molecules importing organisms/templates; atoms/molecules/templates calling `use*Query`/`use*Mutation`/`useAppForm`; atoms inside `src/features` |
| 9 | Client/server leaks | `'use client'` in `page.tsx`/`layout.tsx`; client files (`'use client'`) importing `server-only` modules (`@/shared/lib/http/server`, `@/shared/lib/auth`, `@/shared/lib/query/server`); `window`/`localStorage` at module top level |
| 10 | Token exposure | `localStorage`/`sessionStorage` with `token`; cookie set without `httpOnly`; `NEXT_PUBLIC_` secrets; auth route returning `accessToken`/`refreshToken` in body |
| 11 | `process.env` outside config | `grep -rn "process.env" src \| grep -v "^src/shared/config/"` (proxy.ts allowed only for `NODE_ENV`) |
| 12 | Validation outside schema | react-hook-form rules in components (`register\(.*\{ *(required|pattern|minLength)`), manual `if (!value` checks in form submit handlers |
| 13 | Naming | files not kebab-case; default exports in components (except `src/app/**` route files); `type X =` without `T`, `interface X` without `I`, `enum X` without `E`; hooks not `use-*.ts` |
| 14 | Thin routes | `src/app/**/page.tsx` with business logic, direct service calls without query options, or inline styling beyond layout |
| 15 | Feature public API | components/hooks used outside a feature but not exported from its `index.ts`; services exported from `index.ts` |

## Output
One line per finding, most severe first:
`path:line: <HIGH|MED|LOW>: <rule #> <problem>. <fix>.`
HIGH = security/data (10, 4, 9), MED = boundaries (1, 2, 3, 5, 6, 8, 11, 12), LOW = style (7, 13, 14, 15) — raise 7 to MED when many.
End with counts per severity. No praise, no restating clean checks. If nothing found: `No architecture violations.`
