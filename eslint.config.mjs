import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ---------------------------------------------------------------------------
// Architecture rules (skill fe-arch-lint-setup).
// `@typescript-eslint/no-restricted-imports` options do NOT merge across config
// objects — every override repeats the full option set it still wants.
// Order matters: later objects win for the same rule.
// ---------------------------------------------------------------------------

/** Map packages — only the map organisms (MapPicker, MarkerMap) may import them. */
const MAP_MESSAGE = "Use MapPicker / MarkerMap from @/shared/components/organisms.";
const MAP_PACKAGES = [
  { name: "leaflet", message: MAP_MESSAGE },
  { name: "react-leaflet", message: MAP_MESSAGE },
];
const MAP_PATTERNS = [{ group: ["leaflet/*", "react-leaflet/*"], message: MAP_MESSAGE }];

/** Packages wrapped in src/shared/lib — import the wrapper instead. */
const WRAPPED = [
  { name: "@tanstack/react-query", message: "Use @/shared/lib/query." },
  { name: "@tanstack/react-query-devtools", message: "Use @/shared/lib/query." },
  { name: "joi", message: "Use @/shared/lib/validation." },
  { name: "react-hook-form", message: "Use @/shared/lib/form." },
  { name: "@hookform/resolvers", message: "Use @/shared/lib/form." },
  ...MAP_PACKAGES,
];
const WRAPPED_PATTERNS = [{ group: ["@hookform/resolvers/*"], message: "Use @/shared/lib/form." }, ...MAP_PATTERNS];

const DEEP_FEATURE = {
  group: ["@/features/*/*"],
  message: "Import a feature only through its index: @/features/<slug>.",
};
const SHARED_TO_FEATURE = {
  group: ["@/features/*"],
  message: "src/shared must not depend on features.",
  allowTypeImports: true,
};

const RESTRICTED_SYNTAX = [
  {
    selector: "MemberExpression[object.name='process'][property.name='env']",
    message: "Read env via @/shared/config (env.public / env.server).",
  },
  {
    selector: "Property[key.name='queryKey'] > ArrayExpression",
    message: "Use queryKeys.* from @/shared/lib/query.",
  },
];

const restrictImports = (patterns, paths = WRAPPED, basePatterns = WRAPPED_PATTERNS) => [
  "error",
  { paths, patterns: [...basePatterns, ...patterns] },
];

const architectureRules = [
  // 1. Everywhere in src.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": restrictImports([DEEP_FEATURE]),
      "no-restricted-syntax": ["error", ...RESTRICTED_SYNTAX],
    },
  },
  // 2. shared never imports features (type-only imports allowed, e.g. filters in query-keys).
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": restrictImports([SHARED_TO_FEATURE]),
    },
  },
  // 3. Config (and Next proxy) may read process.env.
  {
    files: ["src/shared/config/**/*.ts", "src/proxy.ts"],
    rules: { "no-restricted-syntax": ["error", RESTRICTED_SYNTAX[1]] },
  },
  // 4. Atomic direction: atoms ↛ molecules/organisms/templates, molecules ↛ organisms/templates.
  {
    files: ["src/shared/components/atoms/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": restrictImports([
        SHARED_TO_FEATURE,
        {
          group: [
            "@/shared/components/molecules*",
            "@/shared/components/organisms*",
            "@/shared/components/templates*",
            "../molecules/*",
            "../organisms/*",
            "../templates/*",
          ],
          message: "Atoms cannot import higher atomic levels.",
        },
      ]),
    },
  },
  {
    files: ["src/shared/components/molecules/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": restrictImports([
        SHARED_TO_FEATURE,
        {
          group: [
            "@/shared/components/organisms*",
            "@/shared/components/templates*",
            "../organisms/*",
            "../templates/*",
          ],
          message: "Molecules cannot import organisms/templates.",
        },
      ]),
    },
  },
  // 5. MapPicker / MarkerMap are the map wrappers: leaflet / react-leaflet allowed, other wrapped packages still banned.
  {
    files: [
      "src/shared/components/organisms/map-picker/**/*.{ts,tsx}",
      "src/shared/components/organisms/marker-map/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": restrictImports(
        [SHARED_TO_FEATURE],
        WRAPPED.filter((path) => !MAP_PACKAGES.includes(path)),
        WRAPPED_PATTERNS.filter((pattern) => !MAP_PATTERNS.includes(pattern)),
      ),
    },
  },
  // 6. Wrappers + shadcn vendor files may use the wrapped packages (keep LAST).
  {
    files: ["src/shared/lib/**/*.{ts,tsx}", "src/shared/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", { patterns: [SHARED_TO_FEATURE] }],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...architectureRules,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
