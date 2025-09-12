import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	{
		languageOptions: {
			globals: globals.browser,
		},
	},
	pluginJs.configs.recommended,
	{
		plugins: {
			prettier: eslintPluginPrettier,
		},
		rules: {
			// Prettier plugin will report formatting issues
			"prettier/prettier": "error",

			// Optional: ESLint native rule to enforce 2-space indent (in case Prettier isn’t used somewhere)
			indent: ["error", 4],
		},
	},
	// Ensure Prettier disables conflicting ESLint formatting rules
	prettier,
];
