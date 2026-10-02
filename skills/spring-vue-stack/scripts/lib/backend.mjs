// 后端工程：调用 Spring Initializr 生成 + 叠加标准 pom/配置与后端资产；或仅叠加资产到已有工程。
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { ensureDir, writeNew, writeOverwrite, copyDir, timestampUtc } from "./fs-utils.mjs";
import { buildPlaceholderMap, applyPlaceholders } from "./placeholders.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..", "..");
const assets = join(skillRoot, "assets");

const BACKEND_ASSET_EXCLUDE = new Set(["migration-template.sql"]);

// 把 assets/backend 中的模板放入目标工程。
// 传 packageName 时替换占位包名 `com.example.app` 并按 package 声明落位（init 行为）；
// 不传时原样复制到目标目录（scaffold 行为）。
export function overlayBackendAssets({ target, packageName, log = console.log }) {
    const backendAssets = join(assets, "backend");
    if (!packageName) {
        copyDir(backendAssets, target, BACKEND_ASSET_EXCLUDE, log);
        return;
    }
    for (const entry of readdirSync(backendAssets)) {
        if (BACKEND_ASSET_EXCLUDE.has(entry)) continue;
        const raw = readFileSync(join(backendAssets, entry), "utf8")
            .split("com.example.app").join(packageName);
        if (entry.endsWith(".java")) {
            const pkg = raw.match(/^package\s+([\w.]+);/m)?.[1];
            if (!pkg) continue;
            const type = raw.match(/public\s+(?:final\s+|abstract\s+)?(?:class|interface|record|enum)\s+([A-Za-z_$][\w$]*)/)?.[1];
            const fileName = type ? `${type}.java` : entry;
            writeNew(join(target, "src", "main", "java", pkg.split(".").join("/"), fileName), raw, log);
        } else if (entry.endsWith(".xml")) {
            writeNew(join(target, "src", "main", "resources", "mapper", "order", entry), raw, log);
        }
    }
}

// 生成整套后端工程。返回解析后的 Spring Boot 版本。
export async function initBackend({
    target,
    dirName,
    artifactId,
    group,
    packageName,
    initializr = "https://start.spring.io",
    bootVersion,
    log = console.log
} = {}) {
    const dir = join(target, dirName);
    const pomFile = join(dir, "pom.xml");

    if (!existsSync(pomFile)) {
        log(`\n生成后端（Spring Initializr）: ${dir}`);
        ensureDir(dir);
        const url = new URL(`${initializr}/starter.zip`);
        const params = {
            type: "maven-project",
            language: "java",
            javaVersion: "25",
            groupId: group,
            artifactId: artifactId,
            name: "demo",
            packageName,
            dependencies: "web,validation,data-redis,security,postgresql,flyway,actuator,lombok"
        };
        if (bootVersion) params.bootVersion = bootVersion;
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
        log(`\n后端已存在，跳过生成: ${dir}`);
    }

    let resolvedBoot = bootVersion;
    if (!resolvedBoot) {
        const m = readFileSync(pomFile, "utf8").match(/<parent>[\s\S]*?<version>([^<]+)<\/version>/);
        if (m) {
            resolvedBoot = m[1];
            log(`检测到 Spring Boot 版本: ${resolvedBoot}`);
        }
    }

    const map = buildPlaceholderMap({
        backendDir: dirName,
        backendArtifact: artifactId,
        frontendName: "",
        group,
        packageName,
        frontendPackage: "",
        bootVersion: resolvedBoot
    });

    writeOverwrite(pomFile, applyPlaceholders(readFileSync(join(assets, "project", "backend", "pom.xml"), "utf8"), map), log);
    writeOverwrite(join(dir, "src", "main", "resources", "application.yml"),
        applyPlaceholders(readFileSync(join(assets, "project", "backend", "application.yml"), "utf8"), map), log);

    // Initializr 默认生成 application.properties，会导致与 application.yml 重复；只保留 yml。
    const propertiesFile = join(dir, "src", "main", "resources", "application.properties");
    if (existsSync(propertiesFile)) {
        rmSync(propertiesFile, { force: true });
        log(`删除（与 application.yml 重复）: ${propertiesFile}`);
    }

    overlayBackendAssets({ target: dir, packageName, log });

    // 生成订单示例的初始迁移，保证 Flyway 启动即可建表。
    const migrationDir = join(dir, "src", "main", "resources", "db", "migration");
    const hasOrderMigration = existsSync(migrationDir)
        && readdirSync(migrationDir).some(f => f.endsWith("__create_biz_order.sql"));
    if (!hasOrderMigration) {
        writeNew(join(migrationDir, `V${timestampUtc()}__create_biz_order.sql`),
            readFileSync(join(assets, "backend", "migration-template.sql")), log);
    }

    return resolvedBoot;
}
