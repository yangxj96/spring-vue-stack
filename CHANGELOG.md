# Changelog

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 与语义化版本。

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
