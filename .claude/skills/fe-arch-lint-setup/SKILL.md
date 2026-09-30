---
name: fe-arch-lint-setup
description: Encode the client's architecture rules in eslint.config.mjs (flat config) so lint catches them — restricted imports of wrapped packages outside src/shared/lib, deep feature imports, shared→feature imports, process.env outside config, atomic level direction, hardcoded query keys. Use once when setting up the project, or when a new wrapped package/rule is added.
---

# fe-arch-lint-setup

**Scope:** `eslint.config.mjs` (+ dev dependency only if a plugin is truly needed). **Out of scope:** fixing violations the new rules reveal — list them, the developer decides (fix steps, or `fe-arch-review`).

Use `@typescript-eslint/no-restricted-imports` (already loaded by `eslint-config-next/typescript`; supports `allowTypeImports`) with core `no-restricted-imports` turned off, plus core `no-restricted-syntax`. No extra plugin unless the developer approves one. Patterns use gitignore syntax — no `{a,b}` braces, list each path.

## Rules to encode
Append config objects after the Next presets (later objects override earlier ones for matching `files`):

```js
const WRAPPED = [
  { name: '@tanstack/react-query', message: 'Use @/shared/lib/query.' },
  { name: 'joi', message: 'Use @/shared/lib/validation.' },
  { name: 'react-hook-form', message: 'Use @/shared/lib/form.' },
];
const WRAPPED_PATTERNS = [{ group: ['@hookform/resolvers/*', '@tanstack/react-query-devtools'], message: 'Use the shared/lib wrappers.' }];
const DEEP_FEATURE = { group: ['@/features/*/*'], message: 'Import a feature only through its index: @/features/<slug>.' };

// 1. everywhere in src
{
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': ['error', { paths: WRAPPED, patterns: [...WRAPPED_PATTERNS, DEEP_FEATURE] }],
    'no-restricted-syntax': ['error',
      { selector: "MemberExpression[object.name='process'][property.name='env']", message: 'Read env via @/shared/config/env.' },
      { selector: "Property[key.name='queryKey'] > ArrayExpression", message: 'Use queryKeys.* from @/shared/lib/query.' },
    ],
  },
},
// 2. shared never imports features (query-keys may import types → allowTypeImports)
{
  files: ['src/shared/**'],
  rules: { '@typescript-eslint/no-restricted-imports': ['error', { paths: WRAPPED, patterns: [...WRAPPED_PATTERNS,
    { group: ['@/features/*'], message: 'shared must not depend on features.', allowTypeImports: true }] }] },
},
// 3. config may read process.env
{ files: ['src/shared/config/**', 'src/proxy.ts'], rules: { 'no-restricted-syntax': 'off' } },
// 4. atomic direction (atoms ↛ molecules/organisms/templates, molecules ↛ organisms/templates)
{ files: ['src/shared/components/atoms/**'], rules: { '@typescript-eslint/no-restricted-imports': ['error', { patterns: [
  { group: ['@/shared/components/molecules*', '@/shared/components/organisms*', '@/shared/components/templates*', '../molecules/*', '../organisms/*', '../templates/*'], message: 'Atoms cannot import higher levels.' }, ...WRAPPED_PATTERNS] , paths: WRAPPED }] } },
{ files: ['src/shared/components/molecules/**'], rules: { '@typescript-eslint/no-restricted-imports': ['error', { patterns: [
  { group: ['@/shared/components/organisms*', '@/shared/components/templates*', '../organisms/*', '../templates/*'], message: 'Molecules cannot import organisms/templates.' }, ...WRAPPED_PATTERNS], paths: WRAPPED }] } },
// 5. wrappers + shadcn vendor may use the packages (must come AFTER the shared/** block)
{
  files: ['src/shared/lib/**', 'src/shared/components/ui/**'],
  rules: { '@typescript-eslint/no-restricted-imports': ['error', { patterns: [DEEP_FEATURE] }], 'no-restricted-syntax': 'off' },
},
```
Notes:
- The rule does NOT merge across objects — each override must repeat the full option set it still wants (as above). Keep the shared constants at the top of the file.
- Order matters: later objects win for the same rule. The wrapper/vendor allowlist (object 5) stays last.
- New wrapped packages go into `WRAPPED`; their wrapper folder is already covered by `src/shared/lib/**`.
- Keep the Next presets and `globalIgnores` untouched.

## Steps
1. Read `eslint.config.mjs`.
2. Add constants + objects; adjust globs to folders that exist.
3. `npm run lint`. Separate real violations (list them) from false positives (tune the rule).
4. Sanity check: add a temporary `import { useQuery } from '@tanstack/react-query'` in a feature file → lint error → remove it.

## Report
Rules added, files each rule covers, current violations (path:line), false positives tuned. Stop.
