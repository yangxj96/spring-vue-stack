# AGENTS.md（目标仓库模板）

> 将本文件放到目标仓库根目录，按实际项目替换占位内容。它是 Agent 使用本技能前最先读取的仓库指令。

## 项目概览

- 技术栈：Spring Boot 4.x + Java 25 + Maven + MyBatis-Plus + Flyway + PostgreSQL + Redis；Vue 3 + TypeScript + Vite + Pinia + Element Plus + SCSS + pnpm。
- 模块结构：<填写，例如 spectra-admin / spectra-ui>。

## 常用命令

- 后端构建与测试：`<填写，如 ./mvnw verify>`
- 前端安装/开发/测试/构建：`<填写，如 pnpm install / pnpm dev / pnpm test / pnpm build>`
- 数据库迁移：`<填写>`

## 约定

- 遵循 `spring-vue-stack` 技能的标准栈；仓库若有显式不同方案，以本文件为准并说明差异。
- API 契约：`snake_case`、统一壳 `{code,message,data}`、状态码随 HTTP、主键 UUIDv7。
- 注释：中文，L1/L2 必须，实现类不重复接口 Javadoc，表与所有列必须 `COMMENT`。
- 提交规范与分支策略：<填写>。
