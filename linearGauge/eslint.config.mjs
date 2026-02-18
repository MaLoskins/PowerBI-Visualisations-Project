import eslintPlugin from "@typescript-eslint/eslint-plugin";
import powerbiPlugin from "eslint-plugin-powerbi-visuals";

export default [
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": eslintPlugin,
            "powerbi-visuals": powerbiPlugin,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
        },
    },
];
