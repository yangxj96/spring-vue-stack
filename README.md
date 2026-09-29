# Spring + Vue 技术栈 Skill

面向 Spring Boot 4.x、Vue 3.x、PostgreSQL 和 Redis 项目的可移植 Agent Skills 包。

核心 Skill 位于 [`skills/spring-vue-stack/`](skills/spring-vue-stack/)。它由 `SKILL.md` 和若干 Markdown 参考文件组成，不需要 Codex 插件清单、MCP 服务或特定运行时。它以**强约定**规定了一套标准栈（Java 25 · Maven · Spring Boot 4.x · MyBatis-Plus · Flyway · PostgreSQL · Redis · Spring Security/Sa-Token；Vue 3 · TypeScript · Vite · Pinia · Vue Router · Element Plus · SCSS · pnpm），API 使用 `snake_case`，响应采用 `{code,message,data}` 统一壳。**默认必须按此执行**；仅当目标仓库显式声明使用其它方案时才偏离，且需说明差异。

## 在 Agent 工具中使用

不同的 Agent 工具在发现、安装、启用和刷新 Skill 的方式上各不相同。请查阅所选工具的当前文档，确认其支持的本地 Skill 目录或插件机制。

对于从本地目录发现 Skill 的工具：

1. 克隆本仓库（`git clone git@github.com:yangxj96/spring-vue-stack.git`），或下载发布归档。
2. 将 `skills/spring-vue-stack/` 放到该工具能识别的目录下。可参照该工具文档给出的方式复制或链接该 Skill 文件夹。
3. 新建任务或会话，在采用受支持技术栈的仓库中提出需求。Skill 会先检查目标仓库的指令和现有实现。

除非工具的文档明确要求，否则不要把整个仓库复制到工具的 Skill 目录中。可移植单元是包含 `SKILL.md`、`references/`、`assets/` 与 `scripts/` 的 `spring-vue-stack` 文件夹。

## 更新与版本固定

Agent Skills 目录格式本身不会主动拉取更新。

- **链接安装：** 更新源仓库检出（例如在其中执行 `git pull --ff-only`），并确认链接仍指向该检出。
- **复制安装：** 更新源仓库检出或下载更新的归档，然后把更新后的完整 `spring-vue-stack/` 目录覆盖到已安装副本上。只更新源仓库检出不会更新已复制的 Skill。
- **归档安装：** 下载新的归档，并用更新后的内容替换已安装的 Skill 目录。

部分工具可能提供自己的市场刷新或插件更新机制；请遵循该工具文档，并确认是否需要重启当前会话才能加载变更后的文件。

若需团队内可重复使用，请固定某个发布标签或提交，并通过评审来更新该固定点。本包刻意不内置工具专属的启动更新器，因此安装本 Skill 不会静默产生网络活动或修改用户级 Agent 配置。

## 适用范围

- 后端指导：Spring Boot 4.x、Java 25、Maven、MyBatis-Plus（UUIDv7 主键）、Flyway、springdoc，以及 Spring Security/Sa-Token 的服务/API 开发。
- 前端指导：Vue 3、TypeScript、Vite、Pinia、Vue Router、Element Plus、SCSS（BEM）、vue-i18n、pnpm 的界面开发。
- 数据指导：PostgreSQL 表结构、查询，以及 Flyway 迁移。
- 状态指导：Redis 缓存、UUID token 会话、安全状态与协调行为。
- 交付指导：API 统一壳（`{code,message,data}`）、状态码、Schema、配置文档，以及项目级验证。
- 注释指导：后端、前端与数据库建表的中文注释标准，深度分级 L1–L5，实现类不重复接口注释。
- 契约与示例：`snake_case`、统一壳、UUIDv7 主键、Jackson 序列化契约，以及契约先行的端到端示例，见 [`references/examples.md`](skills/spring-vue-stack/references/examples.md)。
- 常见坑：Boot 4/Jackson 3、虚拟线程、CSRF、事务回滚、软删除唯一索引、前端响应式与请求等，见 [`references/pitfalls.md`](skills/spring-vue-stack/references/pitfalls.md)。

本 Skill 采用**强约定**：除非目标仓库显式使用不同的 ORM、UI 库、状态管理器、路由、API 响应结构、认证设计、迁移工具或构建命令，否则一律按上述标准栈执行。一旦目标仓库有明确选择，则以仓库为准，并在变更说明中写明差异。标准栈是**默认强制约束**，不是迁移指令；对版本敏感的细节仍会对照目标项目实际依赖核实，版本基线见 [`references/version-baseline.md`](skills/spring-vue-stack/references/version-baseline.md)。

## 仓库结构

- `skills/spring-vue-stack/`：技能本体，含 `SKILL.md`、`references/`、`assets/`、`scripts/`。
- `integrations/opencode/`：可选的 opencode 安装说明与命令模板。
- `notes/`：内部来源清单、规则→文件索引、手动前向检查（不随技能加载）。
- `package.json`：校验与脚手架命令。

## 资产与脚手架

- `assets/` 提供可复制模板：后端 `R`/异常/MyBatis-Plus 配置/实体/迁移、前端 fetch/XHR 请求层与 lint 配置、`AGENTS.md` 模板。
- `node skills/spring-vue-stack/scripts/scaffold.mjs --backend --frontend --agents --target <目录>` 复制模板；`--migration --name <描述>` 生成 Flyway 时间戳迁移。
- 用法与约束见 [`references/scaffolding.md`](skills/spring-vue-stack/references/scaffolding.md)。模板为占位，复制后必须改包名/表名/字段。

## 校验

`npm run validate`（或 `node skills/spring-vue-stack/scripts/validate.mjs`）校验 frontmatter、内链、禁词、大小预算与规则索引；CI 在 push/PR 自动执行。opencode 集成见 [`integrations/opencode/`](integrations/opencode/README.md)。

## 许可证

MIT。详见 [`LICENSE`](LICENSE)。
