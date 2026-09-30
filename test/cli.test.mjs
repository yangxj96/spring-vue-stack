import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const bin = resolve(here, "..", "bin", "spring-vue-stack.mjs");

function runCli(args) {
    return spawnSync(process.execPath, [bin, ...args], { encoding: "utf8" });
}

test("--version prints package version", () => {
    const r = runCli(["--version"]);
    assert.equal(r.status, 0);
    assert.match(r.stdout.trim(), /^\d+\.\d+\.\d+$/);
});

test("--help lists commands", () => {
    const r = runCli(["--help"]);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /spring-vue-stack/);
    assert.match(r.stdout, /scaffold/);
});

test("unknown command exits non-zero", () => {
    const r = runCli(["nope"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /未知命令/);
});

test("no args without TTY prints help", () => {
    const r = runCli([]);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /用法:/);
});
