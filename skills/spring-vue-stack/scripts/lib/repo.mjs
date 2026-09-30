// 仓库级文件：写入 .mise.toml / .gitignore / README.md / AGENTS.md（已存在则跳过）。
// README/AGENTS 按实际生成的一侧（后端/前端）动态渲染。
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeNew } from "./fs-utils.mjs";
import { buildPlaceholderMap, applyPlaceholders } from "./placeholders.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..", "..");
const assets = join(skillRoot, "assets");

// 按标记保留/移除 `<!-- IF_xxx --> ... <!-- /IF_xxx -->` 块。
function renderBlocks(text, name, keep) {
    const re = new RegExp(`<!-- IF_${name} -->\\n?([\\s\\S]*?)<!-- /IF_${name} -->\\n?`, "g");
    return text.replace(re, (_, inner) => (keep ? inner : ""));
}

function renderTemplate(text, { hasBackend, hasFrontend }, map) {
    let out = renderBlocks(text, "BACKEND", hasBackend);
    out = renderBlocks(out, "FRONTEND", hasFrontend);
    return applyPlaceholders(out, map);
}

export function initRepoFiles({
    target,
    backendDir = "",
    backendArtifact = "",
    frontendName = "",
    group = "",
    packageName = "",
    frontendPackage = "",
    bootVersion,
    log = console.log
} = {}) {
    const repo = join(assets, "project", "repo");
    const map = buildPlaceholderMap({
        backendDir,
        backendArtifact,
        frontendName,
        group,
        packageName,
        frontendPackage,
        bootVersion
    });
    map.__REPO_TITLE__ = [backendDir, frontendName].filter(Boolean).join(" + ");
    const hasBackend = Boolean(backendDir);
    const hasFrontend = Boolean(frontendName);

    writeNew(join(target, ".mise.toml"), readFileSync(join(repo, "mise.toml"), "utf8"), log);
    writeNew(join(target, ".gitignore"), readFileSync(join(repo, "gitignore"), "utf8"), log);
    writeNew(join(target, "README.md"),
        renderTemplate(readFileSync(join(repo, "README.md"), "utf8"), { hasBackend, hasFrontend }, map), log);
    writeNew(join(target, "AGENTS.md"),
        renderTemplate(readFileSync(join(repo, "AGENTS.md"), "utf8"), { hasBackend, hasFrontend }, map), log);
}
