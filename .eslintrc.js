module.exports = {
    root: true,
    extends: "@react-native",
    ignorePatterns: [
        "android/**",
        "ios/**",
        "coverage/**",
        "**/*.log",
        "src/shared-types/**",
    ],
    reportUnusedDisableDirectives: true,
    rules: {
        quotes: ["warn", "double", {allowTemplateLiterals: true}],
        "jsx-quotes": ["warn", "prefer-double"],
        "react-native/no-inline-styles": "off",
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            rules: {
                "@typescript-eslint/no-unused-vars": [
                    "error",
                    {
                        argsIgnorePattern: "^_",
                        caughtErrorsIgnorePattern: "^_",
                        destructuredArrayIgnorePattern: "^_",
                        varsIgnorePattern: "^_",
                        ignoreRestSiblings: true,
                    },
                ],
            },
        },
        {
            files: ["*.config.js", ".eslintrc.js"],
            env: {
                node: true,
            },
        },
    ],
};
