import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

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
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // Prevent features from importing from app
            {
              target: "./src/features/**",
              from: "./src/app/**",
            },
            // Prevent cross-feature imports: auth cannot import from calendar
            {
              target: "./src/features/calendar/**",
              from: "./src/features/auth/**",
            },
            // Prevent cross-feature imports: calendar cannot import from auth
            {
              target: "./src/features/auth/**",
              from: "./src/features/calendar/**",
            },
            // Prevent shared modules from importing from features/app
            // (features/app can import from shared modules, but not the other way around)
            {
              target: ["./src/components/**", "./src/contexts/**", "./src/utils/**"],
              from: ["./src/features/**", "./src/app/**"],
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
