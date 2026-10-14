---
name: fe-arch-lint-setup
description: Encode the client's architecture rules in eslint.config.mjs (flat config) so lint catches them — restricted imports of wrapped packages outside src/shared/lib, deep feature imports, shared→feature imports, process.env outside config, atomic level direction, hardcoded query keys. Use once when setting up the project, or when a new wrapped package/rule is added.
---

# fe-arch-lint-setup

**Scope:** `eslint.config.mjs` (+ dev dependency only if a plugin is truly needed). **Out of scope:** fixing violations the new rules reveal — list them, the developer decides (fix steps, or `fe-arch-review`).

Use `@typescript-eslint/no-restricted-imports` (already loaded by `eslint-config-next/typescript`; supports `allowTypeImports`) with core `no-restricted-imports` turned off, plus core `no-restricted-syntax`. No extra plugin unless the developer approves one. Patterns use gitignore syntax — no `{a,b}` braces, list each path.

## Rules to encode
**Canonical implementation: `eslint.config.mjs` (block "Architecture rules").** Read it first; extend it, don't rewrite it. Structure:

| Const / helper | Purpose |
|---|---|
| `WRAPPED` | package paths banned outside wrappers (`@tanstack/react-query`, `@tanstack/react-query-devtools`, `joi`, `react-hook-form`, `@hookform/resolvers`) |
| `WRAPPED_PATTERNS` | sub-paths (`@hookform/resolvers/*`) |
| `DEEP_FEATURE` | `@/features/*/*` — import features only via their index |
| `SHARED_TO_FEATURE` | `@/features/*` banned in shared, `allowTypeImports: true` |
| `RESTRICTED_SYNTAX` | `process.env` outside config; `queryKey: [ ... ]` array literals |
| `restrictImports(patterns, paths = WRAPPED)` | builds the full rule option (the rule does NOT merge across config objects) |

Config objects, in order (later wins for the same rule):
1. `src/**` — `WRAPPED` + `DEEP_FEATURE` + `RESTRICTED_SYNTAX`; core `no-restricted-imports` off.
2. `src/shared/**` — adds `SHARED_TO_FEATURE`.
3. `src/shared/config/**`, `src/proxy.ts` — `process.env` allowed (queryKey rule kept).
4. `atoms/**`, `molecules/**` — atomic direction + `SHARED_TO_FEATURE` (must repeat it).
5. `src/shared/lib/**`, `src/shared/components/ui/**` — wrapped packages allowed, only `SHARED_TO_FEATURE`. Keep LAST.

Adding a rule:
- New wrapped package → append to `WRAPPED` (wrapper folder under `src/shared/lib/**` is already allowlisted).
- New scoped restriction → new object placed before object 5, built with `restrictImports([...])` and repeating every pattern that scope still needs.
- Patterns use gitignore syntax: no `{a,b}` braces; `dir*` matches `dir` and `dir/...`.
- Keep the Next presets and `globalIgnores` untouched.

## Steps
1. Read `eslint.config.mjs`.
2. Add constants + objects; adjust globs to folders that exist.
3. `npm run lint`. Separate real violations (list them) from false positives (tune the rule).
4. Sanity check: temporary probe files that violate each new rule (and one that should pass) → `npx eslint <probes>` → expected errors only → delete probes.

## Report
Rules added, files each rule covers, current violations (path:line), false positives tuned. Stop.
