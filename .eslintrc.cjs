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
    },
    root: true,
};