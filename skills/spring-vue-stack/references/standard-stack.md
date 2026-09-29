# 标准技术栈与统一约定

本 Skill 采用**强约定**：下面是默认标准栈和统一契约。生成或修改代码时默认按此执行，只有目标仓库**显式声明**使用其它方案时才偏离，并说明差异与影响。不要因为某个示例来自历史项目就照搬其专有实现。

## 标准技术栈

### 后端

| 维度 | 标准选择 |
|---|---|
| JDK | Java 25 |
| 构建 | Maven |
| 框架 | Spring Boot 4.x |
| 数据访问 | MyBatis-Plus |
| 数据库迁移 | Flyway |
| 数据库 | PostgreSQL |
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
| UI | Element Plus（完整引入 `app.use(ElementPlus)`） |
| 样式 | SCSS + 严格 BEM |
| 国际化 | vue-i18n |
| 包管理 | pnpm |
| 请求 | 普通请求用 `fetch` 封装；文件上传用原生 `XHR` 封装 |
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

## 注释

- 后端、前端、数据库统一使用**中文注释**，标识符保持英文。
- 深度分级 **L1–L5**：类型/模块级（L1）与公开契约级（L2）必须；关键实现（L3）、字段/常量/枚举（L4）按需；显而易见的代码（L5）禁止注释。
- 实现类与覆写方法**不重复**接口/父类的 Javadoc，接口注释即唯一契约来源。
- 数据库每张表与每一列都必须 `COMMENT`。
- 完整标准见 [comments.md](comments.md)。

## 与本 Skill 其它参考的关系

- API 层的落地细节见 [backend.md](backend.md) 与 [frontend.md](frontend.md)。
- token、会话与缓存的状态语义见 [redis.md](redis.md)。
- 数据库迁移、类型与索引见 [postgres.md](postgres.md)。
- 交付核对见 [docs-and-delivery.md](docs-and-delivery.md)。

## 偏离标准栈时

当目标仓库显式使用不同方案（例如 JPA、Vuex、其它 UI 库、其它迁移工具或其它响应结构）时：

1. 以仓库既有约定为准，不要强行迁移到标准栈。
2. 在变更说明中写明差异，以及它对 API 契约、测试和质量门禁的影响。
3. 标准栈提供的是默认值和判断依据，不是迁移指令。
