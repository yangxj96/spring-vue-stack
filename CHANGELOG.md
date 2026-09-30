# Changelog

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 与语义化版本。

## [1.2.1] - 2026-09-30

### Fixed
- `scripts/release.mjs` 发布时使用真实终端（`stdio: inherit`），支持 npm 2FA/OTP 交互提示。
- `scripts/release.mjs` 回查改为查询版本端点（发布后立即可见），`npm view` 仅作尽力确认；不再因 registry packument 缓存刷新延迟而误判发布失败。
- 交互向导每个输入步骤的提示补充「用途与默认值」说明，避免歧义；并修复空默认值输入项显示 `undefined` 的问题。

### Changed
- 单侧 `init`（仅后端或仅前端）生成的仓库 `README.md`/`AGENTS.md` 仅包含实际生成的工程信息，不再写入未创建的一方。
- 技能内 `scripts/scaffold.mjs` 支持 `--backend --package <包名>`，与 CLI 行为一致。
- 文档一致性：修正 `init` 覆盖策略说明、pnpm 版本基线（12.x）、CI 文案、README 向导输入与 CI 触发说明；补全 CLI help（scaffold `--package`、validate `--root`、release 选项、`--commands` 默认差异）。
- `release` 在版本变更时同步 `package-lock.json` 与 `SKILL.md` 的版本号。

## [1.2.0] - 2026-09-30

### Added
- npm CLI 包 `@yangxj96/spring-vue-stack`（命令名仍为 `spring-vue-stack`）：支持 `npx @yangxj96/spring-vue-stack` 与全局安装，无参进入交互向导。
- 交互向导：多选安装技能/后端/前端；技能可选客户端（opencode）、项目级或全局、是否带命令模板；后端/前端可选新建整套工程或叠加到已有工程，并填写包名等参数。
- 非交互子命令：`skill`、`init`、`scaffold`、`validate`，便于 CI 与脚本调用。
- 客户端适配层 `scripts/lib/clients.mjs`，目前实现 opencode，预留其它客户端扩展。
- `node:test` 单元测试；CI 改为执行 `npm run verify`（校验 + 测试 + 打包安装运行）。
- 端到端验证脚本 `scripts/verify-install.mjs` 与 `npm run verify`（打包 → 安装到临时项目 → 运行各命令）；`prepublishOnly` 改为执行 `verify`；`.gitignore` 忽略 `*.tgz`。
- 组合端到端测试 `test/e2e.test.mjs`：覆盖技能 project/global、init 仅前端/仅后端/`--no-skill`/已有文件、scaffold 平铺与按包落位/组合/迁移等。
- 发布脚本 `scripts/release.mjs` 与 `npm run release`：固定官方源并显式打印、登录预检、检测版本（不可复用）并在已存在/整包撤销时自动递增版本号后发布（不做 unpublish）、同步 `VERSION`、可选 `--git` 提交打 tag。

### Fixed
- Windows 下 `pnpm`/`npm` 调用改为单条命令字符串 + shell，消除 Node 24 的 `DEP0190` 弃用告警；前端目录名增加字符集校验以防命令注入。
- 交互向导仅在真正需要仓库根目录时（项目级技能或新建工程）才询问「目标仓库根目录」；此前只选全局技能也会多问一次。

### Changed
- `scripts/init.mjs` 与 `scripts/scaffold.mjs` 改为薄封装，复用 `scripts/lib/` 共享逻辑；技能本体仍可独立复制使用。
- 前端工程模板的 `__FRONTEND_PACKAGE__` 占位现在会被实际替换（修复此前未替换的问题）。
- 后端参数拆分为「目录名 / groupId / artifactId / 包名」（移除 `--backend-name`），向导顺序为目录名 → groupId → artifactId → 包名；占位符拆为 `__BACKEND_DIR__`（`cd` 目录）与 `__BACKEND_ARTIFACT__`（Maven `artifactId` 与 `spring.application.name`）。

## [1.1.0] - 2026-09-29

### Added
- 项目初始化脚本 `scripts/init.mjs`：调用官方生成器（Spring Initializr + create-vite）生成后端 + 前端，叠加技能资产，写入 `.mise.toml`/`AGENTS.md`/`.gitignore`/`README.md`，并完成项目级 opencode 集成。
- 项目模板 `assets/project/`（后端 `pom.xml`/`application.yml`，前端 `package.json`/Vite/TS/`src`，仓库级模板）与 `assets/opencode/commands/`。
- `init` 用法文档（`scaffolding.md`）与 README 快速开始。

### Fixed
- `init.mjs` 以非交互方式运行 create-vite（`--no-interactive --no-immediate`），避免卡在安装/启动提示。
- 后端模板补齐 MyBatis-Plus 3.5.9 的 `mybatis-plus-jsqlparser`、Lombok 注解处理版本，并按 public 类名生成 `.java` 文件名。
- 前端模板使用 pnpm 12 的 `pnpm-workspace.yaml` `allowBuilds`，避免安装报错。

### Changed
- CI `validate` 触发收窄为 `master` 分支与 `v*` 标签（及 PR）。

## [1.0.0] - 2026-09-29

### Added
- 标准栈与统一契约：`standard-stack.md`（`snake_case`、`{code,message,data}` 统一壳、状态码、UUIDv7、Jackson 3、时间语义）。
- 后端参考拆分为 `backend.md`（核心）、`backend-persistence.md`（数据访问）、`backend-security-ops.md`（安全与运行）。
- 前端参考 `frontend.md`、`frontend-lint.md`，以及测试深化 `testing.md`、前端模式 `frontend-patterns.md`。
- 注释标准 `comments.md`（L1–L5，实现类不重复接口注释，表列 `COMMENT`）。
- 数据库 `postgres.md`、Redis `redis.md`、交付与 DoD `docs-and-delivery.md`。
- 常见坑索引 `pitfalls.md`、契约先行示例 `examples.md`、版本基线 `version-baseline.md`、脚手架说明 `scaffolding.md`。
- 可复制资产 `assets/`（后端/前端/AGENTS 模板）与脚本 `scripts/scaffold.mjs`、`scripts/validate.mjs`。
- 校验 CI、`package.json`、可选 opencode 集成。

### Notes
- 强约定定位：默认按标准栈执行，目标仓库显式声明其它方案时以仓库为准并说明差异。
