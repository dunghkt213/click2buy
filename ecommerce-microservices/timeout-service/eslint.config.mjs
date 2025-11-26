import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Cấu hình ESLint cơ bản
  eslint.configs.recommended,

  // Cấu hình hỗ trợ TypeScript
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // Tắt các rule gây phiền trong microservice
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",

      // Cho phép console.log (vì Timeout-Service cần log TTL)
      "no-console": "off",
    },
  },

  // Ignore build folder
  {
    ignores: ["dist/", "node_modules/"],
  },
];
