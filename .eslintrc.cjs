/* eslint-env node */
module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "@stylistic",
        "@stylistic/jsx"
    ],
    rules: {
        "camelcase": "warn",
        "curly": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@stylistic/member-delimiter-style": ["warn", {
            "multiline": {
                "delimiter": "comma"
            },
            "singleline": {
                "delimiter": "comma"
            }
        }],
        "@stylistic/semi": "warn",
        "@stylistic/jsx-child-element-spacing": "error",
        "@stylistic/jsx-closing-bracket-location": "error",
        "@stylistic/jsx-tag-spacing": "warn",
        "@stylistic/jsx-first-prop-new-line": ["warn", "multiline"],
        "@stylistic/indent": ["error", 4],
        "@stylistic/comma-dangle": ["error", "always-multiline"],
        "@stylistic/brace-style": "error",
        "@stylistic/space-before-function-paren": ["error", "never"],
        "@stylistic/keyword-spacing": "error",
    },
    root: true,
};