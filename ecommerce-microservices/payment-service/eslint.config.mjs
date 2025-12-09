// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  ...tseslint.configs.recommended,
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
