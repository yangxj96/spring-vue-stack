// 前端工程：调用 create-vite 生成 + 落标准项目模板（模板自包含，无需再叠加资产）。
import { readdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { copyTree } from "./fs-utils.mjs";
import { buildPlaceholderMap, applyPlaceholders } from "./placeholders.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..", "..");
const assets = join(skillRoot, "assets");

// 生成整套前端工程：create-vite（如需）后，用标准项目模板整体覆盖。
export function initFrontend({
    target,
    frontendName,
    frontendPackage,
    log = console.log
} = {}) {
    const dir = join(target, frontendName);
    const pkgFile = join(dir, "package.json");

    if (!existsSync(pkgFile)) {
        log(`\n生成前端（create-vite）: ${dir}`);
        if (existsSync(dir) && readdirSync(dir).length > 0) {
            log(`目录非空，跳过 create-vite: ${dir}`);
        } else {
            // 名称会进入 shell 命令，限制字符集以避免命令注入。
            if (!/^[A-Za-z0-9@/._-]+$/.test(frontendName)) {
                throw new Error(`前端目录名含非法字符: ${frontendName}`);
            }
            // 用单条命令字符串 + shell，兼容 Windows 的 pnpm.cmd，且避免 spawn args+shell 的弃用告警。
            const cmd = `pnpm create vite "${frontendName}" --template vue-ts --no-interactive --no-immediate`;
            const r = spawnSync(cmd, { cwd: target, stdio: "inherit", shell: true });
            if (r.status !== 0) {
                throw new Error("pnpm create vite 失败；请确认已安装 pnpm 与网络可用");
            }
        }
    } else {
        log(`\n前端已存在，跳过生成: ${dir}`);
    }

    const map = buildPlaceholderMap({
        backendDir: "",
        backendArtifact: "",
        frontendName,
        group: "",
        packageName: "",
        frontendPackage,
        bootVersion: undefined
    });

    // 清空生成的 src 以免冲突，再落标准项目模板（含 request/stores/api 等全部前端文件）。
    const srcDir = join(dir, "src");
    if (existsSync(srcDir)) rmSync(srcDir, { recursive: true, force: true });
    copyTree(join(assets, "project", "frontend"), dir, {
        overwrite: true,
        replace: text => applyPlaceholders(text, map),
        log
    });

    return dir;
}
