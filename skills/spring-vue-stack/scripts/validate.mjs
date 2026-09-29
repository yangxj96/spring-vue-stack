#!/usr/bin/env node
// 校验技能包：frontmatter、内链、禁词、大小预算、规则索引完整性。
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const repoRoot = resolve(skillRoot, "..", "..");

const errors = [];
const warnings = [];

function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (entry === ".git" || entry === "node_modules") continue;
            walk(full, out);
        } else if (entry.endsWith(".md")) {
            out.push(full);
        }
    }
    return out;
}

// 1. SKILL.md frontmatter
const skillMd = join(skillRoot, "SKILL.md");
if (!existsSync(skillMd)) {
    errors.push("缺少 SKILL.md");
} else {
    const text = readFileSync(skillMd, "utf8");
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) {
        errors.push("SKILL.md 缺少 frontmatter");
    } else {
        for (const key of ["name", "description"]) {
            if (!new RegExp(`^${key}:`, "m").test(fm[1])) {
                errors.push(`SKILL.md frontmatter 缺少 ${key}`);
            }
        }
        const desc = (fm[1].match(/^description:\s*(.*)$/m)?.[1] ?? "").trim();
        if (desc.length > 1024) {
            errors.push(`SKILL.md description 超过 1024 字符（${desc.length}）`);
        }
    }
}

// 2. 内链检查
const mdFiles = walk(repoRoot);
for (const file of mdFiles) {
    const dir = dirname(file);
    const text = readFileSync(file, "utf8");
    const re = /\[[^\]]*\]\(([^)]+)\)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        const target = m[1].trim();
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const clean = target.split("#")[0];
        if (!clean) continue;
        if (!existsSync(resolve(dir, clean))) {
            errors.push(`${relative(repoRoot, file)} -> 链接失效: ${target}`);
        }
    }
}

// 3. 禁词
const forbidden = ["多租户", "租户", "ApiResponse"];
for (const file of mdFiles) {
    const text = readFileSync(file, "utf8");
    for (const term of forbidden) {
        if (text.includes(term)) {
            errors.push(`${relative(repoRoot, file)} 含禁词: ${term}`);
        }
    }
}

// 4. 大小预算（每个 .md 不超过 32KB）
const BUDGET = 32 * 1024;
for (const file of mdFiles) {
    const size = statSync(file).size;
    if (size > BUDGET) {
        warnings.push(`${relative(repoRoot, file)} 大小 ${(size / 1024).toFixed(1)}KB 超过预算 32KB`);
    }
}

// 5. 规则索引完整性（notes/rule-inventory.md 中引用的 references/*.md 必须存在）
const inventory = join(repoRoot, "notes", "rule-inventory.md");
if (existsSync(inventory)) {
    const text = readFileSync(inventory, "utf8");
    const refs = new Set([...text.matchAll(/references\/([\w.-]+\.md)/g)].map(x => x[1]));
    for (const ref of refs) {
        if (!existsSync(join(skillRoot, "references", ref))) {
            errors.push(`rule-inventory 引用了不存在的 references/${ref}`);
        }
    }
    const actual = readdirSync(join(skillRoot, "references")).filter(f => f.endsWith(".md"));
    for (const file of actual) {
        if (!refs.has(file) && file !== "SKILL.md") {
            warnings.push(`references/${file} 未出现在 rule-inventory 的规则→文件索引中`);
        }
    }
}

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`\n检查完成：${errors.length} 个错误，${warnings.length} 个警告。`);
process.exit(errors.length > 0 ? 1 : 0);
