# 测试深化

用于后端与前端测试的分层、工具与数据要求。基础测试规则见 [backend.md](backend.md)、[backend-persistence.md](backend-persistence.md)；前端测试见 [frontend.md](frontend.md)。

## 后端

- **单元测试**：聚焦 Service 业务分支、边界条件与异常语义；Mock 只替代测试边界上的外部依赖，不 Mock 被测对象内部每个调用。
- **Controller 测试**：用 `MockMvc`（或 `WebTestClient`）验证路由、参数绑定（含 `snake_case` → 小驼峰适配）、校验与响应契约（统一壳、状态码、`204`）。
- **数据访问集成测试**：用 **Testcontainers 启动 PostgreSQL**，验证 SQL、结果映射、事务、逻辑删除、乐观锁与 Flyway 迁移的真实行为；不要用 H2 近似替代 PostgreSQL 特性（`timestamptz`、`jsonb`、`uuidv7()`、部分索引）。
- **迁移校验**：集成测试启动时执行 Flyway，确认脚本可重放、命名不冲突、表列 `COMMENT` 存在。
- **Mapper XML**：确认 XML 参与资源打包并被加载；语句 ID、`namespace`、参数与返回映射一致（单纯 Java 编译发现不了）。
- **架构约束**：可用 ArchUnit 固化分层与依赖方向（Controller 不依赖 Mapper、功能包内聚、无循环依赖）。
- **测试数据**：隔离、可重复创建与清理；不依赖生产凭据或本机绝对路径；每个测试只验证明确行为。

## 前端

- **组件测试**：Vitest + Vue Test Utils，聚焦行为而非实现细节；store/router 按项目既有 mock 模式。
- **接口 Mock**：开发与测试用 MSW 等；mock 仅用于开发/测试，不进入生产构建。
- **E2E**：Playwright 覆盖关键用户路径（登录、CRUD、权限拒绝、错误提示）。
- **类型与 lint**：类型检查（`vue-tsc`）与 lint 作为门禁的一部分。

## 门禁

- 命令以项目 `package.json` / Maven 脚本为准（标准栈为 Maven / pnpm），不虚构命令。
- 先跑目标测试与类型检查；交付前跑完整门禁（lint、type-check、test、build），见 [docs-and-delivery.md](docs-and-delivery.md) 的 Definition of Done。
