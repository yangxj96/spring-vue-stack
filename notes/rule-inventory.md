# 候选规则清单

来源材料：Spectra 工作区文档。分类取值含义：**通用** 表示可广泛复用；**条件性** 表示仅当目标项目存在匹配的需求或选择时适用；**标准** 表示经评审后采纳为本 Skill 的标准默认值；**Spectra 专有** 除作为明确标注的示例外，不进入可移植 Skill。

| 分类 | 候选项 | 来源 | 理由 / 处理方式 |
|---|---|---|---|
| 通用 | 变更前先查看仓库指令、依赖版本和现有代码模式。 | `spectra-admin/AGENTS.md`; `spectra-ui/AGENTS.md`; `docs/开发指南/01-常见命令.md` | 探测行为可复用；省略 Spectra 的路径与命令。 |
| 条件性 | Controller/端点专注于传输层，把应用行为委托给合适的 service/用例层。 | `docs/后端/30-规范/01-后端开发规范.md` | 适用于采用分层应用架构的项目；不规定具体包名。 |
| 条件性 | 在边界校验不可信输入，返回与项目契约一致、明确且有类型的 API 结果。 | `docs/后端/30-规范/01-后端开发规范.md`; `docs/前端/01-前端管理后台.md` | 通过项目的框架和 API 约定落地。 |
| 条件性 | 对封闭的内部值域使用枚举或其它集中表示；在适配边界保留开放的外部厂商码。 | `docs/后端/30-规范/01-后端开发规范.md` | 取决于值域是否封闭且由应用自身拥有。 |
| 条件性 | 把共享逻辑放在其依赖和领域含义所属的层；避免重复策略和过大的通用工具类。 | `docs/后端/30-规范/01-后端开发规范.md` | 通用设计信号，但抽取边界取决于项目架构。 |
| 通用 | 在 API 和组件边界保持显式 TypeScript 类型；不要用 `any` 绕过类型错误。 | `docs/前端/01-前端管理后台.md` | 可移植的质量指导；实际编译器/linter 约束因项目而异。 |
| 标准 | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus + SCSS/BEM + vue-i18n + pnpm；SFC 顺序 `script`→`template`→`style`；组件 PascalCase、其它文件 kebab-case。 | `docs/前端/01-前端管理后台.md`; `docs/前端/02-前端命名规范.md`; `docs/前端/05-前端请求与安全通信.md` | 采纳为标准前端栈与风格；项目可显式覆盖。 |
| 条件性 | 显式建模组件 props 和事件，保持组件职责单一，跨视图复用的行为放入 composable。 | `docs/前端/01-前端管理后台.md` | 对 Vue 3 友好的建议；语法细节取决于 Vue 次版本与 lint 规则。 |
| 标准 | 业务 API 调用统一走共享请求层；把普通 `fetch` 客户端与原生 `XHR` 上传客户端分开；认证、重试、缓存、取消和二进制传输按契约敏感行为处理。 | `docs/前端/05-前端请求与安全通信.md` | 采纳双客户端拆分与共享层规则；Spectra 的加密/CSRF 管线仍为项目专有。 |
| 标准 | Schema 变更显式且可评审；使用 Flyway 版本化迁移、约束和索引维护数据完整性。 | `docs/后端/30-规范/03-数据库命名规范.md`; `docs/开发指南/01-常见命令.md` | 采纳 Flyway 为标准；命名方案仍因项目而异。 |
| 条件性 | 表、列、约束、索引优先使用稳定、无歧义的名称；在应用有领域边界时让命名对齐。 | `docs/后端/30-规范/03-数据库命名规范.md` | 前缀规则和物理列顺序因项目而异。 |
| 通用 | 为缓存项设置有意为之的 TTL，并让失效行为与写路径和一致性需求匹配。 | `docs/后端/30-规范/04-Redis使用规范.md` | 对缓存普遍有用；不设统一 TTL 数值。 |
| 标准 | 区分可丢失缓存与安全/工作流状态；在 Redis 存 UUID token 会话；根据安全契约选择 fail-open/fail-closed 并记录故障行为。 | `docs/后端/30-规范/04-Redis使用规范.md` | 采纳 UUID token 会话存储与 fail-closed 区分；Spectra 的具体 key 语法、序列化器和执行器仍为项目专有。 |
| 条件性 | 根据所有权、基数、敏感度和故障模型选择 key 命名空间、序列化、并发控制与缓存一致性。 | `docs/后端/30-规范/04-Redis使用规范.md` | 避免统一的 cacheNames 语法、序列化器或同步设置。 |
| 通用 | 当变更影响已发布的 API、Schema、配置或开发者/用户文档契约时，同步更新。 | `AGENTS.md`; `docs/开发指南/01-常见命令.md` | 变更影响推理可复用；受影响文件与脚本因项目而异。 |
| 条件性 | 开发时运行聚焦检查，交付前运行更广的项目质量门禁，命令从仓库脚本和指令中发现。 | `spectra-admin/AGENTS.md`; `spectra-ui/AGENTS.md`; `docs/开发指南/01-常见命令.md` | 工具名与命令保持项目本地化。 |
| 标准 | Java 25、Maven、Spring Boot 4.x。 | `docs/后端/30-规范/01-后端开发规范.md`; `spectra-admin/AGENTS.md` | 采纳为标准后端版本；Spotless/Checkstyle/PMD/SpotBugs 及项目模块命令仍为项目本地。 |
| 标准 | MyBatis-Plus、BaseMapper + 每 Mapper 一个 XML、IService/ServiceImpl、MapStruct、`From`/`VO` 包结构。 | `docs/后端/30-规范/01-后端开发规范.md` | 采纳为标准后端分层/ORM；具体模块树仍按项目调整。 |
| Spectra 专有 | 响应/版本契约 `1.0.0`、UUID v7 实体实现、精确的 Controller 注解。 | `docs/后端/30-规范/01-后端开发规范.md` | 仅在确有必要时作为出处/示例保留；不作为规定。 |
| Spectra 专有 | 大写领域表前缀、`SYS_`/`SEC_` 归属规则、固定审计字段/列顺序、`spectra_security` schema、特定 Flyway V1 基线内容、Spectra region 导入。 | `docs/后端/30-规范/03-数据库命名规范.md` | 前缀/schema/审计契约不可移植；Flyway 本身是标准。 |
| Spectra 专有 | `sec:*` key 族、`SecurityRedisExecutor`、精确的 HTTP 503 语义、cacheNames 语法、TTL 区间、MD5 key 生成器、Jackson 序列化器、Spectra 的 fail-closed 策略。 | `docs/后端/30-规范/04-Redis使用规范.md` | 仅泛化“可丢失缓存与安全状态的区分”；不迁移实现细节。 |
| 标准 | Element Plus、Pinia、Vue Router、Vite、pnpm、`kebab-case` 文件规则、`script`→`template`→`style` 块顺序。 | `docs/前端/01-前端管理后台.md`; `docs/前端/02-前端命名规范.md` | 采纳为标准前端栈与风格（见上方标准行）。 |
| Spectra 专有 | Node 版本固定、`src/plugin/request`、加密/CSRF/token 刷新管线、路由、权限模型、上传服务细节。 | `docs/前端/05-前端请求与安全通信.md` | 应用功能与安全管线因项目而异；仅作示例保留。 |
| Spectra 专有 | `scripts/check-docs.sh`、Spectra 的 AGENTS 路径、子项目布局、精确的 Maven/pnpm 命令、质量门禁顺序。 | `AGENTS.md`; `docs/前端/08-前端开发测试与构建.md`; `docs/开发指南/01-常见命令.md` | 发现目标项目的等价检查，而非复用命令。 |
| 标准 | Jackson 序列化契约：`snake_case`、Long/BigInteger 按需字符串化、ISO-8601 时间、`null` 与集合、枚举字符串、BigDecimal。 | 评审新增 | 采纳为跨端数据契约。 |
| 标准 | 时间语义区分绝对时刻（`Instant`/`OffsetDateTime` + `timestamptz`）与本地语义（`LocalDate`/`LocalTime` + `date`/`time`）；响应带偏移或 UTC，禁止无偏移本地时间；不在转换/序列化中读安全上下文做时区换算。 | 评审新增 | 采纳为时间标准（反模式 + 取舍）。 |
| 标准 | Spring Boot 4 默认 Jackson 3（`tools.jackson`，`JsonMapper`/`JsonMapperBuilderCustomizer`）。 | 评审新增 | 采纳为序列化实现标准。 |
| 标准 | 常见坑处理：CSRF 姿态、安全响应头、`@Transactional` 回滚、返回实体双向引用、`@Async`、连接池、日志注入、SSRF/重定向、虚拟线程；前端 `v-for` key/不改 props/`:deep()`/并发 401 刷新；软删除部分唯一索引、外键 `ON DELETE`。 | 评审新增 | 汇总于 `pitfalls.md`，作为交付前检查。 |
| 标准 | MyBatis-Plus 持久化：实体字段显式 `@TableField(value)`/`@TableId`、`PaginationInnerInterceptor`、`OptimisticLockerInnerInterceptor`、`@TableLogic`、`@Version`、`MetaObjectHandler`、`BlockAttackInnerInterceptor`。 | 评审新增 | 采纳为持久化标准。 |
| 标准 | 主键 UUIDv7（PostgreSQL 18 `uuidv7()`；不用 UUIDv4 / `ASSIGN_UUID`）。 | 评审新增 | 采纳为主键标准。 |
| 标准 | Flyway 时间戳式命名 `V{yyyyMMddHHmmss}__{描述}.sql`，已执行迁移不改。 | 评审新增 | 采纳为迁移命名标准。 |
| 标准 | 密码存储 `PasswordEncoder`（BCrypt/Delegating）与刷新令牌轮换。 | 评审新增 | 采纳为安全标准。 |
| 标准 | 可观测性：traceId/MDC 透传、Actuator 健康/就绪探针。 | 评审新增 | 采纳为运维标准。 |
| 标准 | API 文档 springdoc-openapi（展示 `snake_case` schema 与 Bearer 方案）。 | 评审新增 | 采纳为文档标准。 |
| 标准 | 前端 dayjs、前后端类型契约同步、严格 BEM、开发期 mock 不进生产。 | 评审新增 | 采纳为前端标准；代码生成、MSW、Sentry、WebSocket 按需采用。 |

## 规则 → 唯一所属文件（防偏移索引）

每条规范只在一个权威文件详述，其余文件仅作要点或链接。重构或新增规则后按此表校验，避免规则丢失或漂移。

| 规则域 | 权威文件 |
|---|---|
| 标准栈、版本、二选一、统一壳、状态码、分页、UUIDv7、Jackson 3、时间语义 | `references/standard-stack.md` |
| 注释与 Javadoc 标准（L1–L5、impl 不重复） | `references/comments.md` |
| 后端核心：分层、Java 规范、Lombok/MapStruct、DI、API/校验/异常、序列化、时间/日志/审计、配置、集合并发、测试 | `references/backend.md` |
| 后端数据访问：事务、Mapper/SQL、MyBatis-Plus 插件与实体注解 | `references/backend-persistence.md` |
| 后端安全与运行：认证/授权/会话、安全边界、文件传输、可观测性、线程与资源、后台任务 | `references/backend-security-ops.md` |
| 前端：TS、命名、SFC、Composable、Pinia、路由权限、请求层、认证、表单、样式/BEM、i18n、构建、交互、性能、依赖、测试 | `references/frontend.md` |
| ESLint / Prettier / Stylelint 配置 | `references/frontend-lint.md` |
| PostgreSQL：建模、约束、时间选型、索引命名、Flyway 迁移 | `references/postgres.md` |
| Redis：缓存/会话/安全状态/并发与故障 | `references/redis.md` |
| 交付核对与 Definition of Done | `references/docs-and-delivery.md` |
| 常见坑索引 | `references/pitfalls.md` |
| 端到端示例 | `references/examples.md` |
