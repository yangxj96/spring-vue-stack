# __REPO_TITLE__

由 `spring-vue-stack` 技能初始化。

<!-- IF_BACKEND -->
- 后端：`__BACKEND_DIR__`（Spring Boot 4 · Java 25 · Maven · MyBatis-Plus · PostgreSQL · Redis · Flyway）
<!-- /IF_BACKEND -->
<!-- IF_FRONTEND -->
- 前端：`__FRONTEND_NAME__`（Vue 3 · TypeScript · Vite · Pinia · Element Plus · SCSS）
<!-- /IF_FRONTEND -->

## 开发

```bash
<!-- IF_BACKEND -->
# 后端（Windows 用 mvnw.cmd）
cd __BACKEND_DIR__ && ./mvnw spring-boot:run

<!-- /IF_BACKEND -->
<!-- IF_FRONTEND -->
# 前端
cd __FRONTEND_NAME__ && pnpm install && pnpm dev
<!-- /IF_FRONTEND -->
```

## 环境

使用 mise 管理工具链，已固定在 `.mise.toml`（java/maven/node/pnpm）。

## Agent

使用 `spring-vue-stack` 技能（已安装到 `.opencode/skills/`）；仓库指令见 [`AGENTS.md`](AGENTS.md)。
