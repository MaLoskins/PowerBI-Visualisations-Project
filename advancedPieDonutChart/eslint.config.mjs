import tsPlugin from "@typescript-eslint/eslint-plugin";
import pbiPlugin from "eslint-plugin-powerbi-visuals";

export default [
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tsPlugin,
            "powerbi-visuals": pbiPlugin,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": "off",
        },
    },
];
