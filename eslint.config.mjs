import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

// Type-aware rules require type information, so they're scoped to the TS files
// that live in the tsconfig project. JS/config files (.mjs) are left on the
// syntactic rules only — enabling the project service for them would fail
// (they aren't part of the TS program).
const TS_FILES = ["**/*.ts", "**/*.tsx", "**/*.mts"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // typescript-eslint recommended-type-checked, restricted to TS files.
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: TS_FILES,
  })),
  {
    files: TS_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

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
