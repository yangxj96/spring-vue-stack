# Spring Boot 持久化参考

用于事务、Mapper/SQL、MyBatis-Plus 与数据访问并发相关任务。核心规范、API、序列化与测试见 [backend.md](backend.md)；认证、安全与运行见 [backend-security-ops.md](backend-security-ops.md)；数据库建模与迁移见 [postgres.md](postgres.md)。

## 事务与业务一致性

- 事务边界应覆盖一个完整且可说明的数据库业务操作，通常放在 Service 实现的业务方法边界；按项目既有约定使用事务管理器和注解。
- Spring 声明式事务通常通过代理拦截调用。检查代理模式及调用路径：同一对象内部的自调用可能绕过代理，使事务设置不生效。不要因方法带有 `@Transactional` 就默认事务已按预期生效。
- 明确异常类型、回滚规则、传播行为和隔离级别是否符合业务一致性要求；特别检查捕获异常后继续返回成功、检查后再更新的并发竞态，以及多数据源下选用的事务管理器。
- 默认只对运行时异常回滚，检查异常不回滚：需要时显式 `rollbackFor = Exception.class`；查询方法标 `@Transactional(readOnly = true)` 且不写库，注意 `readOnly` 只是优化提示、并不阻断写操作。见 [pitfalls.md](pitfalls.md)。
- 尽量不要在数据库事务中执行慢速网络请求、等待用户操作或无界任务。若业务要求数据库变更与外部副作用协调，评估项目已有的 outbox、幂等、补偿或状态机方案；不凭空引入分布式事务。
- 重试只用于可安全重复的操作，并明确幂等键、唯一约束或去重边界；不要重试已产生不可逆副作用的调用而不检查状态。

## Mapper、SQL 与并发访问

- Mapper 只承担数据读写；复杂业务决策和跨资源编排放在 Service。SQL 参数使用绑定变量，动态列名、表名和排序方向通过显式允许列表构造。
- 对每个查询检查过滤条件、返回字段、结果上限、分页稳定性、索引可用性及调用频率。避免无界读取和循环内逐条查询导致的 N+1。
- XML 文件应能被项目配置加载，`namespace`、方法签名、参数名、结果映射和动态 SQL 分支相互一致。重命名 Java 方法或 Mapper 包名时同步检查 XML。
- 对并发修改检查唯一约束、乐观锁/版本字段、行锁或条件更新等项目既有策略；不能仅靠“先查询再写入”保证唯一性或库存等不变量。
- PostgreSQL 的字段类型、Schema、索引与迁移规则见 [postgres.md](postgres.md)；ORM 专有行为以项目使用的库及版本为准。

## MyBatis-Plus 插件与持久化增强

- **主键**：实体主键使用 UUIDv7。优先数据库默认 `uuidv7()`（PostgreSQL 18），应用侧生成时也用同一版本；不要把 MyBatis-Plus 的 `IdType.ASSIGN_UUID`（UUIDv4）当成 UUIDv7。DB 生成用 `@TableId(type = IdType.INPUT)`；应用生成用 `IdType.ASSIGN_ID` 并注册自定义 `IdentifierGenerator`。
- **实体字段注解**：实体**每个字段都显式标注列名**，不依赖字段名与列名的隐式映射：普通字段用 `@TableField(value = "列名")`；主键用 `@TableId(value = "id", type = ...)`（与 `@TableField` 不重复标注）；特殊字段追加对应注解——逻辑删除 `@TableLogic(value = "false", delval = "true")`（按布尔列取值）、乐观锁 `@Version`、自动填充 `@TableField(value = "列名", fill = FieldFill.INSERT/INSERT_UPDATE)`。所有列名用数据库实际的 snake_case 名称。
- **分页**：通过 `MybatisPlusInterceptor` + `PaginationInnerInterceptor` 配置分页，统一使用 `Page`；不要在各处 SQL 手写分页。
- **乐观锁**：使用 `OptimisticLockerInnerInterceptor` 配合 `@Version` 字段；更新必须带版本条件，不能只靠“先查再写”。
- **逻辑删除**：使用全局逻辑删除配置（`@TableLogic` 或配置项），查询自动过滤已删除数据；需要物理删除时显式处理，不散落 `deleted` 条件。
- **自动填充**：用 `MetaObjectHandler` 统一填充创建/更新人与时间；禁止在 Controller/Service 手工设置这些审计字段。
- **枚举映射**：数据库用 varchar 存枚举名或约定码；实体枚举字段显式配置映射（`@EnumValue`/`IEnum` 或全局 enum type handler），确保写入名称/码而非 ordinal，并用集成测试覆盖读写。
- **防误操作**：启用 `BlockAttackInnerInterceptor`（或项目等价措施）阻止无 where 的全表更新/删除。
- 插件的注册顺序与条件以项目配置为准；新增插件前确认不会与已有插件或租户/数据权限插件冲突。
