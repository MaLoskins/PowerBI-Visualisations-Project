import tseslint from "@typescript-eslint/eslint-plugin";
import pbiVisuals from "eslint-plugin-powerbi-visuals";

export default [
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint,
            "powerbi-visuals": pbiVisuals,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
