#!/usr/bin/env node
// 将 assets/ 模板复制到目标项目，或生成 Flyway 时间戳迁移文件。
// 只复制、不覆盖：目标已存在同名文件时跳过。
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const assets = join(skillRoot, "assets");

function parseArgs(argv) {
    const args = { flags: new Set(), options: {} };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--name" || a === "--target") {
            args.options[a.slice(2)] = argv[++i];
        } else if (a.startsWith("--")) {
            args.flags.add(a.slice(2));
        }
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));
const target = resolve(args.options.target ?? process.cwd());

function ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyDir(srcDir, destDir, exclude = new Set()) {
    ensureDir(destDir);
    for (const entry of readdirSync(srcDir)) {
        if (exclude.has(entry)) continue;
        const src = join(srcDir, entry);
        if (statSync(src).isDirectory()) {
            copyDir(src, join(destDir, entry), exclude);
            continue;
        }
        const dest = join(destDir, entry);
        if (existsSync(dest)) {
            console.log(`跳过（已存在）: ${dest}`);
            continue;
        }
        writeFileSync(dest, readFileSync(src));
        console.log(`复制: ${dest}`);
    }
}

function timestampUtc() {
    const d = new Date();
    const p = n => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`
        + `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

function anyFlag(...names) {
    return names.some(n => args.flags.has(n));
}

if (anyFlag("backend")) {
    copyDir(join(assets, "backend"), target, new Set(["migration-template.sql"]));
}

if (anyFlag("frontend")) {
    copyDir(join(assets, "frontend"), target);
}

if (anyFlag("agents")) {
    ensureDir(target);
    const dest = join(target, "AGENTS.md");
    if (existsSync(dest)) {
        console.log(`跳过（已存在）: ${dest}`);
    } else {
        writeFileSync(dest, readFileSync(join(assets, "AGENTS.template.md")));
        console.log(`生成: ${dest}`);
    }
}

if (anyFlag("migration")) {
    const name = args.options.name ?? "migration";
    ensureDir(target);
    const file = join(target, `V${timestampUtc()}__${name}.sql`);
    if (existsSync(file)) {
        console.log(`跳过（已存在）: ${file}`);
    } else {
        writeFileSync(file, readFileSync(join(assets, "backend", "migration-template.sql")));
        console.log(`生成: ${file}`);
    }
}

const used = ["backend", "frontend", "agents", "migration"].filter(n => args.flags.has(n));
if (used.length === 0) {
    console.log("用法: scaffold.mjs [--backend] [--frontend] [--agents] [--migration --name <描述>] [--target <目录>]");
    process.exit(1);
}
console.log("\n完成。模板为占位，请按目标项目改包名/表名/字段并复核契约。");
