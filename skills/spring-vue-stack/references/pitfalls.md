# 常见坑索引

按「坑 → 处理要点 → 详见」快速定位常见问题；细节与完整规则以对应 reference 为准。

## Spring Boot 4 / 生态

| 坑 | 处理要点 | 详见 |
|---|---|---|
| Jackson 3 命名空间 | Boot 4 用 Jackson 3（包名 `tools.jackson`，`JsonMapper`/`JsonMapperBuilderCustomizer`），不混用 Jackson 2 | [backend.md](backend.md) |
| 虚拟线程上下文/阻塞 | 开启 `spring.threads.virtual.enabled` 前确认 ThreadLocal/MDC 传递；避免 `synchronized` 长阻塞；核对连接池 | [backend-security-ops.md](backend-security-ops.md) |

## 后端

| 坑 | 处理要点 | 详见 |
|---|---|---|
| CSRF 姿态 | 无状态 token 接口关闭 CSRF；cookie 会话保留校验 | [backend-security-ops.md](backend-security-ops.md) |
| 安全响应头缺失 | 启用 CSP/HSTS/`X-Content-Type-Options`/frame 限制 | [backend-security-ops.md](backend-security-ops.md) |
| `@Transactional` 不回滚 | 检查异常需 `rollbackFor`；查询 `readOnly` 且不写；避免自调用 | [backend-persistence.md](backend-persistence.md) |
| 返回实体双向引用 | API 一律用 VO，不返回 Entity，避免死循环/字段泄露 | [backend.md](backend.md) |
| `@Async` 吞异常/丢上下文 | 方法内捕获记录；显式传播上下文；用有界执行器 | [backend-security-ops.md](backend-security-ops.md) |
| 连接池耗尽 | 设定池大小/超时、确保释放、不在事务内慢调用 | [backend-security-ops.md](backend-security-ops.md) |
| 日志注入 | 写入前清理换行/控制字符、限长、脱敏 | [backend.md](backend.md) |
| SSRF / 开放重定向 | 出站地址与跳转用允许列表，禁内网/元数据地址 | [backend-security-ops.md](backend-security-ops.md) |

## 前端

| 坑 | 处理要点 | 详见 |
|---|---|---|
| `v-for` 用 index 作 key | 用稳定且唯一的标识（如 `id`）作 `:key` | [frontend.md](frontend.md) |
| 直接修改 props | 用 `emit`/`defineModel` 或本地副本，保持单向数据流 | [frontend.md](frontend.md) |
| `:deep()` 滥用 | 限定在明确父级 BEM 块内，优先用主题变量 | [frontend.md](frontend.md) |
| 并发 401 刷新风暴 | 单刷新在途 + 排队重放，失败统一跳登录 | [frontend.md](frontend.md) |
| `provide/inject` 无类型 | `Symbol` key + `InjectionKey<T>`，组合式封装默认值 | [frontend.md](frontend.md) |
| `watch` 深度滥用 | 精确监听字段，派生状态用 `computed` | [frontend.md](frontend.md) |

## 数据库

| 坑 | 处理要点 | 详见 |
|---|---|---|
| 软删除后唯一键仍占用 | 部分唯一索引：`... WHERE deleted = false` | [postgres.md](postgres.md) |
| 外键 `ON DELETE` 未定义 | 显式声明 `RESTRICT`/`CASCADE`/`SET NULL` | [postgres.md](postgres.md) |

## 跨端

| 坑 | 处理要点 | 详见 |
|---|---|---|
| 敏感文件未忽略 | `.env*`、密钥、证书入 `.gitignore`；示例不含真实凭据 | [docs-and-delivery.md](docs-and-delivery.md) |
