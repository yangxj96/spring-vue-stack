// 非交互子命令：skill / init / scaffold / validate。
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { skillRoot, assetsRoot, skillScriptsDir } from "./paths.mjs";
import { writeNew, timestampUtc } from "../../skills/spring-vue-stack/scripts/lib/fs-utils.mjs";
import { initBackend, overlayBackendAssets } from "../../skills/spring-vue-stack/scripts/lib/backend.mjs";
import { initFrontend } from "../../skills/spring-vue-stack/scripts/lib/frontend.mjs";
import { initRepoFiles } from "../../skills/spring-vue-stack/scripts/lib/repo.mjs";
import { installSkill } from "../../skills/spring-vue-stack/scripts/lib/skill.mjs";

export const DEFAULTS = {
    backendDir: "yangxj96-skills-admin",
    frontendName: "yangxj96-skills-ui",
    group: "com.devops00.skills",
    client: "opencode",
    scope: "project"
};

export function runSkill({ options, flags }) {
    installSkill({
        skillSource: skillRoot,
        clientId: String(options.client ?? DEFAULTS.client),
        scope: String(options.scope ?? DEFAULTS.scope),
        target: resolve(String(options.target ?? ".")),
        overwrite: flags.has("overwrite"),
        withCommands: flags.has("commands")
    });
}

export async function runInit({ options, flags }) {
    const target = resolve(String(options.target ?? "."));
    const backendDir = String(options["backend-dir"] ?? DEFAULTS.backendDir);
    const group = String(options.group ?? DEFAULTS.group);
    const backendArtifact = String(options["backend-artifact"] ?? backendDir);
    const packageName = String(options.package ?? `${group}.demo`);
    const frontendName = String(options["frontend-name"] ?? DEFAULTS.frontendName);
    const frontendPackage = String(options["frontend-package"] ?? frontendName);

    const onlyBackend = flags.has("backend") && !flags.has("frontend");
    const onlyFrontend = flags.has("frontend") && !flags.has("backend");
    const doBackend = onlyBackend || (!onlyBackend && !onlyFrontend);
    const doFrontend = onlyFrontend || (!onlyBackend && !onlyFrontend);
    const doSkill = !flags.has("no-skill");

    console.log(`目标目录: ${target}`);
    if (doBackend) console.log(`后端: ${backendDir}（artifact: ${backendArtifact}）  包名: ${packageName}`);
    if (doFrontend) console.log(`前端: ${frontendName}  前端包: ${frontendPackage}`);

    let bootVersion;
    if (doBackend) {
        bootVersion = await initBackend({
            target,
            dirName: backendDir,
            artifactId: backendArtifact,
            group,
            packageName,
            initializr: options.initializr ? String(options.initializr) : undefined,
            bootVersion: options["boot-version"] ? String(options["boot-version"]) : undefined
        });
    }
    if (doFrontend) {
        initFrontend({ target, frontendName, frontendPackage });
    }
    initRepoFiles({
        target,
        backendDir: doBackend ? backendDir : "",
        backendArtifact: doBackend ? backendArtifact : "",
        frontendName: doFrontend ? frontendName : "",
        group: doBackend ? group : "",
        packageName: doBackend ? packageName : "",
        frontendPackage: doFrontend ? frontendPackage : "",
        bootVersion
    });
    if (doSkill) {
        installSkill({ skillSource: skillRoot, clientId: "opencode", scope: "project", target, withCommands: true });
    }

    console.log("\n完成。下一步（需网络）:");
    if (doBackend) console.log(`  cd ${backendDir} && ./mvnw -q -DskipTests package   # Windows: mvnw.cmd`);
    if (doFrontend) console.log(`  cd ${frontendName} && pnpm install && pnpm build`);
}

export function runScaffold({ options, flags }) {
    const target = resolve(String(options.target ?? "."));
    let used = 0;

    if (flags.has("backend")) {
        overlayBackendAssets({ target, packageName: options.package ? String(options.package) : undefined });
        used++;
    }
    if (flags.has("agents")) {
        writeNew(join(target, "AGENTS.md"), readFileSync(join(assetsRoot, "AGENTS.template.md")));
        used++;
    }
    if (flags.has("migration")) {
        const name = String(options.name ?? "migration");
        writeNew(join(target, `V${timestampUtc()}__${name}.sql`),
            readFileSync(join(assetsRoot, "backend", "migration-template.sql")));
        used++;
    }

    if (used === 0) {
        throw new Error("scaffold 需要 --backend / --agents / --migration 至少一个");
    }
    console.log("\n完成。模板为占位，请按目标项目改包名/表名/字段并复核契约。");
}

export function runValidate({ positionals }) {
    const args = [join(skillScriptsDir, "validate.mjs"), ...positionals];
    const r = spawnSync(process.execPath, args, { stdio: "inherit" });
    process.exitCode = r.status ?? 1;
}
