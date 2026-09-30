#!/usr/bin/env node
// 端到端验证「发布态」：npm pack → 安装到临时项目 → 运行 bin 的非交互命令 → 断言产物。
// 需要网络（安装依赖 @clack/prompts）。仅开发者使用，不随包发布。
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..");

// 单条命令字符串 + shell：兼容 Windows 的 npm/pnpm.cmd，且避免 args+shell 的弃用告警。
function runShell(command, { cwd = packageRoot } = {}) {
    return spawnSync(command, { cwd, shell: true, encoding: "utf8" });
}

function runNode(args, { cwd = packageRoot } = {}) {
    return spawnSync(process.execPath, args, { cwd, encoding: "utf8" });
}

function step(message) {
    console.log(`\n=== ${message} ===`);
}

const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const version = pkg.version;
const pkgName = pkg.name;

step("npm pack");
const pack = runShell("npm pack --json");
if (pack.status !== 0) {
    console.error(pack.stderr || pack.stdout);
    process.exit(1);
}
let tarballName;
try {
    tarballName = JSON.parse(pack.stdout)[0].filename;
} catch {
    console.error(`无法解析 npm pack 输出:\n${pack.stdout}`);
    process.exit(1);
}
const tarball = join(packageRoot, tarballName);
console.log(`产物: ${tarballName}`);

const temp = mkdtempSync(join(tmpdir(), "svs-verify-"));
const appDir = join(temp, "app");
mkdirSync(appDir, { recursive: true });

let failure;
try {
    step("安装到临时项目");
    runShell("npm init -y", { cwd: temp });
    const install = runShell(`npm install "${tarball}" --no-audit --no-fund`, { cwd: temp });
    if (install.status !== 0) {
        throw new Error(`安装失败（需网络）:\n${install.stderr || install.stdout}`);
    }

    // 兼容 scoped 包名：@scope/name → node_modules/@scope/name
    const bin = join(temp, "node_modules", ...pkgName.split("/"), "bin", "spring-vue-stack.mjs");
    assert.ok(existsSync(bin), `未找到已安装的 bin: ${bin}`);

    step("--version / --help");
    let r = runNode([bin, "--version"], { cwd: temp });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), version, `版本不一致: ${r.stdout.trim()} != ${version}`);
    r = runNode([bin, "--help"], { cwd: temp });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /spring-vue-stack/);

    step("skill 安装");
    const skillTarget = join(appDir, "skill");
    r = runNode([bin, "skill", "--target", skillTarget, "--commands"], { cwd: temp });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(join(skillTarget, ".opencode", "skills", "spring-vue-stack", "SKILL.md")));
    assert.ok(existsSync(join(skillTarget, ".opencode", "commands", "new-feature.md")));

    step("scaffold 叠加");
    const overlay = join(appDir, "overlay");
    r = runNode([bin, "scaffold", "--backend", "--frontend", "--agents", "--target", overlay], { cwd: temp });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(join(overlay, "R.java")), "缺少后端资产 R.java");
    assert.ok(existsSync(join(overlay, "request.ts")), "缺少前端资产 request.ts");
    assert.ok(existsSync(join(overlay, "AGENTS.md")), "缺少 AGENTS.md");

    step("validate（包内）");
    r = runNode([bin, "validate"], { cwd: temp });
    assert.equal(r.status, 0, r.stderr);

    console.log("\n验证通过：打包 → 安装 → 运行 全流程 OK。");
} catch (error) {
    failure = error;
    console.error(`\n验证失败: ${error.message}`);
} finally {
    rmSync(temp, { recursive: true, force: true });
    rmSync(tarball, { force: true });
}

process.exit(failure ? 1 : 0);
