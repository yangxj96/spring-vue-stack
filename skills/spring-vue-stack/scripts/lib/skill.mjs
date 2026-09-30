// 技能安装：把技能本体复制到客户端可发现的目录；可选复制命令模板。
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getClient } from "./clients.mjs";
import { copyDir } from "./fs-utils.mjs";

const SKILL_DIR_NAME = "spring-vue-stack";

export function resolveSkillDest({ clientId, scope = "project", target = process.cwd() }) {
    const client = getClient(clientId);
    const base = scope === "global"
        ? client.globalSkillsDir
        : join(target, client.projectSkillsDir);
    return join(base, SKILL_DIR_NAME);
}

export function resolveCommandsDest({ clientId, scope = "project", target = process.cwd() }) {
    const client = getClient(clientId);
    return scope === "global"
        ? client.globalCommandsDir
        : join(target, client.projectCommandsDir);
}

export function installSkill({
    skillSource,
    clientId = "opencode",
    scope = "project",
    target = process.cwd(),
    overwrite = false,
    withCommands = false,
    log = console.log
} = {}) {
    const client = getClient(clientId);
    const dest = resolveSkillDest({ clientId, scope, target });

    if (existsSync(dest) && !overwrite) {
        log(`跳过（已存在）: ${dest}（如需更新请选择覆盖）`);
    } else {
        cpSync(skillSource, dest, { recursive: true, force: true });
        log(`安装技能: ${dest}`);
    }

    if (withCommands) {
        const commandsDest = resolveCommandsDest({ clientId: client.id, scope, target });
        copyDir(join(skillSource, "assets", client.commandsAsset), commandsDest, new Set(), log);
    }

    return dest;
}
