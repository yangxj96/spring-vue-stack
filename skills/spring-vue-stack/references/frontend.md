# Vue 3 前端参考

用于 Vue 3 页面、组件、Composable、路由、状态及服务端 API 集成。

标准栈：Vue 3 + TypeScript · Vite · Pinia · Vue Router · Element Plus（完整引入）· SCSS + 严格 BEM · vue-i18n · pnpm。普通请求用 `fetch` 封装、文件上传用原生 `XHR` 封装（默认位于 `src/plugins/request`）。代码质量与格式见 [frontend-lint.md](frontend-lint.md)。管理后台常见模式（CRUD 列表页、权限指令、表单、校验 i18n、可访问性）见 [frontend-patterns.md](frontend-patterns.md)。目标仓库显式使用其它方案时以仓库为准。

## 开工探测清单

动手前先确认以下事实，避免套错约定：

- `package.json`：Vue/Vite/TypeScript/Pinia/Vue Router/Element Plus/vue-i18n 版本、包管理器（默认 pnpm）、scripts 与生命周期钩子。
- `vite.config.*`：别名（默认 `@` → `src`）、代理、分包、构建目标。
- `tsconfig*.json`：strict 相关开关、路径映射、include 范围。
- lint/format：ESLint、Prettier、Stylelint 配置文件位置与实际规则。
- `.env*`：`VITE_` 变量、各模式差异、`ImportMetaEnv` 类型声明位置。
- 请求层：普通请求封装与上传封装的位置、统一壳解析、token 注入、错误处理。
- 路由：静态/动态路由、守卫、meta 约定、页面布局与多页签。
- 状态：Pinia store 组织、持久化插件、与服务端数据的边界。
- 组件库：Element Plus 的引入方式与全局主题定制。
- 现有相邻页面、组件、Composable 的写法，作为新增代码的直接模板。

## TypeScript 规范

- 开启 `strict`。新增代码不得用 `any` 绕过类型（ESLint `no-explicit-any` 为 error），外部数据边界用 `unknown` 收敛后再做类型窄化或运行时解析。
- 对象形状优先 `interface`，联合、映射、条件、工具类型用 `type`；不要用空对象类型 `{}`。
- 类型导入使用 `import type`（ESLint 统一 `inline-type-imports`）。
- API 请求/响应类型反映真实契约，字段名使用线上 `snake_case`，不要靠 `as` 强转掩盖不匹配。
- 共享类型集中放在项目既有类型目录并导出；不要在每个组件内重复声明同一契约类型。
- 可空字段显式建模为 `T | null` / `T | undefined`，并在使用处显式处理，不用非空断言 `!` 掩盖可能的空值。

## 数据与日期处理

- **ID 与大数**：ID 按字符串处理（标准主键为 UUIDv7 字符串）；接口若返回数字型 `long`/`bigint`，注意 JS 安全整数上限（2^53-1），必要时让后端序列化为字符串并在前端按字符串使用，避免精度丢失。
- **金额**：金额、比例等精确值按后端约定格式（通常为字符串或最小单位整数）传输与展示，不做二进制浮点运算。
- **日期时间**：使用 `dayjs`（Element Plus 依赖）解析、格式化与时区处理；后端时间字段为 ISO-8601 带偏移或 UTC，前端负责按用户本地时区展示，格式化逻辑集中复用，不在各页面重复实现。
- 单位、千分位、百分比等展示格式集中到工具函数或指令。

## 注释

遵循 [comments.md](comments.md) 的分级标准（中文注释，L1/L2 必须）：

- 导出的 composable、Pinia store、API 模块、共享类型写 TSDoc；复杂组件在 `<script setup>` 顶部说明职责与 props/emits/slots。
- 导出函数写参数、返回值、异常与副作用；不逐行注释 `ref`/`computed`/模板。
- 非直觉的响应式处理、竞态/取消、缓存失效、兼容性 workaround 写清原因。
- BEM 类名已表达结构，不再为选择器加注释；样式 hack 注明原因。
- `TODO`/`FIXME` 带原因与 issue/负责人。

## 文件、目录与命名

- 组件/页面文件与目录使用 PascalCase；API、store、composable、工具、类型文件使用 kebab-case。若仓库已有一致规则，遵循仓库规则。
- Composable 以 `use` 开头（`useUserList.ts`），与文件命名对应。
- Pinia store 以 `use` 开头、`Store` 结尾（`useUserStore.ts`）。
- 组合式函数、类型、常量、事件的命名表达业务含义；布尔量用 `is`/`has`/`can` 前缀。
- 常量使用 UPPER_SNAKE_CASE；不要散落魔法字符串，封闭值域用 `as const` 或联合类型收敛。
- 目录按职责划分（`api`、`components`、`composables`、`layouts`、`plugins`、`views`、`types`、`utils` 等），沿用仓库既有结构，不为局部功能另起平行体系。

## 页面组织（Page Module 与 Colocation）

页面采用**页面模块化（Page Module）**组织，页面私有组件遵循 **Colocation（就近存放）**：

```text
src/
├── components/              # 跨页面共享组件
└── views/
    └── User/
        ├── index.vue        # 页面入口组件（entry component）
        └── components/      # User 页面私有组件
            ├── UserForm.vue
            └── UserTable.vue
```

- 每个页面一个目录 `src/views/<Page>/`（目录 PascalCase），入口组件固定为 `index.vue`，路由指向 `@/views/<Page>/index.vue`。
- 只被当前页面使用的组件放该页面目录下的 `components/`，不要放到全局 `components/`。
- 被多个页面/模块复用时才提升到 `src/components/`，提升后同步更新所有引用。
- 页面私有的 API 类型、辅助函数等同样就近放置；跨页共享才上提。

## 第三方框架配置（src/plugins）

- 第三方框架的初始化与配置集中放在 `src/plugins/`：`plugins/i18n`、`plugins/router`、`plugins/stores`、`plugins/element-plus.ts`（含 `useElementPlusLocale`，使 Element Plus 组件语言跟随 vue-i18n）、`plugins/request`（HTTP 客户端）。
- `main.ts` 只负责创建应用并按插件注册，具体配置在 `plugins/` 内维护。
- 新增第三方框架时在 `plugins/` 增加模块（必要时导出 `setupXxx(app)`），不要堆到 `main.ts`。

## SFC 与组件

- SFC 块顺序固定为 `<script>` → `<template>` → `<style>`（由 ESLint `vue/block-order` 强制）；块标签前后换行；格式化交由 Prettier。
- 统一使用 `<script setup lang="ts">`。`defineProps`、`defineEmits`、`withDefaults`、`defineModel` 写法遵循当前 Vue 版本支持能力，并给出明确类型。
- Props 声明明确类型；`defineEmits` 使用类型化签名；双向绑定优先 `defineModel`，不要用事件模拟实现。
- 不直接修改 props：向上用 `emit`/`defineModel`，需要本地衍生时复制为本地状态，保持单向数据流。
- `v-for` 使用稳定且唯一的 `:key`（如 `id`），不要用数组下标作 key。
- 谨慎使用 `:deep()` 穿透 scoped 样式，限定在明确父级块内，优先使用组件库主题/变量定制。
- template 中组件名使用 PascalCase（ESLint 强制）；页面（`src/views/**`）允许单词组件名，非页面组件保持多词。
- 组件围绕清晰 UI 职责组织；避免超大组件，按职责拆分；可复用的状态行为抽到 Composable。
- 用 `onErrorCaptured` 或上层错误边界处理子组件异常；不要吞掉错误。
- Element Plus 组件按项目既有方式使用，不额外引入第二套 UI 库；全局主题/变量定制集中在项目既有位置。

## Composables

- 复用的有状态逻辑放入 Composable，命名 `useXxx`，放在项目既有 composables 目录。
- Composable 内部注册的监听、定时器、事件、订阅须在 `onScopeDispose`/`onUnmounted` 中清理，避免内存泄漏。
- 返回响应式对象时注意解构陷阱：用 `toRefs` 或返回 `ref`，不要解构后丢失响应性。
- `provide/inject` 使用 `Symbol` 作 key 并配套 `InjectionKey<T>` 类型，组合式函数包一层 `useXxx()` 提供默认值。
- `watch` 精确监听需要的字段，避免对大对象深度监听；派生状态优先用 `computed`；`immediate`/`deep` 按需并评估开销。
- 不在 Composable 中直接操作 DOM 或发请求绕过请求层；只组合状态与行为。

## Pinia 状态

- 使用项目统一的 Pinia 写法（优先 setup store），store 命名 `useXxxStore`。
- 全局/跨页面共享状态放 store；视图内状态用 `ref`/`reactive`；可从现有视图推导的数据不要重复存为 store 状态。
- 服务端数据优先按需获取并配合缓存/失效策略，不要把接口返回整份镜像进 store 造成双份事实源。
- 需要持久化的状态（如用户偏好）使用项目既有的持久化方案；**认证 token 不放进普通业务 store 持久化**，见"认证与安全"。
- store 只做状态与动作编排，业务请求经请求层，不在 store 里直接 `fetch`。

## 路由与权限

- 遵循项目的静态/动态路由、嵌套布局、meta 约定（如 `title`、`permission`/`roles`、`keepAlive`、`hidden`）。
- 路由守卫集中处理登录态、权限、标题、进度条与重定向；不要在页面内重复写导航拦截逻辑。
- 未登录跳转登录页并携带回跳地址；无权限跳 403；未知路径走 404。
- 菜单/面包屑/多页签由路由 meta 驱动，保持一致；修改路由或权限元数据时同步检查守卫、菜单生成与授权配置。
- 前端路由/菜单权限仅用于界面体验，服务端仍必须执行最终授权。

## 请求层

业务请求统一经过标准的两套封装（普通请求 `fetch` + 上传原生 `XHR`）；默认实现位于 `src/plugins/request`，统一出口为 `request`（`request.get/post/put/patch/delete` 走 fetch，`request.upload` 走 XHR），并具名导出 `upload`、`ApiError` 与相关类型。`shared.ts` 承载公共逻辑：地址与查询参数构建、认证头、统一壳校验、错误归一化，fetch/xhr 共用。项目显式使用其它请求层时以项目为准。不要在业务组件中直接调用 `fetch`/`XMLHttpRequest`。

### 普通请求（`fetch` 封装）

- 统一封装基于 `fetch`：`baseURL` 取自 `VITE_API_BASE_URL`（未配置时同源），统一拼接路径、超时（`AbortController`）、公共请求头。
- 注入认证头 `Authorization: Bearer <token>`（见"认证与安全"）。
- 响应处理：`status === 204` 直接返回 `null`；否则解析统一壳 `{code,message,data}`；`!response.ok` 抛出统一的 `ApiError{code,message,data}`；成功返回 `data`。
- 区分网络失败、业务失败、取消（`AbortError`）和过期响应；快速切换筛选/路由造成的并发请求要取消或去重，避免竞态。
- 错误提示统一在封装层按项目约定处理（含去重），业务层只在需要时覆盖；不要把错误信息直接展示给用户而不加处理。
- 业务参数/响应类型与线上契约一致：JSON 字段使用 `snake_case`；若前端业务模型用 camelCase，在 API 边界用明确的类型或转换函数处理，不要假设封装会自动改名。

### 文件上传（原生 `XHR` 封装）

- 上传用 `request.upload(path, file, options)`（原生 `XHR`，可获取 `upload.onprogress` 进度）；不要用普通请求封装上传。
- `file` 支持 `File`/`Blob`（自动装进 `FormData`，字段名 `fileField` 默认 `file`）或已组装好的 `FormData`；`options` 支持 `fields`（附加字段）、`onProgress`、`timeout`、`signal`（取消）。不要手写 `Content-Type`（由浏览器带 boundary），认证头与地址由 `shared.ts` 统一处理。
- 处理成功、失败、取消与超时；大文件按项目既有分片/断点策略，不要自行引入不兼容的上传方案。
- 下载/导出同样使用项目已有的文件传输封装，正确以 `blob` 处理响应并按需从响应头解析文件名。

## 登录页与整体布局

- 登录页独立于布局（不放侧边/顶栏），导出后写入 token 并跳回来源：`redirect` 来自 `?redirect=`，缺省回首页。
- 整体布局放 `src/layouts/`（如 `layouts/Default/`），用 **flex** 保证窗口缩放不错位：纵向容器固定 `height: 100vh`，顶栏与侧栏 `flex: 0 0 auto`，内容区 `flex: 1; min-width: 0; overflow: auto`；默认无页脚。
- 顶栏：左侧品牌（图标+名称），中间横向模块导航，最右用户头像/下拉；布局用 flex，导航区 `flex: 1; min-width: 0; overflow: hidden`，避免挤压或换行错位。
- 菜单模型集中在布局目录（如 `layouts/Default/menu.ts`）：顶层为模块、`children` 为模块页面；顶栏渲染顶层、侧栏渲染当前模块的 `children`，`path` 与路由保持一致。菜单项可带 `icon`（`@element-plus/icons-vue`）。
- 内容区顶部放面包屑（`layouts/Default/components/AppBreadcrumb.vue`）：由菜单模型生成「模块 / 当前页」，模块项可点击跳到该模块第一个页面，当前页项不可点。
- 内容区高度用 flex 管理：main 为纵向 flex（`gap` + `overflow: hidden`），面包屑 `flex: 0 0 auto`，页面容器 `flex: 1; min-height: 0`（仅超长时滚动），避免加面包屑后出现整体滚动条。
- 鉴权：路由守卫集中判断登录态（有 token 放行，未登录跳登录页并携带 `redirect`，已登录访问登录页跳首页）；token 通过 `plugins/request/token` 读写，`plugins/stores` 的认证 store 收口登录/退出。
- 脚手架内置演示菜单（工作台/示例/系统，各 2 个子页）、`components/PagePlaceholder.vue` 占位组件与表格、表单示例页，便于新项目快速查看布局并替换为业务页面。

## 前后端类型契约同步

- 前端类型以后端契约为准：优先使用 OpenAPI 生成类型（如 `openapi-typescript`），生成物集中在 `src/types/api`，不手工修改生成文件。
- 无法生成时，手工维护的 API 类型必须与线上 `snake_case` 契约一致；变更接口时同步更新类型与调用方，类型漂移视为缺陷。
- 请求/响应类型定义在 API 模块旁，业务组件只消费类型，不自行拼装字段。
- 后端新增/修改字段时，同步检查前端类型、调用方页面与接口文档（见“变更影响”）。

## 认证与安全

- 标准方案：后端签发 UUID token，前端持有并在请求头 `Authorization: Bearer <uuid>` 携带。token 的存放、刷新与注销流程遵循项目既有实现。
- 区分 access/refresh（若项目采用）；401 时按项目既有机制刷新或跳登录，刷新失败清理状态并跳登录，避免无限重试。
- 并发 401 只允许一个刷新在途：其余请求排队，刷新成功后重放，失败则统一跳登录，避免刷新风暴与死循环。见 [pitfalls.md](pitfalls.md)。
- token 不放普通业务 store 做持久化；按项目约定存放（如专用存储模块）。前端不得记录或打印 token、密码等敏感信息。
- 退出登录清理 token、用户信息、权限缓存与相关持久化状态。
- 按钮/元素级权限用项目既有的指令或权限判断工具（如 `v-permission`）；不要仅靠隐藏 UI 实现安全。
- 不把敏感值放进 URL；不在前端做不可信的加密/验签安全决策。

## 表单与校验

- 表单校验与服务端约束保持一致；Element Plus 表单使用项目既有的 rules 约定。
- 服务端返回字段错误时映射到对应输入项，同时保留可理解的全局错误提示。
- 时间、金额等按项目既定格式控件处理，不要在多个页面各自格式化。
- 提交、删除、发布和批量操作提供清楚的进行中与结果反馈；不可逆操作采用项目既有的确认方式，防止重复提交。

## 样式（SCSS + 严格 BEM）

- 使用 SCSS，类名遵循严格 BEM：`block__element--modifier`。块名用 kebab-case；元素与修饰符不使用嵌套类名前缀以外的约定。
- 组件样式默认 `<style scoped lang="scss">`；全局样式、变量、混入、主题集中在项目既有目录。
- 不写深层嵌套选择器（BEM 已表达层级）；状态变化用修饰符类而非 `!important`。
- 颜色、间距、字号使用项目既有的 SCSS 变量/设计令牌，不硬编码重复数值。
- 主题/暗色、响应式断点沿用项目既有方案；不要为单个页面另起一套变量体系。
- 属性顺序与选择器命名由 Stylelint 校验，见 [frontend-lint.md](frontend-lint.md)。

## 国际化（vue-i18n）

- 文案经 `vue-i18n` 管理，不写死用户可见文本；key 按业务模块分层（如 `user.list.title`）。
- 语言包按项目既有方式组织与懒加载；Element Plus 等库的 locale 跟随当前语言切换。
- 动态参数用命名插值，不拼接成难以维护的字符串；新增 key 时同步所有已支持语言。

## 环境与构建

- 环境变量使用 `VITE_` 前缀，通过 `import.meta.env` 读取；为 `ImportMetaEnv` 补充类型声明，避免 `any`。
- 按模式区分 `.env.development` / `.env.production` 等，敏感配置不进前端包。
- 路径别名默认 `@` → `src`，与 tsconfig 和 vite 配置保持一致。
- 开发代理在 `vite.config` 中配置，不把后端地址散落到请求代码。
- 生产构建关注分包、按需加载与产物体积；构建/类型检查命令以项目 `package.json` 为准（如 `vue-tsc`），不虚构脚本。
- 检查 `prestart`/`prebuild` 等生命周期钩子是否已包含检查，避免重复串联同一命令。

## 错误与交互反馈

- 页面/组件呈现加载、空结果、成功、失败与禁用状态；列表与详情尤其不能只处理成功路径。
- 统一使用项目既有反馈组件（Element Plus 的 message/notification/dialog 等），错误提示去重，避免同一错误弹多次。
- 全局错误与局部错误分级：可预期的业务错误就地提示，未知异常走统一兜底。
- 乐观更新仅在可安全回滚时使用，失败要恢复原状态并提示。
- 交互组件保留键盘操作、标签（label）和可感知的错误提示，兼顾可访问性。
- 生产环境接入前端错误监控（如 Sentry）：上报未捕获异常与关键失败，上传 sourcemap 并去除敏感信息。

## 性能

- 路由与重型组件按需/懒加载；列表页合理使用 `keep-alive`（由路由 meta 控制）。
- 长列表用虚拟滚动；频繁触发的事件用防抖/节流。
- 避免在渲染中做重计算，必要时用 `computed` 缓存；大对象不放进响应式深层代理。
- 图片等资源按需加载并压缩；不引入体积大且用途单一的依赖。

## 依赖管理

- 包管理器默认 pnpm；锁文件与 `engines` 以项目为准。
- 引入新依赖前先确认项目已有哪些能力，不重复引入功能相同的库；不引入第二套 UI 库、请求库或状态库。
- 遵循 Element Plus 完整引入的标准方式；若项目已用按需引入插件则沿用。
- 升级依赖评估破坏性变更与构建影响；不为单个改动随意升级框架版本。

## 测试与验证

- 单测使用 Vitest + Vue Test Utils，store/router 按项目既有 mock 模式；组件测试聚焦行为而非实现细节。
- E2E 使用 Playwright，覆盖关键用户路径。
- 前后端并行开发可用 MSW 等 mock；mock 仅用于开发与测试，不进入生产构建。
- 开发时优先运行目标测试或类型检查；交付前按项目约定执行完整门禁（lint、type-check、test、build）。
- 不虚构项目不存在的命令；先读 `package.json` scripts 与仓库说明。
- 修改 API 接口或字段时，检查后端契约、API 模块、共享类型和所有受影响页面；修改路由或权限元数据时检查守卫、菜单/导航生成和授权配置；修改上传/下载时检查服务端约束、请求封装及文件响应处理。

## 实时通信（WebSocket / SSE）

- 仅在实际需要实时推送时引入；HTTP 轮询能满足的不要上 WebSocket。
- 连接建立需携带鉴权并处理过期；断线使用指数退避重连并设上限，重连后重新鉴权。
- 组件/页面卸载时关闭连接、清理监听与定时器，避免重复连接与内存泄漏。
- 消息处理要幂等并考虑乱序；对心跳、超时与错误有明确处理。

## 变更影响

- 改动 API 路径/字段/错误语义：同步 API 模块、共享类型、调用方页面与接口文档。
- 改动路由/权限 meta：同步守卫、菜单/面包屑/多页签与授权配置。
- 改动环境变量/构建配置：同步 `.env*`、类型声明、CI 与部署说明。
- 只更新确实受影响的文件，避免把同一事实复制到多处导致不一致。
