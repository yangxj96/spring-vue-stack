# 标准技术栈与统一约定

本 Skill 采用**强约定**：下面是默认标准栈和统一契约。生成或修改代码时默认按此执行，只有目标仓库**显式声明**使用其它方案时才偏离，并说明差异与影响。不要因为某个示例来自历史项目就照搬其专有实现。

## 标准技术栈

### 后端

| 维度 | 标准选择 |
|---|---|
| JDK | Java 25 |
| 构建 | Maven |
| 框架 | Spring Boot 4.x |
| JSON | Jackson 3（Spring Boot 4 默认，包名 `tools.jackson`） |
| 数据访问 | MyBatis-Plus |
| 数据库迁移 | Flyway |
| 数据库 | PostgreSQL |
| 主键 | UUIDv7（PostgreSQL 18 `uuidv7()` 或应用侧生成；不要用 UUIDv4） |
| 缓存/状态 | Redis |
| 安全 | Spring Security + Redis 存 UUID token；新项目可选 Sa-Token（二选一） |
| 对象工具 | Lombok、MapStruct（标准启用，项目可显式关闭） |

### 前端

| 维度 | 标准选择 |
|---|---|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| 状态 | Pinia |
| 路由 | Vue Router |
| 目录组织 | Page Module（`views/<Page>/index.vue` + 就近 `components/`）；布局 `src/layouts/`；共享组件 `src/components/`；第三方配置与 HTTP 客户端 `src/plugins/` |
| UI | Element Plus（完整引入，注册封装在 `src/plugins`） |
| 样式 | SCSS + 严格 BEM |
| 国际化 | vue-i18n |
| 包管理 | pnpm |
| 请求 | 统一出口 `request`：`fetch` 普通请求 + `XHR` 上传（`src/plugins/request`，共用 `shared.ts`） |
| 代码质量 | ESLint + Prettier + Stylelint（详见 [frontend-lint.md](frontend-lint.md)） |
| 测试 | Vitest + Vue Test Utils；E2E 用 Playwright |

### 安全方案二选一

- **默认：Spring Security + Redis 存 UUID token**。token 为 UUID，服务端在 Redis 保存会话状态，请求头 `Authorization: Bearer <uuid>`。
- **新项目可选：Sa-Token**。当项目尚无既有安全栈、且团队接受 Sa-Token 的权限模型时采用，作为 Spring Security 的替代。
- **二者不混用**。已使用 Spring Security 的项目继续沿用；已使用 Sa-Token 的项目继续沿用。接管不熟悉的存量项目时先确认其安全栈再改。

## 统一 API 契约

### 字段命名

- JSON 请求体、JSON 响应体以及 GET 查询参数名统一使用 `snake_case`。
- Java 字段、方法参数和内部属性继续使用小驼峰：JSON/query 的 `user_name` 对应 Java 属性 `userName`。
- 通过项目统一的 JSON 序列化配置完成映射，不在每个 DTO/VO 上重复配置；不因此改动数据库列名。
- GET 查询参数通过统一的 Spring MVC 参数绑定适配把 snake_case 映射到小驼峰，覆盖 `@RequestParam` 与 `@ModelAttribute` 两种方式，并处理同名多值参数与名称冲突。

### 统一响应壳

所有带 body 的响应固定为：

```json
{ "code": 200, "message": "OK", "data": null }
```

- `code` 恒等于本次 HTTP 状态码。
- 错误一定有 body；成功可以无 body（仅 `204`）。
- 不设置额外业务子码；业务规则的失败映射到最贴切的标准 HTTP 状态。
- Java 侧统一壳类型命名为 `R<T>`（字段 `code`/`message`/`data`），提供 `ok`/`created`/`error` 等静态方法。

### 状态码约定

| 场景 | HTTP | 响应体 |
|---|---|---|
| 查询 / 更新成功 | `200` | `{code:200,message:"OK",data:...}` |
| 新建成功 | `201` | `{code:201,message:"Created",data:...}`（可带 `Location`） |
| 删除 / 无返回操作成功 | `204` | 空 body |
| 参数 / 语义校验失败 | `400` | `{code:400,message,data:null}` |
| 未认证（无 / 过期 token） | `401` | `{code:401,message,data:null}` |
| 无权限 | `403` | `{code:403,message,data:null}` |
| 资源不存在 | `404` | `{code:404,message,data:null}` |
| 状态冲突 / 重复提交 | `409` | `{code:409,message,data:null}` |
| 服务端异常 | `500` | `{code:500,message,data:null}` |

- 业务规则的失败映射到最贴切的标准状态：输入问题 `400`、状态冲突 `409`、权限 `403`、不存在 `404`。
- 不要用自造业务码替代 HTTP 状态；不要用 `200` 包装所有失败。
- 前端 fetch/XHR 封装：`204` 直接返回 `null`；否则解析壳；`!response.ok` 抛 `ApiError{code,message,data}`；成功取 `data`。

### 分页

- 分页响应固定为 `200` + `data` 为 MyBatis-Plus 的 `Page` 对象（`records`、`total`、`size`、`current`、`pages` 等），按全局 snake_case 序列化规则输出。
- 列表接口采用有界分页或明确结果上限；页码、页大小、筛选范围受限；排序字段与方向由服务端允许列表控制，并保证稳定次序。

### 序列化与数据契约

统一通过全局 Jackson 3（Spring Boot 4 默认，包名 `tools.jackson`，核心类型 `JsonMapper`、定制器 `JsonMapperBuilderCustomizer`）配置完成，不在单个 DTO/VO 上重复配置：

- **字段命名**：`snake_case`（见上）。
- **主键 / ID**：主键为 UUIDv7 字符串；任何 `Long`/`BigInteger` 超过 JS 安全整数（2^53-1）时必须序列化为字符串，前端按字符串处理。
- **时间**：见下「时间语义与取舍」；绝对时刻输出带偏移或 UTC，本地语义用本地类型。
- **null**：按需决定是否输出 `null` 字段（默认输出以保持契约稳定）；集合默认返回空数组而非 `null`。
- **枚举**：对外输出稳定的字符串（枚举名或约定码），不输出 ordinal；新增取值前评估前端与旧客户端的兼容性。
- **BigDecimal**：金额等精确值按约定格式输出，避免二进制浮点精度问题。
- **GET 参数**：查询参数同样使用 `snake_case`，按统一绑定适配映射到 Java 小驼峰。

### 时间语义与取舍

**区分两类时间**

- **绝对时刻**（创建/更新/发生时间等）：Java 用 `Instant`/`OffsetDateTime`，数据库用 `timestamptz`，时钟用 UTC。
- **本地语义**（生日、纪念日、每日提醒时刻）：用 `LocalDate`/`LocalTime`（数据库 `date`/`time`），端到端不经 `Instant`/时区换算。

**响应格式**

- 绝对时刻按 ISO-8601 输出：默认 UTC `Z`（如 `2024-01-15T03:30:00Z`），由前端用 dayjs/`Intl` 本地化；若产品要求服务端按用户时区展示，返回用户时区的 `OffsetDateTime`（`2024-01-15T11:30:00+08:00`）或另附 `time_zone` 字段——两者**都必须带偏移**，保证绝对时刻可还原。
- 本地语义字段按 `LocalDate`/`LocalTime` 原样输出，不做时区换算。
- 持久化与跨系统交换不依赖服务器默认时区。

**反模式（禁止）**

- 不要按“当前用户时区”把 `Instant` 转成**无偏移**的 `LocalDateTime`/`LocalTime` 再返回：它丢失偏移、使同一资源对不同用户返回不同字面值（破坏缓存、审计、导出、下游），跨时区读本地语义字段还会差一天。
- 不要把本质本地语义的值（如生日）存成瞬时再按请求者时区转换。

## 注释

- 后端、前端、数据库统一使用**中文注释**，标识符保持英文。
- 深度分级 **L1–L5**：类型/模块级（L1）与公开契约级（L2）必须；关键实现（L3）、字段/常量/枚举（L4）按需；显而易见的代码（L5）禁止注释。
- 实现类与覆写方法**不重复**接口/父类的 Javadoc，接口注释即唯一契约来源。
- 数据库每张表与每一列都必须 `COMMENT`。
- 完整标准见 [comments.md](comments.md)。

## 与本 Skill 其它参考的关系

- API 层的落地细节见 [backend.md](backend.md) 与 [frontend.md](frontend.md)；数据访问见 [backend-persistence.md](backend-persistence.md)，安全与运行见 [backend-security-ops.md](backend-security-ops.md)。
- 契约先行的完整纵向示例见 [examples.md](examples.md)。
- 常见坑清单（Boot 4/Jackson 3、CSRF、事务、软删除唯一索引等）见 [pitfalls.md](pitfalls.md)。
- token、会话与缓存的状态语义见 [redis.md](redis.md)。
- 数据库迁移、类型与索引见 [postgres.md](postgres.md)。
- 交付核对见 [docs-and-delivery.md](docs-and-delivery.md)。

## 偏离标准栈时

当目标仓库显式使用不同方案（例如 JPA、Vuex、其它 UI 库、其它迁移工具或其它响应结构）时：

1. 以仓库既有约定为准，不要强行迁移到标准栈。
2. 在变更说明中写明差异，以及它对 API 契约、测试和质量门禁的影响。
3. 标准栈提供的是默认值和判断依据，不是迁移指令。
