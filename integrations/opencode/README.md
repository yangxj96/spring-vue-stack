# opencode 集成（可选）

这是**可选**集成，仅提供便捷安装与命令模板，不进入技能核心；删除本目录不影响技能本身，也不会削弱其它 Agent 工具的使用。opencode 会自动发现技能目录中带 `SKILL.md` 的文件夹。

## 1. 安装技能（最小集成）

opencode 会从以下位置自动发现 `skills/<name>/SKILL.md`（`name` 必须与目录名一致、全小写连字符）：

- 项目级：`.opencode/skills/<name>/`、`.claude/skills/<name>/`、`.agents/skills/<name>/`
- 全局：`~/.config/opencode/skills/<name>/`、`~/.claude/skills/<name>/`、`~/.agents/skills/<name>/`

项目级安装（在目标项目根执行）。SSH 版用 `git@github.com:yangxj96/spring-vue-stack.git`，HTTPS 版用 `https://github.com/yangxj96/spring-vue-stack.git`。

### 方式 A：克隆到临时目录后复制（一次性）

```bash
git clone --depth 1 git@github.com:yangxj96/spring-vue-stack.git /tmp/spring-vue-stack
mkdir -p .opencode/skills
cp -r /tmp/spring-vue-stack/skills/spring-vue-stack .opencode/skills/spring-vue-stack
rm -rf /tmp/spring-vue-stack
```

Windows PowerShell：

```powershell
git clone --depth 1 git@github.com:yangxj96/spring-vue-stack.git "$env:TEMP\spring-vue-stack"
New-Item -ItemType Directory -Force .opencode/skills | Out-Null
Copy-Item -Recurse "$env:TEMP\spring-vue-stack\skills\spring-vue-stack" .opencode\skills\spring-vue-stack
Remove-Item -Recurse -Force "$env:TEMP\spring-vue-stack"
```

### 方式 B：克隆到固定目录，复制或软链（便于随仓库更新）

```bash
git clone git@github.com:yangxj96/spring-vue-stack.git ~/src/spring-vue-stack

# 复制
mkdir -p .opencode/skills
cp -r ~/src/spring-vue-stack/skills/spring-vue-stack .opencode/skills/spring-vue-stack

# 或软链（源仓库 git pull 后即生效）
ln -s ~/src/spring-vue-stack/skills/spring-vue-stack .opencode/skills/spring-vue-stack
```

Windows PowerShell（软链需开发者模式或管理员）：

```powershell
git clone git@github.com:yangxj96/spring-vue-stack.git "$HOME\src\spring-vue-stack"
New-Item -ItemType Directory -Force .opencode/skills | Out-Null
Copy-Item -Recurse "$HOME\src\spring-vue-stack\skills\spring-vue-stack" .opencode\skills\spring-vue-stack
# 软链（需开发者模式）
New-Item -ItemType SymbolicLink -Path .opencode\skills\spring-vue-stack -Target "$HOME\src\spring-vue-stack\skills\spring-vue-stack"
```

安装后新建会话；opencode 会把它列在 `skill` 工具中，并在任务匹配时按需加载。

## 2. 可选命令模板

把 `commands/` 下的文件复制到目标项目 `.opencode/commands/`（全局为 `~/.config/opencode/commands/`），即可用斜杠命令触发：

- `/new-feature <描述>`：按技能做一条端到端纵向功能。
- `/db-migration <描述>`：生成 Flyway 时间戳迁移。

命令模板只是提示词，技能是否加载由 opencode 的发现机制决定。

## 3. 可选子 agent（按需）

如需限定模型或工具，可在目标项目 `.opencode/agents/`（全局 `~/.config/opencode/agents/`）增加后端/前端 agent，并在其提示中要求遵循 `spring-vue-stack` 技能。保持精简，避免与技能内容重复。

## 说明

- 本目录不作为通用技能的一部分；可移植单元始终是 `skills/spring-vue-stack/`。
- 命令/agent 中的命令名与目录请以目标项目实际脚本为准。
