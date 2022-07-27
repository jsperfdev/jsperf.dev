module.exports = {
  root: true,
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  ignorePatterns: ["**/dist/**/*"],
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
    },
  ],
};
