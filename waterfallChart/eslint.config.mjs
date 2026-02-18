import eslintPluginPowerbiVisuals from "eslint-plugin-powerbi-visuals";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
    {
        plugins: {
            "powerbi-visuals": eslintPluginPowerbiVisuals,
            "@typescript-eslint": typescriptEslintPlugin,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
        },
    },
];
