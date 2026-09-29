#!/usr/bin/env node
// 初始化一个 Spring Boot 4 + Vue 3 项目：调用官方生成器（Spring Initializr / create-vite），
// 叠加 assets 模板，并完成 opencode 项目级集成。只写文件，不安装依赖、不构建、不初始化 git。
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync, rmSync, cpSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const assets = join(skillRoot, "assets");

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
  --backend-name     后端目录/artifactId（默认 yangxj96-skills-admin）
  --frontend-name    前端目录（默认 yangxj96-skills-ui）
  --group            后端 groupId（默认 com.devops00.skills）
  --package          后端包名（默认 com.devops00.skills.demo）
  --frontend-package 前端包名（默认取 --frontend-name）
  --boot-version     Spring Boot 版本（默认读取 Initializr 生成结果）
  --initializr       Spring Initializr 地址（默认 https://start.spring.io）

说明: 只写文件，不安装依赖/不构建/不初始化 git。已存在文件跳过。`);
    process.exit(0);
}

const target = resolve(args.target ?? ".");
const backendName = args["backend-name"] ?? "yangxj96-skills-admin";
const frontendName = args["frontend-name"] ?? "yangxj96-skills-ui";
const group = args.group ?? "com.devops00.skills";
const packageName = args.package ?? "com.devops00.skills.demo";
const frontendPackage = args["frontend-package"] ?? frontendName;
const initializr = args.initializr ?? "https://start.spring.io";

let bootVersion = typeof args["boot-version"] === "string" ? args["boot-version"] : undefined;

const map = () => ({
    __BACKEND_NAME__: backendName,
    __FRONTEND_NAME__: frontendName,
    __GROUP__: group,
    __PACKAGE__: packageName,
    __PACKAGE_PATH__: packageName.split(".").join("/"),
    __FRONTEND_PACKAGE__: frontendPackage,
    __BOOT_VERSION__: bootVersion ?? "4.1.0"
});

function applyPlaceholders(text) {
    let out = text;
    for (const [k, v] of Object.entries(map())) {
        out = out.split(k).join(v);
    }
    return out;
}

function ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writeNew(file, content) {
    ensureDir(dirname(file));
    if (existsSync(file)) {
        console.log(`跳过（已存在）: ${file}`);
        return;
    }
    writeFileSync(file, content);
    console.log(`写入: ${file}`);
}

function writeOverwrite(file, content) {
    ensureDir(dirname(file));
    writeFileSync(file, content);
    console.log(`写入: ${file}`);
}

function copyTree(srcDir, destDir, { replace = applyPlaceholders, overwrite = false } = {}) {
    ensureDir(destDir);
    for (const entry of readdirSync(srcDir)) {
        const src = join(srcDir, entry);
        if (statSync(src).isDirectory()) {
            copyTree(src, join(destDir, entry), { replace, overwrite });
        } else {
            const content = replace(readFileSync(src, "utf8"));
            const dest = join(destDir, entry);
            if (overwrite) {
                writeOverwrite(dest, content);
            } else {
                writeNew(dest, content);
            }
        }
    }
}

async function initBackend() {
    const dir = join(target, backendName);
    const pomFile = join(dir, "pom.xml");

    if (!existsSync(pomFile)) {
        console.log(`\n生成后端（Spring Initializr）: ${dir}`);
        ensureDir(dir);
        const url = new URL(`${initializr}/starter.zip`);
        const params = {
            type: "maven-project",
            language: "java",
            javaVersion: "25",
            groupId: group,
            artifactId: backendName,
            name: "demo",
            packageName,
            dependencies: "web,validation,data-redis,security,postgresql,flyway,actuator,lombok"
        };
        if (bootVersion) {
            params.bootVersion = bootVersion;
        }
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Initializr 请求失败: HTTP ${res.status}（检查 --boot-version / 网络）`);
        }
        const zip = join(tmpdir(), `starter-${Date.now()}.zip`);
        writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
        const tar = spawnSync("tar", ["-xf", zip, "-C", dir], { stdio: "inherit" });
        rmSync(zip, { force: true });
        if (tar.status !== 0) {
            throw new Error("解压 starter.zip 失败；请确认系统提供 tar（Windows 10+ / macOS / Linux 自带）");
        }
    } else {
        console.log(`\n后端已存在，跳过生成: ${dir}`);
    }

    // 读取 Initializr 选择的 Spring Boot 版本（未显式指定时）
    if (!bootVersion) {
        const m = readFileSync(pomFile, "utf8").match(/<parent>[\s\S]*?<version>([^<]+)<\/version>/);
        if (m) {
            bootVersion = m[1];
            console.log(`检测到 Spring Boot 版本: ${bootVersion}`);
        }
    }

    // 覆盖为本技能的标准 pom 与配置
    writeOverwrite(pomFile, applyPlaceholders(readFileSync(join(assets, "project", "backend", "pom.xml"), "utf8")));
    writeOverwrite(join(dir, "src", "main", "resources", "application.yml"),
        applyPlaceholders(readFileSync(join(assets, "project", "backend", "application.yml"), "utf8")));

    // 叠加后端资产（替换包名，按 package 声明落位）
    const backendAssets = join(assets, "backend");
    for (const entry of readdirSync(backendAssets)) {
        if (entry === "migration-template.sql") continue;
        const raw = readFileSync(join(backendAssets, entry), "utf8").split("com.example.app").join(packageName);
        if (entry.endsWith(".java")) {
            const pkg = raw.match(/^package\s+([\w.]+);/m)?.[1];
            if (!pkg) continue;
            const type = raw.match(/public\s+(?:final\s+|abstract\s+)?(?:class|interface|record|enum)\s+([A-Za-z_$][\w$]*)/)?.[1];
            const fileName = type ? `${type}.java` : entry;
            writeNew(join(dir, "src", "main", "java", pkg.split(".").join("/"), fileName), raw);
        } else if (entry.endsWith(".xml")) {
            writeNew(join(dir, "src", "main", "resources", "mapper", "order", entry), raw);
        }
    }
}

function initFrontend() {
    const dir = join(target, frontendName);
    const pkgFile = join(dir, "package.json");

    if (!existsSync(pkgFile)) {
        console.log(`\n生成前端（create-vite）: ${dir}`);
        if (existsSync(dir) && readdirSync(dir).length > 0) {
            console.log(`目录非空，跳过 create-vite: ${dir}`);
        } else {
            const r = spawnSync("pnpm", ["create", "vite", frontendName, "--template", "vue-ts", "--no-interactive", "--no-immediate"],
                { cwd: target, stdio: "inherit", shell: true });
            if (r.status !== 0) {
                throw new Error("pnpm create vite 失败；请确认已安装 pnpm 与网络可用");
            }
        }
    } else {
        console.log(`\n前端已存在，跳过生成: ${dir}`);
    }

    // 用本技能的标准文件覆盖/补齐（清空生成的 src 以免冲突）
    const srcDir = join(dir, "src");
    if (existsSync(srcDir)) rmSync(srcDir, { recursive: true, force: true });
    copyTree(join(assets, "project", "frontend"), dir, { overwrite: true });

    // 叠加前端资产到约定目录
    const fe = join(assets, "frontend");
    const put = (file, destRel) => writeNew(join(dir, destRel), readFileSync(join(fe, file), "utf8"));
    put("api-error.ts", "src/api/api-error.ts");
    put("request.ts", "src/api/request.ts");
    put("page-result.ts", "src/api/page-result.ts");
    put("upload.ts", "src/api/upload.ts");
    put("date.ts", "src/utils/date.ts");
    put("use-list.ts", "src/composables/use-list.ts");
    put("store.ts", "src/stores/app.ts");
    put("route-meta.ts", "src/types/route-meta.ts");
    put("eslint.config.ts", "eslint.config.ts");
    put(".prettierrc.yml", ".prettierrc.yml");
    put(".prettierignore", ".prettierignore");
    put("stylelint.config.mjs", "stylelint.config.mjs");
}

function initRepoAndOpencode() {
    const repo = join(assets, "project", "repo");
    writeNew(join(target, ".mise.toml"), readFileSync(join(repo, "mise.toml"), "utf8"));
    writeNew(join(target, ".gitignore"), readFileSync(join(repo, "gitignore"), "utf8"));
    writeNew(join(target, "README.md"), applyPlaceholders(readFileSync(join(repo, "README.md"), "utf8")));
    writeNew(join(target, "AGENTS.md"), applyPlaceholders(readFileSync(join(repo, "AGENTS.md"), "utf8")));

    // 项目级 opencode 集成
    const skillDest = join(target, ".opencode", "skills", "spring-vue-stack");
    console.log(`\n安装技能到: ${skillDest}`);
    cpSync(skillRoot, skillDest, { recursive: true });
    copyTree(join(assets, "opencode", "commands"), join(target, ".opencode", "commands"));
}

(async () => {
    console.log(`目标目录: ${target}`);
    console.log(`后端: ${backendName}  前端: ${frontendName}`);
    console.log(`包名: ${packageName}  前端包: ${frontendPackage}`);

    await initBackend();
    initFrontend();
    initRepoAndOpencode();

    console.log("\n完成。下一步（需网络）:");
    console.log(`  cd ${backendName} && ./mvnw -q -DskipTests package   # Windows: mvnw.cmd`);
    console.log(`  cd ${frontendName} && pnpm install && pnpm build`);
    console.log("模板为占位，按实际业务改包名/表名/字段；已生成 AGENTS.md 与 .opencode 集成。");
})().catch(err => {
    console.error(`\n错误: ${err.message}`);
    process.exit(1);
});
