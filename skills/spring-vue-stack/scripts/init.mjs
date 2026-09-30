#!/usr/bin/env node
// 初始化一个 Spring Boot 4 + Vue 3 项目：调用官方生成器（Spring Initializr / create-vite），
// 叠加 assets 模板，并完成 opencode 项目级集成。只写文件，不安装依赖、不构建、不初始化 git。
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initBackend } from "./lib/backend.mjs";
import { initFrontend } from "./lib/frontend.mjs";
import { initRepoFiles } from "./lib/repo.mjs";
import { installSkill } from "./lib/skill.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");

function parseArgs(argv) {
    const options = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith("--")) {
            const key = a.slice(2);
            const next = argv[i + 1];
            if (next !== undefined && !next.startsWith("--")) {
                options[key] = next;
                i++;
            } else {
                options[key] = true;
            }
        }
    }
    return options;
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
    console.log(`用法:
  node scripts/init.mjs --target <仓库根> [选项]

选项:
  --backend-dir      后端目录名（默认 yangxj96-skills-admin）
  --group            后端 groupId（默认 com.devops00.skills）
  --backend-artifact 后端 artifactId（默认取 --backend-dir）
  --package          后端包名（默认 <group>.demo）
  --frontend-name    前端目录（默认 yangxj96-skills-ui）
  --frontend-package 前端包名（默认取 --frontend-name）
  --boot-version     Spring Boot 版本（默认读取 Initializr 生成结果）
  --initializr       Spring Initializr 地址（默认 https://start.spring.io）
  --backend          只生成后端（默认前后端都生成）
  --frontend         只生成前端（默认前后端都生成）
  --no-skill         不安装 opencode 技能

说明: 只写文件，不安装依赖/不构建/不初始化 git。
覆盖策略: 标准 pom.xml/application.yml、前端 package.json/vite.config.ts/tsconfig*（并重建 src）会被覆盖；
资产叠加与仓库级文件（.mise.toml/.gitignore/README.md/AGENTS.md）对已存在文件跳过。`);
    process.exit(0);
}

const target = resolve(args.target ?? ".");
const backendDir = args["backend-dir"] ?? "yangxj96-skills-admin";
const group = args.group ?? "com.devops00.skills";
const backendArtifact = args["backend-artifact"] ?? backendDir;
const packageName = args.package ?? `${group}.demo`;
const frontendName = args["frontend-name"] ?? "yangxj96-skills-ui";
const frontendPackage = args["frontend-package"] ?? frontendName;
const initializr = args.initializr ?? "https://start.spring.io";
let bootVersion = typeof args["boot-version"] === "string" ? args["boot-version"] : undefined;

const onlyBackend = args.backend === true && args.frontend !== true;
const onlyFrontend = args.frontend === true && args.backend !== true;
const doBackend = onlyBackend || (!onlyBackend && !onlyFrontend);
const doFrontend = onlyFrontend || (!onlyBackend && !onlyFrontend);
const doSkill = !args["no-skill"];

(async () => {
    console.log(`目标目录: ${target}`);
    if (doBackend) console.log(`后端: ${backendDir}（artifact: ${backendArtifact}）  包名: ${packageName}`);
    if (doFrontend) console.log(`前端: ${frontendName}  前端包: ${frontendPackage}`);

    if (doBackend) {
        bootVersion = await initBackend({ target, dirName: backendDir, artifactId: backendArtifact, group, packageName, initializr, bootVersion });
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
    console.log("模板为占位，按实际业务改包名/表名/字段；已生成 AGENTS.md。");
    if (doSkill) console.log("已安装 opencode 技能到 .opencode/skills/spring-vue-stack。");
})().catch(err => {
    console.error(`\n错误: ${err.message}`);
    process.exit(1);
});
