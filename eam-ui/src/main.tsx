import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: new URL(".", import.meta.url).pathname, // 👈 pins to apps/api
        project: ["./tsconfig.json"],
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // keep it minimal; add more later if you want
    },
    ignores: ["dist/**", "build/**", "node_modules/**"]
  }
];
