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

export default [
  // ignore builds everywhere
  { ignores: ["**/dist/**", "**/build/**", "**/node_modules/**"] },

  // config JS files — do NOT use TS project lookup
  { files: ["**/*.js", "**/*.cjs", "**/*.mjs"], languageOptions: { sourceType: "module" } },

  // API (no "project" on purpose)
  {
    files: ["apps/api/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: apiDir,
        sourceType: "module"
      }
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {}
  },

  // UI (no "project" on purpose)
  {
    files: ["eam-ui/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: uiDir,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: { "@typescript-eslint": tsPlugin, react: reactPlugin, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {}
  }
];
