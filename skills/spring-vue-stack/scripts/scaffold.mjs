#!/usr/bin/env node
// 将 assets/ 模板复制到目标项目，或生成 Flyway 时间戳迁移文件。
// 只复制、不覆盖：目标已存在同名文件时跳过。
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeNew, timestampUtc } from "./lib/fs-utils.mjs";
import { overlayBackendAssets } from "./lib/backend.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const assets = join(skillRoot, "assets");

function parseArgs(argv) {
    const args = { flags: new Set(), options: {} };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--name" || a === "--target" || a === "--package") {
            args.options[a.slice(2)] = argv[++i];
        } else if (a.startsWith("--")) {
            args.flags.add(a.slice(2));
        }
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));
const target = resolve(args.options.target ?? process.cwd());

function anyFlag(...names) {
    return names.some(n => args.flags.has(n));
}

if (anyFlag("backend")) {
    overlayBackendAssets({ target, packageName: args.options.package });
}

if (anyFlag("agents")) {
    writeNew(join(target, "AGENTS.md"), readFileSync(join(assets, "AGENTS.template.md")), console.log);
}

if (anyFlag("migration")) {
    const name = args.options.name ?? "migration";
    const file = join(target, `V${timestampUtc()}__${name}.sql`);
    writeNew(file, readFileSync(join(assets, "backend", "migration-template.sql")), console.log);
}

const used = ["backend", "agents", "migration"].filter(n => args.flags.has(n));
if (used.length === 0) {
    console.log("用法: scaffold.mjs [--backend [--package <包名>]] [--agents] [--migration --name <描述>] [--target <目录>]");
    process.exit(1);
}
console.log("\n完成。模板为占位，请按目标项目改包名/表名/字段并复核契约。");
