# 前端代码质量配置

本文件是前端 ESLint / Prettier / Stylelint 的标准配置事实源。目标仓库已配置同项工具时，以仓库配置为准；仓库缺失或尚未统一时，以下配置作为标准基线。

## 规则摘要

以下摘要来自标准配置，生成代码时应直接满足：

- **ESLint**：`@vue/eslint-config-typescript`（`vueTsConfigs.recommended`）+ `eslint-plugin-vue`（`flat/essential`）+ `eslint-config-prettier`（关闭与 Prettier 冲突的格式化规则）。
- **格式交由 Prettier**：缩进 4 空格、双引号、行宽 120、语句末尾分号、无尾逗号、箭头函数单参数不加括号、`LF` 换行。
- **TS**：禁止 `any`；未使用变量报错；类型导入统一 `inline-type-imports`；禁止空对象类型 `{}`；禁止 `require`。
- **导入**：按 `builtin → external → internal → parent → sibling → index → type` 分组、组间空行、组内字母序；`@/**` 归 internal；禁止循环依赖、重复导入、导入自身、未解析路径；`import` 后必须空一行且置于文件顶部。
- **通用**：`eqeqeq`、禁止 `var`、优先 `const`、禁止空代码块、禁止 `debugger`、`isNaN` 判断、禁止隐式全局变量。
- **复杂度**：函数最长 200 行、最多 4 个参数、禁止嵌套三元。
- **Vue**：SFC 块顺序固定 `script → template → style`；块标签前后换行；template 中组件名 `PascalCase`；禁止注册未使用组件；`v-html` 警告；页面（`src/views/**`）放开单词组件名。
- **Stylelint**：校验 SCSS 语法与属性顺序，并强制 BEM 选择器命名（见下）。

## Prettier 配置

```yaml
# .prettierrc.yml
semi: true
tabWidth: 4
useTabs: false
singleQuote: false
quoteProps: as-needed
printWidth: 120
trailingComma: none
htmlWhitespaceSensitivity: ignore
bracketSpacing: true
bracketSameLine: true
arrowParens: avoid
endOfLine: lf
vueIndentScriptAndStyle: false
```

```gitignore
# .prettierignore
# 依赖
node_modules/

# 构建与缓存产物
dist/
coverage/
.vite/

# 浏览器测试产物
.playwright-cli/
playwright-report/
test-results/

# 第三方或压缩资源
vendor/
*.min.js
*.min.css

# 包管理器生成文件
package-lock.json
npm-shrinkwrap.json
yarn.lock
pnpm-lock.yaml
bun.lock
bun.lockb

# 日志与系统文件
*.log
.DS_Store
```

## ESLint 配置

```ts
// eslint.config.ts
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import { globalIgnores } from "eslint/config";
import skipFormatting from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import pluginVue from "eslint-plugin-vue";

// import autoImport from "./.eslintrc-auto-import.json";

// 定义VueTs版本的配置, 靠后的规则覆盖靠前的规则
const eslintConfig: ReturnType<typeof defineConfigWithVueTs> = defineConfigWithVueTs(
    // 全局忽略
    globalIgnores([
        "**/node_modules/**",
        "**/build/**",
        "**/dist/**",
        "**/dist-ssr/**",
        "**/coverage/**",
        "**/.output/**",
        "**/.vite/**",
        "**/public/**",
        "**/*.d.ts"
    ]),
    // ts的recommended
    vueTsConfigs.recommended,
    // flat的recommended
    ...pluginVue.configs["flat/essential"],
    // 跳过格式化,格式化交给prettier
    skipFormatting,
    // 让 ESLint 识别自动导入变量
    // {
    //     languageOptions: {
    //         globals: autoImport.globals
    //     }
    // },
    // vue,ts,mts,tsx文件的规则
    {
        name: "app/files-to-lint",
        files: ["**/*.{vue,ts,mts,tsx}"],
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: ["./tsconfig.app.json", "./tsconfig.node.json"]
                },
                node: true
            }
        },
        plugins: {
            import: importPlugin
        },
        rules: {
            // 必须使用 === / !==
            eqeqeq: "warn",
            // 禁止空代码块
            "no-empty": "error",
            // 禁止使用 var
            "no-var": "error",
            // 优先使用 const（如果变量不会被重新赋值）
            "prefer-const": "error",
            // 禁止在代码中留下 debugger
            "no-debugger": "warn",
            // 必须使用 isNaN() 判断 NaN
            "use-isnan": "error",
            // 禁止在全局作用域声明变量
            "no-implicit-globals": "error",

            // 禁止未使用的变量
            "@typescript-eslint/no-unused-vars": "error",
            // 禁止使用 any 类型
            "@typescript-eslint/no-explicit-any": "error",
            // 禁止使用 require (必须使用 import)
            "@typescript-eslint/no-var-requires": "error",
            // 禁止空对象类型 {}
            "@typescript-eslint/no-empty-object-type": "error",
            // 强制类型导入使用 import type
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports"
                }
            ],

            // import排序
            "import/order": [
                "error",
                {
                    // import分组顺序
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
                    // 不同分组之间必须换行
                    "newlines-between": "always",
                    // 同组import按字母排序
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true
                    },
                    // 将 @/xxx 识别为 internal
                    pathGroups: [
                        {
                            pattern: "@/**",
                            group: "internal"
                        }
                    ],
                    // 内置模块不参与pathGroups
                    pathGroupsExcludedImportTypes: ["builtin"]
                }
            ],
            // 禁止循环依赖
            "import/no-cycle": "error",
            // 检查import路径是否能解析
            "import/no-unresolved": "error",
            // 禁止重复 import
            "import/no-duplicates": "error",
            // import 后必须空一行
            "import/newline-after-import": "error",
            // import 语句必须放在文件顶部
            "import/first": "error",
            // 禁止导入自身文件
            "import/no-self-import": "error",

            // 函数最大行数限制（防止函数过长）
            "max-lines-per-function": ["warn", 200],
            // 函数最大参数数量限制
            "max-params": ["warn", 4],
            // 禁止嵌套三元表达式（可读性差）
            "no-nested-ternary": "warn"
        }
    },
    // 针对所有VUE文件的规则
    {
        name: "vue/sfc",
        files: ["**/*.vue"],
        plugins: {
            vue: pluginVue
        },
        rules: {
            // 限制Vue SFC块顺序：script -> template -> style
            "vue/block-order": ["error", { order: ["script", "template", "style"] }],
            // Vue block标签前后必须换行
            "vue/block-tag-newline": ["error", { singleline: "always", multiline: "always" }],
            // 禁止注册但未使用的组件
            "vue/no-unused-components": "error",
            // 组件在template中必须使用 PascalCase
            "vue/component-name-in-template-casing": ["error", "PascalCase"],
            // 不建议使用 v-html（可能造成XSS）
            "vue/no-v-html": "warn",
            // Vue3通常不强制要求默认prop值
            "vue/require-default-prop": "off"
        }
    },
    // views下的页面文件的规则
    {
        name: "Vue Views",
        files: ["src/views/**/*.vue"],
        rules: {
            // 页面组件允许使用单词组件名（如 Login.vue / Home.vue）
            "vue/multi-word-component-names": "off"
        }
    }
);

export default eslintConfig;
```

## Stylelint 配置（标准新增）

Stylelint 只负责 SCSS 语法、属性顺序和 BEM 选择器命名，与 Prettier 的格式化职责不重叠。仓库未配置时采用以下基线（依赖 `stylelint`、`stylelint-config-standard-scss`、`stylelint-config-recess-order`、`postcss-html`、`stylelint-config-recommended-vue`）：

```js
// stylelint.config.mjs
export default {
    extends: ["stylelint-config-standard-scss", "stylelint-config-recess-order"],
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
```

- 依赖版本以目标项目安装结果为准；引入前先确认仓库是否已有等价配置。
- 自动修复使用 `stylelint --fix`，但仅在项目脚本允许时执行。
