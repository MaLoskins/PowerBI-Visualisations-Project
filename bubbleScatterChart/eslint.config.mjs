import eslintPluginPowerbiVisuals from "eslint-plugin-powerbi-visuals";
import tseslint from "@typescript-eslint/eslint-plugin";

export default [
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint,
            "powerbi-visuals": eslintPluginPowerbiVisuals,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
        },
    },
];
