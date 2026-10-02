export default {
    extends: ["stylelint-config-standard-scss", "stylelint-config-recess-order", "stylelint-config-recommended-vue"],
    overrides: [
        {
            files: ["**/*.vue"],
            customSyntax: "postcss-html"
        }
    ],
    plugins: ["stylelint-selector-bem-pattern"],
    rules: {
        // 强制 BEM：block__element--modifier
        "plugin/selector-bem-pattern": {
            preset: "bem",
            componentName: "[a-z][a-z0-9]*(?:-[a-z0-9]+)*",
            componentSelectors: {
                initial: "^\\.{componentName}(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?$"
            }
        },
        "selector-class-pattern": null,
        "scss/at-rule-no-unknown": true,
        "no-descending-specificity": null
    }
};
