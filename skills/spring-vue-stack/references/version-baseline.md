# 版本基线与兼容注意

参考基线，**核对日期 2026-09-29**。以目标项目的实际依赖（`pom.xml` / `package.json` / lock 文件）为准；升级或引入前查阅官方发布说明，不要仅凭本表推断行为。

## 后端

| 组件 | 参考基线 | 注意 |
|---|---|---|
| JDK | 25（LTS） | Spring Boot 4 要求 Java 17+，本项目基线为 25 |
| Maven | 3.9.x | 也可用项目自带 Wrapper |
| Spring Boot | 4.1.x | Boot 4 默认 **Jackson 3**、Jakarta EE 11；与 Boot 3 的 API/包名差异需留意 |
| MyBatis-Plus | 3.5.15+ | Boot 4 必须用 `mybatis-plus-spring-boot4-starter`；boot3 starter 的自动配置引用了 Boot 3 包路径，会导致 Mapper 扫描失效 |
| Flyway | 11.x | 版本由 Boot 依赖管理；命名与行为见 [postgres.md](postgres.md) |
| PostgreSQL | 18 | 原生 `uuidv7()`；低于 18 需应用侧生成 UUIDv7 或扩展 |
| Jackson | 3.0.x（`tools.jackson`） | 与 Jackson 2（`com.fasterxml.jackson`）不混用 |
| Lombok | 1.18.x | 与 JDK 25 的注解处理兼容性先验证 |
| MapStruct | 1.6.x | 与 Lombok 组合注意注解处理器顺序（必要时引入 `lombok-mapstruct-binding`） |
| Redis | 7.x | 会话/缓存语义见 [redis.md](redis.md) |

## 前端

| 组件 | 参考基线 | 注意 |
|---|---|---|
| Node | 24 LTS（模板 mise 固定 24.14.0） | 脚本 `engines` 声明 `>=18` |
| pnpm | 12.x | 锁文件与 `packageManager` 字段锁定 |
| Vue | 3.5.x | `defineModel` 等写法依赖次版本 |
| Vite | 7.x | 与 Node 版本匹配 |
| Pinia | 3.x | setup store 写法 |
| Vue Router | 4.5.x | route meta 见 [frontend-patterns.md](frontend-patterns.md) |
| Element Plus | 2.9.x | 完整引入；locale 随 vue-i18n 切换 |
| vue-i18n | 11.x | — |
| dayjs | 1.11.x | Element Plus 依赖 |
| Vitest | 3.x | — |
| @vue/test-utils | 2.4.x | — |
| Playwright | 1.5x | E2E |
| ESLint | 9.x（flat config） | 见 [frontend-lint.md](frontend-lint.md) |
| Prettier | 3.x | — |
| Stylelint | 16.x | SCSS/BEM |

## 跨版本要点

- **Boot 4 / Jackson 3**：序列化配置用 `JsonMapper` / `JsonMapperBuilderCustomizer`，包名 `tools.jackson`。
- **Boot 4 线程模型**：`spring.threads.virtual.enabled` 可启用虚拟线程；注意 ThreadLocal/MDC 传播与连接池上限。
- **PostgreSQL 18**：UUIDv7 用 `uuidv7()`；若目标库低于 18，改由应用侧生成同版本 UUID。
- **MyBatis-Plus**：Boot 4 必须使用 `mybatis-plus-spring-boot4-starter`；分页等拦截器还需 `mybatis-plus-jsqlparser`。对 Boot 4 的支持随版本推进，务必选中适配版本并用集成测试覆盖。
- 版本号会随时间变化；本表只给基线与注意点，**实现时以实际依赖和官方文档为准**。
