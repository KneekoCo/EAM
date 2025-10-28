// eslint.config.mjs (snippet for UI)
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const uiDir = fileURLToPath(new URL("./eam-ui", import.meta.url));

export default [
  {
    files: ["eam-ui/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: uiDir,
        project: ["./tsconfig.json"],
        sourceType: "module"
      }
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {},
    ignores: ["eam-ui/dist/**"]
  },
  { ignores: ["**/node_modules/**"] }
];
