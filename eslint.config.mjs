import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // These patterns are standard in Next.js data-fetching; downgrade to warn
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Components-in-render is a lint heuristic, not always a real bug
      "react/no-unstable-nested-components": "warn",
      // Allow any for Prisma adapter casting
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars as warn, not error
      "@typescript-eslint/no-unused-vars": "warn",
      // img vs Image - warn only
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
