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
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
        },
    },
];
