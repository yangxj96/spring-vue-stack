// 前端工程：调用 create-vite 生成 + 叠加标准配置与前端资产；或仅叠加资产到已有工程。
import { readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { writeNew, copyTree, copyDir } from "./fs-utils.mjs";
import { buildPlaceholderMap, applyPlaceholders } from "./placeholders.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..", "..");
const assets = join(skillRoot, "assets");

// 仅把 assets/frontend 复制到目标目录（scaffold 行为，目标通常是前端 src）。
export function overlayFrontendAssets({ target, log = console.log }) {
    copyDir(join(assets, "frontend"), target, new Set(), log);
}

// 生成整套前端工程。
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

    // 清空生成的 src 以免冲突，再落标准项目模板。
    const srcDir = join(dir, "src");
    if (existsSync(srcDir)) rmSync(srcDir, { recursive: true, force: true });
    copyTree(join(assets, "project", "frontend"), dir, {
        overwrite: true,
        replace: text => applyPlaceholders(text, map),
        log
    });

    // 叠加前端资产到约定目录。
    const fe = join(assets, "frontend");
    const put = (file, destRel) => writeNew(join(dir, destRel), readFileSync(join(fe, file), "utf8"), log);
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
    return dir;
}
