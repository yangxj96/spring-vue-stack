# Spring + Vue 技术栈 Skill

面向 Spring Boot 4.x、Vue 3.x、PostgreSQL 和 Redis 项目的可移植 Agent Skills 包。

核心 Skill 位于 [`skills/spring-vue-stack/`](skills/spring-vue-stack/)。它由 `SKILL.md` 和若干 Markdown 参考文件组成，不需要 Codex 插件清单、MCP 服务或特定运行时。它以**强约定**规定了一套标准栈（Java 25 · Maven · Spring Boot 4.x · MyBatis-Plus · Flyway · PostgreSQL · Redis · Spring Security/Sa-Token；Vue 3 · TypeScript · Vite · Pinia · Vue Router · Element Plus · SCSS · pnpm），API 使用 `snake_case`，响应采用 `{code,message,data}` 统一壳。**默认必须按此执行**；仅当目标仓库显式声明使用其它方案时才偏离，且需说明差异。

## 安装与使用（npm CLI）

npm 包名为 `@yangxj96/spring-vue-stack`，安装后提供 `spring-vue-stack` 命令：

```bash
npx @yangxj96/spring-vue-stack          # 交互向导（推荐）
npm i -g @yangxj96/spring-vue-stack     # 或全局安装后直接用 spring-vue-stack
```

无参运行进入交互向导，可多选安装：

- **技能**：选择客户端（当前 opencode）、项目级或全局、是否附带命令模板（**向导默认安装命令模板；非交互 `skill` 子命令默认不装，需显式 `--commands`**）。
- **后端工程**：新建整套工程（Spring Initializr）或叠加资产到已有工程，可填目录名、groupId、artifactId、包名、Spring Boot 版本。
- **前端工程**：新建整套工程（create-vite）或叠加资产到已有工程。

非交互用法（CI / 脚本）：

```bash
spring-vue-stack skill  --client opencode --scope project --commands --target .
spring-vue-stack init   --target . --package com.acme.demo --frontend-name acme-ui
spring-vue-stack scaffold --backend --agents --target .
spring-vue-stack validate
```

`init` 只写文件，不安装依赖、不构建、不初始化 git；会**覆盖**标准 `pom.xml`/`application.yml` 与前端 `package.json`/`vite.config.ts`/`tsconfig*`（并重建 `src`），资产叠加与仓库级文件（`.mise.toml`/`AGENTS.md` 等）已存在则跳过。生成后按提示执行 `mvnw` 与 `pnpm install`。

## 在 Agent 工具中使用

不同的 Agent 工具在发现、安装、启用和刷新 Skill 的方式上各不相同。请查阅所选工具的当前文档，确认其支持的本地 Skill 目录或插件机制。

对于从本地目录发现 Skill 的工具：

1. 克隆本仓库（`git clone git@github.com:yangxj96/spring-vue-stack.git`），或下载发布归档。
2. 将 `skills/spring-vue-stack/` 放到该工具能识别的目录下。可参照该工具文档给出的方式复制或链接该 Skill 文件夹。
3. 新建任务或会话，在采用受支持技术栈的仓库中提出需求。Skill 会先检查目标仓库的指令和现有实现。

除非工具的文档明确要求，否则不要把整个仓库复制到工具的 Skill 目录中。可移植单元是包含 `SKILL.md`、`references/`、`assets/` 与 `scripts/` 的 `spring-vue-stack` 文件夹。

### opencode

opencode 从 `.opencode/skills/<name>/SKILL.md`（项目级）或 `~/.config/opencode/skills/<name>/`（全局）发现技能，并兼容 `.claude/skills/`、`.agents/skills/`。

使用 CLI 安装（推荐）：

```bash
npx @yangxj96/spring-vue-stack skill --client opencode --scope project --commands --target .
```

或手动安装：

```bash
git clone --depth 1 git@github.com:yangxj96/spring-vue-stack.git /tmp/spring-vue-stack
mkdir -p .opencode/skills
cp -r /tmp/spring-vue-stack/skills/spring-vue-stack .opencode/skills/spring-vue-stack
rm -rf /tmp/spring-vue-stack
```

（HTTPS URL：`https://github.com/yangxj96/spring-vue-stack.git`。）

完整安装（固定目录/软链）、可选命令模板（`/new-feature`、`/db-migration`）与子 agent 见 [`integrations/opencode/README.md`](integrations/opencode/README.md)。

## 新建项目快速开始

1. 安装技能（见上，或 [`integrations/opencode/README.md`](integrations/opencode/README.md)）。
2. **一键初始化整套工程（推荐）**：调用官方生成器生成后端 + 前端并叠加技能资产，同时写入 `.mise.toml`/`AGENTS.md`/`.opencode` 集成。用 CLI 也可：`npx @yangxj96/spring-vue-stack`（向导）或 `npx @yangxj96/spring-vue-stack init --target . ...`。

   ```bash
   node .opencode/skills/spring-vue-stack/scripts/init.mjs --target . \
     --backend-dir yangxj96-skills-admin --frontend-name yangxj96-skills-ui \
     --group com.devops00.skills --package com.devops00.skills.demo \
     --frontend-package yangxj96-skills-ui
   ```

   然后按提示执行 `mvnw` 与 `pnpm install`；需要网络。详见 [`references/scaffolding.md`](skills/spring-vue-stack/references/scaffolding.md)。

3. **或在已有工程叠加单点资产**（可选）：

   ```bash
   # 路径按安装位置二选一：.opencode/skills/spring-vue-stack/ 或 skills/spring-vue-stack/
   node .opencode/skills/spring-vue-stack/scripts/scaffold.mjs --backend --agents --target .
   node .opencode/skills/spring-vue-stack/scripts/scaffold.mjs --migration --name create_xxx --target src/main/resources/db/migration
   ```

   复制出的模板是占位，改包名/表名/字段后再用。
4. 让 Agent 按技能实现功能；契约先行，参考 [`references/examples.md`](skills/spring-vue-stack/references/examples.md)。
5. 交付前按 [`references/docs-and-delivery.md`](skills/spring-vue-stack/references/docs-and-delivery.md) 的 Definition of Done 自查。

## 更新与版本固定

Agent Skills 目录格式本身不会主动拉取更新。

- **链接安装：** 更新源仓库检出（例如在其中执行 `git pull --ff-only`），并确认链接仍指向该检出。
- **复制安装：** 更新源仓库检出或下载更新的归档，然后把更新后的完整 `spring-vue-stack/` 目录覆盖到已安装副本上。只更新源仓库检出不会更新已复制的 Skill。
- **归档安装：** 下载新的归档，并用更新后的内容替换已安装的 Skill 目录。

部分工具可能提供自己的市场刷新或插件更新机制；请遵循该工具文档，并确认是否需要重启当前会话才能加载变更后的文件。

若需团队内可重复使用，请固定某个发布标签或提交，并通过评审来更新该固定点。本包刻意不内置工具专属的启动更新器，因此安装本 Skill 不会静默产生网络活动或修改用户级 Agent 配置。

## 适用范围

- 后端指导：Spring Boot 4.x、Java 25、Maven、MyBatis-Plus（UUIDv7 主键）、Flyway，以及 Spring Security/Sa-Token 的服务/API 开发。
- 前端指导：Vue 3、TypeScript、Vite、Pinia、Vue Router、Element Plus、SCSS（BEM）、vue-i18n、pnpm 的界面开发。
- 数据指导：PostgreSQL 表结构、查询，以及 Flyway 迁移。
- 状态指导：Redis 缓存、UUID token 会话、安全状态与协调行为。
- 交付指导：API 统一壳（`{code,message,data}`）、状态码、Schema、配置文档，以及项目级验证。
- 注释指导：后端、前端与数据库建表的中文注释标准，深度分级 L1–L5，实现类不重复接口注释。
- 契约与示例：`snake_case`、统一壳、UUIDv7 主键、Jackson 序列化契约，以及契约先行的端到端示例，见 [`references/examples.md`](skills/spring-vue-stack/references/examples.md)。
- 常见坑：Boot 4/Jackson 3、虚拟线程、CSRF、事务回滚、软删除唯一索引、前端响应式与请求等，见 [`references/pitfalls.md`](skills/spring-vue-stack/references/pitfalls.md)。

本 Skill 采用**强约定**：除非目标仓库显式使用不同的 ORM、UI 库、状态管理器、路由、API 响应结构、认证设计、迁移工具或构建命令，否则一律按上述标准栈执行。一旦目标仓库有明确选择，则以仓库为准，并在变更说明中写明差异。标准栈是**默认强制约束**，不是迁移指令；对版本敏感的细节仍会对照目标项目实际依赖核实，版本基线见 [`references/version-baseline.md`](skills/spring-vue-stack/references/version-baseline.md)。

## 仓库结构

- `skills/spring-vue-stack/`：技能本体，含 `SKILL.md`、`references/`、`assets/`、`scripts/`（含共享 `scripts/lib/`）。
- `bin/` + `src/cli/`：npm CLI 入口与交互向导。
- `integrations/opencode/`：可选的 opencode 安装说明与命令模板。
- `test/`、`scripts/`（`verify-install.mjs`/`release.mjs`）：仓库维护用，**不随 npm 包发布**；安装副本里 `npm run verify`/`npm run release` 不可用。
- `notes/`：内部来源清单、规则→文件索引、手动前向检查（不随技能加载）。
- `package.json`：CLI bin、依赖与校验/测试/脚手架命令。

## 资产与脚手架

- `assets/` 提供可复制模板：后端 `R`/异常/MyBatis-Plus 配置/实体/迁移、前端 fetch/XHR 请求层与 lint 配置、`AGENTS.md` 模板。
- `node skills/spring-vue-stack/scripts/scaffold.mjs --backend --agents --target <目录>` 复制后端资产与 AGENTS 模板；`--backend --package <包名>` 按包名落位（否则平铺到 `--target`）；`--migration --name <描述>` 生成 Flyway 时间戳迁移。
- 用法与约束见 [`references/scaffolding.md`](skills/spring-vue-stack/references/scaffolding.md)。模板为占位，复制后必须改包名/表名/字段。

## 校验

`npm run validate`（或 `spring-vue-stack validate`、`node skills/spring-vue-stack/scripts/validate.mjs`）校验 frontmatter、内链、禁词、大小预算与规则索引；`npm test` 运行 CLI 与脚本的单元测试。

本地端到端验证（发布态）：

```bash
npm run verify   # validate + test + npm pack → 安装到临时项目 → 运行各命令
```

`verify` 会打包、装进临时目录并实际执行 `--version`/`--help`/`skill`/`scaffold`/`validate`，无需发布即可验证安装态，需网络。CI 在 push 到 `master` / `v*` tag、PR 与 `prepublishOnly` 自动执行。

## 发布（维护者）

发布固定走**官方源** `https://registry.npmjs.org/`（脚本会显式打印并带在每条命令上，不受淘宝等镜像影响）：

```bash
npm run release -- --dry-run     # 预演：显示包名/版本/官方源与将执行的命令
npm run release                  # 正式发布
```

行为与选项：

- 先 `npm whoami --registry 官方` 做登录预检。
- 先查整包状态（`npm view <name>`，识别「整包已撤销」）再查目标版本；**版本号不可复用**，因此已存在或整包被撤销过时**自动递增版本号**（默认 patch，循环直到从未发布过）后再发布。**不做 unpublish。**
- 同步 `package.json`/`VERSION`/`package-lock.json`/`SKILL.md` → `npm run verify` → `npm publish --ignore-scripts --access public --registry 官方` → 回查版本端点确认。
- `--bump patch|minor|major` 指定递增级别；`--skip-verify` 跳过验证；`--tag <dist-tag>`；`--otp <code>`；`--git` 发布后 commit + tag `v<version>` 并 push。
- 发布时会等待 npm 的 2FA/OTP 交互提示（需真实终端）；若已中断，可重试或 `npm run release -- --otp <6位动态码>`。
- 手动发布时也请显式指定官方源：`npm publish --registry https://registry.npmjs.org/`。

> npm 策略：`package@version` 用过即不可复用（即使已撤销）；整包撤销后 24 小时内不能发布任何新版本。所以发布新内容请递增版本号，不要撤销重发。

## 许可证

MIT。详见 [`LICENSE`](LICENSE)。
