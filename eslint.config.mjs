/* eslint-env node */
import { fileURLToPath } from "node:url";
import path from "node:path";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(rootDir, "apps", "api");
const uiDir  = path.join(rootDir, "eam-ui");

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore build artifacts everywhere
  { ignores: ["**/dist/**", "**/build/**", "**/node_modules/**"] },

  // Config/JS files: use default parser (do NOT use TS project lookup here)
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: { sourceType: "module" }
  },

  // ---- API package (apps/api) ----
  {
    files: ["apps/api/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: apiDir,
        project: [path.join(apiDir, "tsconfig.json")],
        sourceType: "module"
      }
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {}
  },

  // ---- UI package (eam-ui) ----
  {
    files: ["eam-ui/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: uiDir,
        project: [path.join(uiDir, "tsconfig.json")],
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks
    },
    settings: { react: { version: "detect" } },
    rules: {}
  }
];
