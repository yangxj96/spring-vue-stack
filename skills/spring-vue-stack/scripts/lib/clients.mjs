// Agent 客户端注册表：定义每个客户端发现技能的目录与命令模板位置。
// 目前仅实现 opencode；新增客户端时在此登记即可。
import { homedir } from "node:os";
import { join } from "node:path";

export const CLIENTS = {
    opencode: {
        id: "opencode",
        label: "opencode",
        projectSkillsDir: join(".opencode", "skills"),
        globalSkillsDir: join(homedir(), ".config", "opencode", "skills"),
        projectCommandsDir: join(".opencode", "commands"),
        globalCommandsDir: join(homedir(), ".config", "opencode", "commands"),
        commandsAsset: join("opencode", "commands")
    }
};

export function getClient(id) {
    const client = CLIENTS[id];
    if (!client) {
        throw new Error(`未知客户端: ${id}（可用: ${Object.keys(CLIENTS).join(", ")}）`);
    }
    return client;
}
