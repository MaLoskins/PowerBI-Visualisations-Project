import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";

export default [
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: ["node_modules/**", "dist/**", ".vscode/**", ".tmp/**"],
    },
    {
        files: ["src/**/*.ts"],
        rules: {
            /* E1: Function/method length threshold */
            "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],

            /* E1: Cyclomatic complexity */
            "complexity": ["warn", { max: 15 }],

            /* E1: Forbid `any` */
            "@typescript-eslint/no-explicit-any": "warn",

            /* E1: Consistent type imports */
            "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

            /* E1: Explicit return types for exported functions */
            "@typescript-eslint/explicit-function-return-type": ["warn", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
            }],

            /* General cleanliness */
            "no-console": "warn",
            "prefer-const": "error",
        },
    },
];
