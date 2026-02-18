import tseslint from "@typescript-eslint/eslint-plugin";
import powerbiVisuals from "eslint-plugin-powerbi-visuals";

export default [
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint,
            "powerbi-visuals": powerbiVisuals,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "powerbi-visuals/no-banned-terms": "error",
        },
    },
];
