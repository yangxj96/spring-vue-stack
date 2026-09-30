#!/usr/bin/env node
// 发布到官方 npm 源：登录预检 → 版本已存在则自动递增（版本号不可复用）→ 同步 VERSION/package-lock/SKILL.md → verify → publish → 回查。
// 所有 npm 命令显式带官方 registry，不受本地镜像（如淘宝源）影响。
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const OFFICIAL_REGISTRY = "https://registry.npmjs.org/";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const pkgPath = join(root, "package.json");
const versionPath = join(root, "VERSION");
const lockPath = join(root, "package-lock.json");
const skillMdPath = join(root, "skills", "spring-vue-stack", "SKILL.md");

// 同步 package-lock.json 顶层版本号（离线、确定性）。
function syncLockfile(version, log = console.log) {
    if (!existsSync(lockPath)) return;
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    lock.version = version;
    if (lock.packages && lock.packages[""]) lock.packages[""].version = version;
    writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
    log(`已同步: ${lockPath}`);
}

// 同步技能 frontmatter 的 metadata.version。
function syncSkillVersion(version, log = console.log) {
    if (!existsSync(skillMdPath)) return;
    const md = readFileSync(skillMdPath, "utf8");
    const next = md.replace(/(\n[ \t]*version:\s*")[^"]+(")/, `$1${version}$2`);
    if (next !== md) {
        writeFileSync(skillMdPath, next);
        log(`已同步: ${skillMdPath}`);
    }
}

function parseArgs(argv) {
    const options = {};
    const flags = new Set();
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--dry-run" || arg === "--skip-verify" || arg === "--git") {
            flags.add(arg.slice(2));
        } else if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const next = argv[i + 1];
            if (next !== undefined && !next.startsWith("--")) {
                options[key] = next;
                i++;
            } else {
                flags.add(key);
            }
        }
    }
    return { options, flags };
}

const { options, flags } = parseArgs(process.argv.slice(2));
const dryRun = flags.has("dry-run");

function run(command, { capture = false } = {}) {
    console.log(`\n$ ${command}`);
    const r = spawnSync(command, {
        cwd: root,
        shell: true,
        encoding: "utf8",
        stdio: capture ? "pipe" : "inherit"
    });
    if (r.error) throw r.error;
    return r;
}

function must(command, { capture = false } = {}) {
    const r = run(command, { capture });
    if (r.status !== 0) {
        throw new Error(`命令失败（退出码 ${r.status}）: ${command}`);
    }
    return r;
}

function sleepSync(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function bumpVersion(version, type) {
    const m = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/.exec(version);
    if (!m) throw new Error(`无法解析版本号: ${version}`);
    let major = Number(m[1]);
    let minor = Number(m[2]);
    let patch = Number(m[3]);
    if (type === "major") { major += 1; minor = 0; patch = 0; }
    else if (type === "minor") { minor += 1; patch = 0; }
    else if (type === "patch") { patch += 1; }
    else throw new Error("--bump 只支持 patch | minor | major");
    return `${major}.${minor}.${patch}`;
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const name = pkg.name;

const viewCmd = (v) => `npm view "${name}@${v}" version --registry ${OFFICIAL_REGISTRY}`;
const exists = (v) => run(viewCmd(v), { capture: true }).status === 0;

// 判断整包状态：exists（有版本）/ unpublished（整包被撤销，旧版本号不可复用）/ missing（从未发布）
function packageState() {
    const r = run(`npm view "${name}" version --registry ${OFFICIAL_REGISTRY}`, { capture: true });
    if (r.status === 0) return "exists";
    if (/Unpublished on/i.test(`${r.stderr ?? ""}${r.stdout ?? ""}`)) return "unpublished";
    return "missing";
}

// 1. 登录预检
const who = run(`npm whoami --registry ${OFFICIAL_REGISTRY}`, { capture: true });
if (who.status !== 0) {
    if (dryRun) {
        console.log("提示: 当前未登录官方源（dry-run 继续）。");
    } else {
        throw new Error(`未登录官方源，请先执行: npm login --registry ${OFFICIAL_REGISTRY}`);
    }
} else {
    console.log(`已登录官方源: ${who.stdout.trim()}`);
}

// 2. 确定版本：
//    - 显式 --bump 时无条件递增（撤销过的版本号也不可复用，npm view 返回 404 检测不到）
//    - 目标版本若已发布，则继续递增直到得到一个从未发布过的版本号
let version = pkg.version;
const explicitlyBumped = Boolean(options.bump);
if (explicitlyBumped) {
    const next = bumpVersion(version, options.bump);
    console.log(`\n指定递增（${options.bump}）: ${version} → ${next}`);
    version = next;
}
const state = packageState();
const baseVersionUsed = state === "unpublished" && !explicitlyBumped;
if (baseVersionUsed) {
    console.log(`\n${name} 已整包撤销；按 npm 策略旧版本号不可复用（且 24h 内不能发布新版本），自动递增版本号。`);
}
if (baseVersionUsed || exists(version)) {
    let next = bumpVersion(version, "patch");
    while (exists(next)) {
        next = bumpVersion(next, "patch");
    }
    console.log(`  版本: ${version} → ${next}`);
    version = next;
}

console.log("\n" + "─".repeat(52));
console.log(`包名   : ${name}`);
console.log(`版本   : ${version}`);
console.log(`发布源 : ${OFFICIAL_REGISTRY}  （官方）`);
console.log(`模式   : ${dryRun ? "dry-run（不产生任何改动）" : "正式发布"}`);
console.log("─".repeat(52));

if (dryRun) {
    console.log("\n[dry-run] 计划执行的命令：");
    console.log("  " + (flags.has("skip-verify") ? "(跳过 verify)" : "npm run verify"));
    console.log("  （版本变更时同步 package.json / VERSION / package-lock.json / SKILL.md）");
    console.log(`  npm publish --ignore-scripts --access public --registry ${OFFICIAL_REGISTRY}${options.tag ? ` --tag ${options.tag}` : ""}${options.otp ? " --otp ***" : ""}`);
    console.log("  " + viewCmd(version));
    if (flags.has("git")) {
        console.log(`  git add -A && git commit -m "chore(release): ${version}" && git tag v${version} && git push && git push --tags`);
    }
    process.exit(0);
}

// 3. 写回版本并同步 VERSION / package-lock.json / SKILL.md
if (version !== pkg.version) {
    pkg.version = version;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`\n已更新: ${pkgPath}`);
}
writeFileSync(versionPath, `${version}\n`);
console.log(`已同步: ${versionPath}`);
syncLockfile(version);
syncSkillVersion(version);

// 4. 验证
if (!flags.has("skip-verify")) {
    must("npm run verify");
}

// 5. 发布（脚本内已 verify，用 --ignore-scripts 避免 prepublishOnly 重复执行）
let publish = `npm publish --ignore-scripts --access public --registry ${OFFICIAL_REGISTRY}`;
if (options.tag) publish += ` --tag ${options.tag}`;
if (options.otp) publish += ` --otp ${options.otp}`;
// 全量继承终端，保证 npm 的 OTP/2FA 交互提示可用（不捕获输出）。
const pub = run(publish);
if (pub.status !== 0) {
    console.error("\n发布失败。若因 2FA/OTP 中断，可重试并完成浏览器认证，或指定动态码：npm run release -- --otp <6位动态码>");
    throw new Error(`命令失败（退出码 ${pub.status}）: ${publish}`);
}

// 6. 回查：直接查版本端点（发布后立即可见）；packument 有缓存延迟，不视为失败
const encodedName = name.replace("/", "%2f");
const versionUrl = `https://registry.npmjs.org/${encodedName}/${version}`;
let visible = false;
for (let i = 0; i < 6 && !visible; i++) {
    try {
        const res = await fetch(versionUrl, { headers: { accept: "application/json" } });
        visible = res.ok;
    } catch {
        visible = false;
    }
    if (!visible) {
        console.log(`  版本端点暂未可见，5s 后重试… (${i + 1}/6)`);
        sleepSync(5000);
    }
}
if (visible) {
    console.log(`\n已确认发布: ${versionUrl}`);
} else {
    console.warn(`\n发布命令已成功（退出码 0），但版本端点暂未可见，请稍后确认: ${versionUrl}`);
}
// npm view 走 packument，可能有缓存刷新延迟；仅作附带确认
const viewResult = run(viewCmd(version), { capture: true });
console.log(viewResult.status === 0
    ? `npm view 确认: ${name}@${version}`
    : "注意: npm view 暂未返回（packument 缓存刷新中），不影响发布结果。");

if (flags.has("git")) {
    must("git add -A");
    must(`git commit -m "chore(release): ${version}"`);
    must(`git tag v${version}`);
    must("git push");
    must("git push --tags");
}

console.log(`\n发布完成：${name}@${version}（${OFFICIAL_REGISTRY}）`);
