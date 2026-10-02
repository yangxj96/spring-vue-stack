# AGENTS.md

## 项目概览

<!-- IF_BACKEND -->
- 后端：`__BACKEND_DIR__`（Spring Boot 4 · Java 25 · Maven · MyBatis-Plus · Flyway · PostgreSQL · Redis）。
<!-- /IF_BACKEND -->
<!-- IF_FRONTEND -->
- 前端：`__FRONTEND_NAME__`（Vue 3 · TypeScript · Vite · Pinia · Element Plus · SCSS · vue-i18n）。
<!-- /IF_FRONTEND -->
- 遵循 `spring-vue-stack` 技能的标准栈；仓库若有显式不同方案，以本文件为准并说明差异。

## 常用命令

<!-- IF_BACKEND -->
- 后端构建/测试：`cd __BACKEND_DIR__ && ./mvnw verify`
- 后端运行：`cd __BACKEND_DIR__ && ./mvnw spring-boot:run`
- 数据库迁移：置于 `__BACKEND_DIR__/src/main/resources/db/migration`（Flyway 时间戳式命名）。
<!-- /IF_BACKEND -->
<!-- IF_FRONTEND -->
- 前端安装/开发/构建/测试：`cd __FRONTEND_NAME__ && pnpm install` / `pnpm dev` / `pnpm build` / `pnpm test`
<!-- /IF_FRONTEND -->

## 约定

- API：`snake_case`、统一壳 `{code,message,data}`、`code` 随 HTTP 状态、主键 UUIDv7。
- 注释：中文，L1/L2 必须，实现类不重复接口 Javadoc，数据库表与所有列必须 `COMMENT`。
<!-- IF_FRONTEND -->
- 前端目录：页面按 Page Module 组织（`src/views/<Page>/index.vue` + 页面私有组件就近放 `components/`）；整体布局放 `src/layouts/`；跨页共享组件放 `src/components/`；第三方框架配置与 HTTP 客户端放 `src/plugins/`（i18n/router/stores/element-plus/request）。
<!-- /IF_FRONTEND -->
- 提交规范与分支策略：<按团队填写>。
