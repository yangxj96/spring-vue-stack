---
name: spring-vue-stack
description: Use when changing Spring Boot 4.x backend code, Vue 3.x frontend, PostgreSQL schema, Redis state/cache, or their API/data contracts in a project using these technologies.
---

# Spring + Vue 技术栈开发指南

为 Spring Boot 4.x、Vue 3.x、PostgreSQL 和 Redis 项目提供按任务加载的通用开发指导。它不规定项目必须采用某种分层、ORM、API 格式、状态管理库或构建工具。

## 开始工作前

1. 查看目标仓库的 Agent 指令、依赖版本、构建脚本、目录结构，以及相邻功能的现有实现。
2. 以仓库自己的架构和约定为准；下方参考提供建议，不能覆盖项目明确规则。
3. 按当前任务读取相关 reference。跨层任务可读取多个 reference；不要为局部任务加载无关内容。
4. 版本敏感的 API、配置和兼容性问题，核对目标项目实际依赖版本及可用的权威文档。不要仅凭本 Skill 推断 Spring Boot 4.x 或生态库的具体行为。
5. 当项目事实缺失且会改变方案时，先说明差异并询问；不要把示例或 Spectra 来源约定写成目标项目要求。

## 按需读取

- Spring Boot、Java 服务端、API、事务、验证或安全边界：读取 [backend.md](references/backend.md)。
- Vue 页面、组件、Composable、路由、状态或 API 调用：读取 [frontend.md](references/frontend.md)。
- PostgreSQL 表结构、SQL、索引、约束或数据迁移：读取 [postgres.md](references/postgres.md)。
- Redis 缓存、安全状态、并发或故障语义：读取 [redis.md](references/redis.md)。
- API、Schema、配置文档同步或交付检查：读取 [docs-and-delivery.md](references/docs-and-delivery.md)。

若变更跨越多个领域，只加载实际影响的参考，并协调各层的契约。
