// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default tseslint
	.config(
		{ ignores: ["dist", "coverage", "*.min.js"] },
		{
			extends: [js.configs.recommended, ...tseslint.configs.recommended],
			files: ["**/*.{ts,js}"],
			languageOptions: {
				ecmaVersion: 2022,
				globals: {
					...globals.node,
				},
			},
			rules: {
				// TypeScript
				"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
				"@typescript-eslint/no-explicit-any": "warn",
				"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
				// Node / Express best practices
				"no-console": ["warn", { allow: ["warn", "error", "info"] }],
				"prefer-const": "error",
				"no-var": "error",
			},
		},
	)
	.concat(eslintPluginPrettier);
