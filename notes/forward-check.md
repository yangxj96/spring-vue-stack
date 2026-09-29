# 手动前向检查

以下为桌面推演：把 Skill 的描述、路由规则和参考指导应用到有代表性的提示词与目标项目事实上。它们不代表 Agent 运行时已被安装或调用。

## 1. 标准栈项目中的 Spring Boot 功能

**请求：**“在这个 Spring Boot 4 项目里新增一个分页查询发票的端点。”

**目标项目事实：** Java 25、Maven、Spring Boot 4.x、MyBatis-Plus；已有 `InvoiceMapper extends BaseMapper<InvoiceEntity>` 且带同名 XML；服务层使用 `IService`/`ServiceImpl`。

**路由：** 任务涉及后端/API 工作，读取 `SKILL.md`、`standard-stack.md`、`references/backend.md` 和 `references/backend-persistence.md`。

**推演决策：** 应用标准栈：新增 `InvoiceService extends IService<InvoiceEntity>` 与 `InvoiceServiceImpl extends ServiceImpl<InvoiceMapper, InvoiceEntity>`，用 MyBatis-Plus `Page` 实现分页，返回 HTTP 200 与 `{code:200,message:"OK",data:<Page>}`，请求/响应字段使用 `snake_case`。不要另造平行的响应结构。对照项目契约检查授权与现有测试。

**结论：** 通过。标准后端栈、统一壳与命名均被应用。

## 2. 不同 Schema 边界下的 PostgreSQL 迁移

**请求：**“给 inventory 表加 `(warehouse_id, external_id)` 唯一约束，并迁移现有数据。”

**目标项目事实：** PostgreSQL；项目显式配置 Liquibase changelog；业务表位于 `inventory` Schema；现有值可能重复。

**路由：** 请求改动数据库契约，读取 `SKILL.md` 和 `references/postgres.md`。

**推演决策：** 标准迁移工具是 Flyway，但仓库显式声明使用 Liquibase——以仓库为准。编写 changelog 前先检查 Liquibase 约定、带 Schema 限定的对象、表规模、重复行、部署兼容性和现有索引。定义重复检测/修复步骤与安全上线方案。

**结论：** 通过。标准默认被项目的显式选择覆盖，并记录了差异。

## 3. token 校验期间 Redis 不可用

**请求：**“校验当前登录 token 时 Redis 超时，服务应如何处理？”

**目标项目事实：** 标准栈在 Redis 存 UUID token 会话；仓库有集中式错误映射。

**路由：** 请求评估安全状态，读取 `SKILL.md`、`references/redis.md` 以及后端安全章节。

**推演决策：** 把会话视为安全事实源。不要把超时解释为“token 有效”或“token 不存在”，也不要静默重试进入业务逻辑。按集中式错误映射返回 fail-closed 结果（标准取 401/500，或按仓库契约）。不要照搬 Spectra 的具体状态码或执行器实现。

**结论：** 通过。Redis 作为安全状态的规则生效；没有一刀切的 fail-open。

## 4. 使用标准 UI 库的 Vue 功能，以及一处显式覆盖

**请求：**“给这个 Vue 3 应用加一个可编辑的客户表格。”

**目标项目事实：** 一个变体使用标准栈（Element Plus、Pinia、两套 `fetch`/`XHR` 客户端）。另一个仓库显式声明使用 Naive UI 和自定义 composable store。

**路由：** 任务改动 Vue 页面和 API 调用，读取 `SKILL.md`、`references/frontend.md` 和 `references/frontend-lint.md`。

**推演决策：**
- 标准项目：用 Element Plus 构建表格，通过共享 `fetch` 客户端加载数据，处理 `{code,message,data}` 统一壳与 `204` 无内容情况，遵守 `script`→`template`→`style` 顺序与 BEM。
- 覆盖项目：使用 Naive UI 和现有 composable store，并记录偏离。不要引入 Element Plus 或 Pinia。

**结论：** 通过。默认应用标准；项目的显式选择获胜并被记录。

## 5. 同时使用该技术栈的仓库中的无关任务

**请求：**“修正一个无关的 Python 数据清理脚本里的拼写。”

**目标项目事实：** 仓库包含受支持的技术栈，但本次改动只涉及一个独立的 Python 工具。

**路由：** Skill 描述说明仅当任务涉及所列后端、前端、数据库、Redis 或跨层领域时才使用。本请求不满足该条件。

**推演决策：** 不加载本 Skill 的技术栈参考，也不把 Java/Vue/PostgreSQL/Redis 约定强加到该 Python 工具上。

**结论：** 通过。仅凭仓库使用该技术栈不会让无关任务触发本 Skill。

## 6. 受支持技术栈之外的项目

**请求：**“给这个 Spring Boot 3 项目加一个由 SQLite 支撑的 React 页面。”

**目标项目事实：** Spring Boot 3、React、SQLite；范围内没有 Vue 3、PostgreSQL 或 Redis。

**路由：** 请求的前端和数据改动不匹配本 Skill 支持的范围/版本。不要把这些参考当作默认。

**推演决策：** 遵循仓库自身的指令和框架。本 Skill 不是迁移指令；若仍有某个窄范围的 Spring 后端细节相关，只有在契合实际项目与版本、并核实了当前文档后才使用。

**结论：** 通过。本包不要求迁移到标准栈。

## 7. 大数 ID 与序列化契约

**请求：**“新增一个订单详情接口，其中外部系统的订单编号是 19 位 bigint。”

**目标项目事实：** 标准栈主键为 UUIDv7 字符串，但该外部字段是 `long`。

**路由：** 涉及序列化契约与前端处理，读取 `standard-stack.md`、`references/backend.md`、`references/frontend.md`。

**推演决策：** 主键按 UUIDv7 字符串处理；对超过 JS 安全整数（2^53-1）的 `Long`/`BigInteger` 字段在 Jackson 配置中序列化为字符串，前端按字符串使用，不当作 `number` 运算，避免精度丢失。

**结论：** 通过。序列化规则与前后端处理一致。

## 8. MyBatis-Plus 分页与自动填充

**请求：**“给用户模块加分页查询，并让创建人/创建时间自动写入。”

**目标项目事实：** 使用 MyBatis-Plus，服务层继承 `IService`/`ServiceImpl`。

**路由：** 涉及持久化实现，读取 `references/backend-persistence.md`。

**推演决策：** 分页用 `PaginationInnerInterceptor` + `Page`，不手写分页 SQL；审计字段由 `MetaObjectHandler` 统一填充，不在 Service 手工 `set`；并发更新用 `OptimisticLockerInnerInterceptor` + `@Version`，删除用 `@TableLogic`，并启用防全表更新/删除拦截器。主键用 UUIDv7，不使用 `IdType.ASSIGN_UUID`（UUIDv4）。

**结论：** 通过。插件与自动填充按标准栈落地，未重复造轮子。

## 9. 用资产脚手架搭一个新模块

**请求：**“在现有项目里新增 order 模块的后端骨架和一张表。”

**目标项目事实：** 标准栈，已装本技能。

**路由：** 涉及整合新模块，读取 `references/scaffolding.md`，必要时看 `assets/`。

**推演决策：** 用 `scripts/scaffold.mjs --backend --target <模块目录>` 复制模板，再用 `--migration --name create_biz_order` 生成 UTC 时间戳迁移；复制后把占位包名 `com.example.app`、表名 `biz_order`、字段与注释改为实际值，并复核 `R<T>`、UUIDv7、`@TableField`、表列 `COMMENT`。不原样提交占位模板。

**结论：** 通过。资产是起点，落地前按标准改占位并复核契约。
