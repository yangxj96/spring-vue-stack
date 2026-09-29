---
name: spring-vue-stack
description: Use when changing Spring Boot 4.x backend code, Vue 3.x frontend, PostgreSQL schema, Redis state/cache, or their API/data contracts in a project using these technologies. Encodes a canonical Java 25/Maven/MyBatis-Plus/Flyway/PostgreSQL/Redis and Vue 3/TypeScript/Vite/Pinia/Element Plus/SCSS stack with snake_case APIs, UUIDv7 primary keys, and a {code,message,data} response envelope.
---

# Spring + Vue 技术栈开发指南

为 Spring Boot 4.x、Vue 3.x、PostgreSQL 和 Redis 项目提供按任务加载的开发指导。本 Skill 采用**强约定**：默认按下述标准栈执行，只有目标仓库显式声明使用其它方案时才偏离。

## 标准栈

- **后端**：Java 25 · Maven · Spring Boot 4.x · MyBatis-Plus（UUIDv7 主键）· Flyway · PostgreSQL · Redis · Spring Security + Redis 存 UUID token（新项目可选 Sa-Token，二选一）· Lombok + MapStruct · springdoc-openapi · Jackson 3。
- **前端**：Vue 3 + TypeScript · Vite · Pinia · Vue Router · Element Plus（完整引入）· SCSS + 严格 BEM · vue-i18n · pnpm · `fetch` 普通请求封装 + 原生 `XHR` 上传封装 · ESLint + Prettier + Stylelint · Vitest + Vue Test Utils · Playwright。
- **契约**：JSON/查询参数 `snake_case`；统一壳 `{code,message,data}`，`code` 恒等于 HTTP 状态；分页用 MyBatis-Plus `Page`；主键 UUIDv7，长整型按需字符串化。

完整清单、状态码表和二选一规则见 [standard-stack.md](references/standard-stack.md)。

## 开始工作前

1. 查看目标仓库的 Agent 指令、依赖版本、构建脚本、目录结构，以及相邻功能的现有实现。
2. 确认仓库是否显式声明了与本标准栈不同的方案。**没有显式声明时按标准栈执行**；有声明时以仓库为准，并在变更说明中写明差异及影响。
3. 按当前任务读取相关 reference。跨层任务可读取多个 reference；不要为局部任务加载无关内容。
4. 版本敏感的 API、配置和兼容性问题，核对目标项目实际依赖版本及可用的权威文档。不要仅凭本 Skill 推断 Spring Boot 4.x 或生态库的具体行为。
5. 项目事实缺失且会改变方案时，先说明差异并询问；不要把标准栈里的可选项（如 Sa-Token）当成所有项目都必须采用。

## 按需读取

按任务精确选取，**能读一份就不读两份**；跨层任务才多读并协调契约。

- 标准栈、版本、二选一规则、统一壳与状态码：读取 [standard-stack.md](references/standard-stack.md)。
- Spring Boot 核心规范、分层、DI、API/校验/异常、序列化、时间、配置、集合并发、测试：读取 [backend.md](references/backend.md)。
- 事务、Mapper/SQL、MyBatis-Plus 插件与数据访问并发：读取 [backend-persistence.md](references/backend-persistence.md)。
- 认证/授权/会话、安全边界、文件上传下载、可观测性、后台任务与线程模型：读取 [backend-security-ops.md](references/backend-security-ops.md)。
- Vue 页面、组件、Composable、路由、状态或 API 调用：读取 [frontend.md](references/frontend.md)。
- PostgreSQL 表结构、SQL、索引、约束或数据迁移：读取 [postgres.md](references/postgres.md)。
- Redis 缓存、安全状态、并发或故障语义（仅涉及 Redis 时）：读取 [redis.md](references/redis.md)。
- API、Schema、配置文档同步或交付检查：读取 [docs-and-delivery.md](references/docs-and-delivery.md)。

**冷文件（仅在任务匹配时读取，不要预读）**：

- 契约先行的端到端示例（仅在搭新功能/看整体结构时）：[examples.md](references/examples.md)。
- 常见坑索引（仅在排障或交付前自查时）：[pitfalls.md](references/pitfalls.md)。
- 注释、Javadoc、TSDoc、建表注释（仅在新增/修改注释时）：[comments.md](references/comments.md)。
- ESLint/Prettier/Stylelint 标准配置（仅在调整 lint/格式时）：[frontend-lint.md](references/frontend-lint.md)。

若变更跨越多个领域，只加载实际影响的参考，并协调各层的契约。
