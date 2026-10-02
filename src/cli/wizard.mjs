// 交互向导：多选安装内容 → 逐项配置 → 汇总确认 → 执行。
import * as p from "@clack/prompts";
import { join, resolve } from "node:path";
import { skillRoot } from "./paths.mjs";
import { CLIENTS } from "../../skills/spring-vue-stack/scripts/lib/clients.mjs";
import { initBackend, overlayBackendAssets } from "../../skills/spring-vue-stack/scripts/lib/backend.mjs";
import { initFrontend } from "../../skills/spring-vue-stack/scripts/lib/frontend.mjs";
import { initRepoFiles } from "../../skills/spring-vue-stack/scripts/lib/repo.mjs";
import { installSkill } from "../../skills/spring-vue-stack/scripts/lib/skill.mjs";
import { DEFAULTS } from "./commands.mjs";

function guard(value) {
    if (p.isCancel(value)) {
        p.cancel("已取消，未做任何改动。");
        process.exit(0);
    }
    return value;
}

async function askBaseTarget() {
    const input = guard(await p.text({
        message: `目标仓库根目录（文件写入位置；默认 当前目录：${process.cwd()}）`,
        defaultValue: process.cwd(),
        placeholder: process.cwd()
    }));
    return resolve(String(input || process.cwd()));
}

async function askSkill() {
    const clientId = guard(await p.select({
        message: "技能适配的客户端（当前仅 opencode；默认 opencode）",
        options: Object.values(CLIENTS).map(c => ({ value: c.id, label: c.label })),
        initialValue: "opencode"
    }));
    const scope = guard(await p.select({
        message: "安装范围（项目级=.opencode/skills；全局=~/.config/opencode/skills；默认 项目级）",
        options: [
            { value: "project", label: "项目级", hint: ".opencode/skills" },
            { value: "global", label: "全局", hint: "~/.config/opencode/skills" }
        ],
        initialValue: "project"
    }));
    const withCommands = guard(await p.confirm({
        message: "同时安装命令模板（/new-feature、/db-migration）？（默认 是）",
        initialValue: true
    }));
    const overwrite = guard(await p.confirm({
        message: "技能目录已存在时覆盖？（默认 否）",
        initialValue: false
    }));
    return { clientId, scope, withCommands, overwrite };
}

async function askBackend() {
    const mode = guard(await p.select({
        message: "后端：安装方式（新建=Initializr 生成整套工程；叠加=复制资产到已有工程；默认 新建）",
        options: [
            { value: "new", label: "新建整套工程", hint: "Spring Initializr + 标准配置" },
            { value: "overlay", label: "叠加到已有工程", hint: "复制后端资产模板" }
        ],
        initialValue: "new"
    }));

    if (mode === "new") {
        const backendDir = String(guard(await p.text({ message: `后端目录名（Maven 项目文件夹名；默认 ${DEFAULTS.backendDir}）`, defaultValue: DEFAULTS.backendDir })) || DEFAULTS.backendDir);
        const group = String(guard(await p.text({ message: `groupId（Maven 组织 / 反向域名；默认 ${DEFAULTS.group}）`, defaultValue: DEFAULTS.group })) || DEFAULTS.group);
        const artifactId = String(guard(await p.text({ message: `artifactId（Maven 项目唯一标识；默认 与后端目录名相同 = ${backendDir}）`, defaultValue: backendDir })) || backendDir);
        const packageDefault = `${group}.demo`;
        const packageName = String(guard(await p.text({ message: `包名 / base package（Java 源码根包；默认 ${packageDefault}）`, defaultValue: packageDefault })) || packageDefault);
        const bootVersion = String(guard(await p.text({ message: "Spring Boot 版本（留空则使用 Initializr 生成结果；默认 空）", placeholder: "直接回车 = 使用生成结果" })) || "");
        return { mode, backendDir, group, artifactId, packageName, bootVersion: bootVersion || undefined };
    }

    const target = resolve(String(guard(await p.text({ message: `后端资源根目录（java 包目录或项目根；默认 当前目录：${process.cwd()}）`, defaultValue: process.cwd() })) || process.cwd()));
    const packageName = String(guard(await p.text({ message: "包名（可选；留空则保持模板占位 com.example.app；默认 空）", placeholder: "直接回车 = 保持 com.example.app" })) || "");
    return { mode, target, packageName: packageName || undefined };
}

async function askFrontend() {
    const frontendName = String(guard(await p.text({ message: `前端目录名（Vite 项目文件夹名；默认 ${DEFAULTS.frontendName}）`, defaultValue: DEFAULTS.frontendName })) || DEFAULTS.frontendName);
    const frontendPackage = String(guard(await p.text({ message: `前端包名（package.json 的 name；默认 与前端目录名相同 = ${frontendName}）`, defaultValue: frontendName })) || frontendName);
    return { mode: "new", frontendName, frontendPackage };
}

function summarize(plan) {
    const lines = [];
    if (plan.skill) {
        lines.push(`技能：${plan.skill.clientId} · ${plan.skill.scope === "global" ? "全局" : "项目级"} · ${plan.skill.scope === "global" ? "-" : plan.skill.target}${plan.skill.withCommands ? " · 含命令模板" : ""}`);
    }
    if (plan.backend) {
        lines.push(plan.backend.mode === "new"
            ? `后端：新建 ${plan.backend.backendDir}（artifact ${plan.backend.artifactId}，${plan.backend.packageName}）→ ${plan.backend.target}`
            : `后端：叠加资产 → ${plan.backend.target}`);
    }
    if (plan.frontend) {
        lines.push(`前端：新建 ${plan.frontend.frontendName} → ${plan.frontend.target}`);
    }
    return lines;
}

export async function runWizard() {
    p.intro("spring-vue-stack 安装向导");

    const targets = guard(await p.multiselect({
        message: "选择要安装的内容（空格选择 / 回车确认；至少选一项）",
        options: [
            { value: "skill", label: "技能（Agent Skill）", hint: "安装可移植技能包" },
            { value: "backend", label: "后端工程", hint: "Spring Boot 4" },
            { value: "frontend", label: "前端工程", hint: "Vue 3 + Vite" }
        ],
        required: true
    }));

    const plan = { skill: null, backend: null, frontend: null };

    if (targets.includes("skill")) plan.skill = await askSkill();
    if (targets.includes("backend")) plan.backend = await askBackend();
    if (targets.includes("frontend")) plan.frontend = await askFrontend();

    // 仅在确实需要仓库根目录时（项目级技能 / 新建工程）才询问，避免全局技能等场景多问。
    const needBaseTarget =
        (plan.skill && plan.skill.scope === "project") ||
        plan.backend?.mode === "new" ||
        plan.frontend?.mode === "new";
    let baseTarget;
    if (needBaseTarget) {
        baseTarget = await askBaseTarget();
        if (plan.skill?.scope === "project") plan.skill.target = baseTarget;
        if (plan.backend?.mode === "new") plan.backend.target = baseTarget;
        if (plan.frontend?.mode === "new") plan.frontend.target = baseTarget;
    }

    const proceed = guard(await p.confirm({
        message: `确认执行？（默认 是）\n${summarize(plan).map(l => `  · ${l}`).join("\n")}`,
        initialValue: true
    }));
    if (!proceed) {
        p.cancel("已取消，未做任何改动。");
        return;
    }

    let bootVersion;
    let createdProject = false;

    if (plan.backend?.mode === "new") {
        p.log.step("生成后端工程…");
        bootVersion = await initBackend({
            target: plan.backend.target,
            dirName: plan.backend.backendDir,
            artifactId: plan.backend.artifactId,
            group: plan.backend.group,
            packageName: plan.backend.packageName,
            bootVersion: plan.backend.bootVersion
        });
        createdProject = true;
    } else if (plan.backend?.mode === "overlay") {
        p.log.step("叠加后端资产…");
        overlayBackendAssets({ target: plan.backend.target, packageName: plan.backend.packageName });
    }

    if (plan.frontend?.mode === "new") {
        p.log.step("生成前端工程…");
        initFrontend({
            target: plan.frontend.target,
            frontendName: plan.frontend.frontendName,
            frontendPackage: plan.frontend.frontendPackage
        });
        createdProject = true;
    }

    if (createdProject) {
        p.log.step("写入仓库级配置（mise / AGENTS / README）…");
        initRepoFiles({
            target: baseTarget,
            backendDir: plan.backend?.mode === "new" ? plan.backend.backendDir : "",
            backendArtifact: plan.backend?.mode === "new" ? plan.backend.artifactId : "",
            frontendName: plan.frontend?.mode === "new" ? plan.frontend.frontendName : "",
            group: plan.backend?.group ?? "",
            packageName: plan.backend?.mode === "new" ? plan.backend.packageName : "",
            frontendPackage: plan.frontend?.mode === "new" ? plan.frontend.frontendPackage : "",
            bootVersion
        });
    }

    if (plan.skill) {
        p.log.step("安装技能…");
        installSkill({
            skillSource: skillRoot,
            clientId: plan.skill.clientId,
            scope: plan.skill.scope,
            target: plan.skill.target,
            overwrite: plan.skill.overwrite,
            withCommands: plan.skill.withCommands
        });
    }

    const next = [];
    if (plan.backend?.mode === "new") next.push(`cd ${plan.backend.backendDir} && ./mvnw -q -DskipTests package`);
    if (plan.frontend?.mode === "new") next.push(`cd ${plan.frontend.frontendName} && pnpm install && pnpm build`);
    p.outro(next.length
        ? `完成。下一步（需网络）：\n  ${next.join("\n  ")}`
        : "完成。");
}
