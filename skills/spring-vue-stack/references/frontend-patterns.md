# 前端模式：CRUD、权限与表单

用于管理后台的常见页面模式。基础规范见 [frontend.md](frontend.md)；lint/格式见 [frontend-lint.md](frontend-lint.md)。

## CRUD 列表页蓝图

一个列表页通常由「搜索表单 + 表格 + 分页 + 新建/编辑弹窗 + 删除确认」组成：

- 页面用纵向 flex 占满内容区：搜索区固定顶部、表格区 `flex: 1; min-height: 0` 内部滚动、分页固定底部；不要把整页撑高产生内容区滚动条。
- 数据与分页状态放入 Composable（如 `useXxxList`），页面只负责渲染与交互。
- 搜索/筛选变化时重置到第 1 页并重新加载；并发请求遵循取消/去重。
- 表格 `:key` 用稳定唯一标识；大批量数据用虚拟滚动。
- 新建/编辑用同一弹窗组件，按模式切换；提交成功刷新列表并提示。
- 删除/批量操作先确认；进行中禁用按钮防止重复提交。
- 呈现加载、空结果、失败与禁用状态，不只处理成功路径。

## 权限指令

- 元素级权限用项目既有的指令或工具（如 `v-permission="'order:create'"`），无权限时移除或禁用元素。
- 权限标识来自当前用户权限集合（store/接口）；不要在组件内重复请求权限。
- 前端权限仅用于界面体验，**服务端仍必须执行最终授权**。

## 表单模式

- 使用 Element Plus 表单与 `rules`；校验规则与服务端约束保持一致。
- 服务端返回字段错误时映射到对应输入项（`setFields`/`fields`），同时保留可理解的全局错误提示。
- 提交时禁用并显示进行中；成功后按需重置或关闭；失败保留用户输入。
- 时间、金额等用统一的日期/格式化工具（见 [frontend.md](frontend.md)），不在页面各自实现。

## 校验消息 i18n

- `rules` 的提示文案使用 i18n key，随语言切换；新增 key 同步所有已支持语言。
- 后端返回的错误信息若为面向用户的文案，按项目约定决定是否在前端映射为 i18n。

## 可访问性

- 表单控件有 `label` 与可感知的错误提示；交互元素支持键盘操作与焦点。
- 图标按钮提供 `aria-label`；对比度与状态提示符合项目规范。
- 弹窗/抽屉关注焦点陷阱与关闭语义。

## 目录与命名

- 页面按 Page Module 组织：`src/views/<Page>/index.vue`（目录 PascalCase）为入口组件，页面私有组件就近放 `src/views/<Page>/components/`（Colocation）；跨页面复用才提升到 `src/components/`。
- Composable 放 `src/composables/`，API 放 `src/api/`，整体布局放 `src/layouts/`（如 `layouts/Default/`），第三方框架配置与 HTTP 客户端集中放 `src/plugins/`（i18n/router/stores/element-plus/request 等）。
- 整体布局用 flex 自适应窗口：顶栏/侧栏固定、内容区滚动，默认无页脚；登录页独立于布局。
- 文件命名：组件/页面 PascalCase，其余 kebab-case；类名遵循 BEM（见 [frontend.md](frontend.md)）。
