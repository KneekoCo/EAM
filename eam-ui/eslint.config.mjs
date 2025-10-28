import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir,              // ✅ real path
        project: ["./tsconfig.json"],
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
    rules: {},
    ignores: ["dist/**", "build/**", "node_modules/**"]
  }
];
