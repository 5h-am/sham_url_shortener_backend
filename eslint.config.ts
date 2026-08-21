import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "logs/**",
      "*.log",
      ".env",
      ".env.*",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",

      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",

      eqeqeq: ["error", "always"],
      curly: "error",
      "dot-notation": "error",

      "no-return-await": "error",
      "require-await": "warn",

      "no-shadow": "warn",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",

      "consistent-return": "error",
      "no-process-exit": "warn",
      "no-useless-catch": "warn",
      "prefer-destructuring": ["warn", { object: true, array: false }],
    },
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-console": "off",

      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",

      eqeqeq: ["error", "always"],
      curly: "error",
      "dot-notation": "error",

      "no-return-await": "error",
      "require-await": "warn",

      "no-shadow": "off",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",

      "consistent-return": "error",
      "no-process-exit": "warn",
      "no-useless-catch": "warn",
      "prefer-destructuring": ["warn", { object: true, array: false }],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
];
