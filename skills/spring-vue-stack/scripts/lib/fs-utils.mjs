// 文件系统工具：目录创建、只写不覆盖、递归复制、UTC 时间戳。
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

export function ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// 写入新文件；已存在则跳过。
export function writeNew(file, content, log = console.log) {
    ensureDir(dirname(file));
    if (existsSync(file)) {
        log(`跳过（已存在）: ${file}`);
        return false;
    }
    writeFileSync(file, content);
    log(`写入: ${file}`);
    return true;
}

// 强制写入（覆盖）。
export function writeOverwrite(file, content, log = console.log) {
    ensureDir(dirname(file));
    writeFileSync(file, content);
    log(`写入: ${file}`);
    return true;
}

// 递归复制目录，目标已存在同名文件时跳过。
export function copyDir(srcDir, destDir, exclude = new Set(), log = console.log) {
    ensureDir(destDir);
    for (const entry of readdirSync(srcDir)) {
        if (exclude.has(entry)) continue;
        const src = join(srcDir, entry);
        if (statSync(src).isDirectory()) {
            copyDir(src, join(destDir, entry), exclude, log);
            continue;
        }
        const dest = join(destDir, entry);
        if (existsSync(dest)) {
            log(`跳过（已存在）: ${dest}`);
            continue;
        }
        writeFileSync(dest, readFileSync(src));
        log(`复制: ${dest}`);
    }
}

// 递归复制目录，支持内容替换与是否覆盖。
export function copyTree(srcDir, destDir, { replace = t => t, overwrite = false, log = console.log } = {}) {
    ensureDir(destDir);
    for (const entry of readdirSync(srcDir)) {
        const src = join(srcDir, entry);
        if (statSync(src).isDirectory()) {
            copyTree(src, join(destDir, entry), { replace, overwrite, log });
        } else {
            const content = replace(readFileSync(src, "utf8"));
            const dest = join(destDir, entry);
            if (overwrite) writeOverwrite(dest, content, log);
            else writeNew(dest, content, log);
        }
    }
}

export function timestampUtc() {
    const d = new Date();
    const p = n => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`
        + `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}
