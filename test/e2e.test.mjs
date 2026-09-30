// 端到端组合测试：通过 spawn 调用真实 CLI，覆盖 skill / init(离线) / scaffold 的各种组合。
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const bin = resolve(here, "..", "bin", "spring-vue-stack.mjs");

function cli(args, { cwd, env } = {}) {
    return spawnSync(process.execPath, [bin, ...args], {
        cwd,
        env: { ...process.env, ...env },
        encoding: "utf8"
    });
}

function tmp(prefix) {
    return mkdtempSync(join(tmpdir(), `svs-e2e-${prefix}-`));
}

// B1/B2：project scope 技能安装（含/不含命令模板）
test("skill project scope with and without commands", () => {
    const dir = tmp("skill");
    try {
        let r = cli(["skill", "--target", dir, "--commands"]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir, ".opencode", "skills", "spring-vue-stack", "SKILL.md")));
        assert.ok(existsSync(join(dir, ".opencode", "commands", "new-feature.md")));
        assert.ok(existsSync(join(dir, ".opencode", "commands", "db-migration.md")));

        const dir2 = tmp("skill2");
        try {
            r = cli(["skill", "--target", dir2]);
            assert.equal(r.status, 0, r.stderr);
            assert.ok(existsSync(join(dir2, ".opencode", "skills", "spring-vue-stack", "SKILL.md")));
            assert.ok(!existsSync(join(dir2, ".opencode", "commands")));
        } finally {
            rmSync(dir2, { recursive: true, force: true });
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// B3：已存在时跳过，--overwrite 时替换
test("skill skips existing by default and overwrites with --overwrite", () => {
    const dir = tmp("skill-overwrite");
    try {
        let r = cli(["skill", "--target", dir]);
        assert.equal(r.status, 0, r.stderr);
        const marker = join(dir, ".opencode", "skills", "spring-vue-stack", "SKILL.md");
        writeFileSync(marker, "SENTINEL");

        r = cli(["skill", "--target", dir]);
        assert.equal(r.status, 0, r.stderr);
        assert.equal(readFileSync(marker, "utf8"), "SENTINEL", "默认不应覆盖");

        r = cli(["skill", "--target", dir, "--overwrite"]);
        assert.equal(r.status, 0, r.stderr);
        assert.match(readFileSync(marker, "utf8"), /Spring \+ Vue/, "--overwrite 应替换为技能内容");
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// B4：global scope 使用隔离 HOME
test("skill global scope writes under isolated home", () => {
    const dir = tmp("skill-global");
    const home = join(dir, "home");
    mkdirSync(home, { recursive: true });
    try {
        const r = cli(["skill", "--scope", "global"], {
            cwd: dir,
            env: { USERPROFILE: home, HOME: home }
        });
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(home, ".config", "opencode", "skills", "spring-vue-stack", "SKILL.md")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// B5：未知客户端
test("skill rejects unknown client", () => {
    const dir = tmp("skill-bad");
    try {
        const r = cli(["skill", "--client", "claude", "--target", dir]);
        assert.equal(r.status, 1);
        assert.match(r.stderr, /未知客户端/);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// C1：init 仅前端（离线，预置 package.json 跳过 create-vite）
test("init frontend-only replaces package name and overlays assets", () => {
    const dir = tmp("init-fe");
    try {
        mkdirSync(join(dir, "fe"), { recursive: true });
        writeFileSync(join(dir, "fe", "package.json"), "{}");
        const r = cli([
            "init", "--target", dir, "--frontend",
            "--frontend-name", "fe", "--frontend-package", "acme-ui", "--no-skill"
        ]);
        assert.equal(r.status, 0, r.stderr);
        assert.equal(JSON.parse(readFileSync(join(dir, "fe", "package.json"), "utf8")).name, "acme-ui");
        assert.ok(existsSync(join(dir, "fe", "vite.config.ts")));
        assert.ok(existsSync(join(dir, "fe", "src", "api", "request.ts")));
        assert.ok(existsSync(join(dir, "fe", "eslint.config.ts")));
        assert.ok(existsSync(join(dir, "AGENTS.md")));
        assert.ok(existsSync(join(dir, ".mise.toml")));
        // 单侧生成：仓库文件不应出现未生成的后端名
        const agents = readFileSync(join(dir, "AGENTS.md"), "utf8");
        assert.ok(!agents.includes("yangxj96-skills-admin"), "AGENTS 不应含未生成的后端名");
        assert.ok(agents.includes("fe"));
        assert.match(readFileSync(join(dir, "README.md"), "utf8"), /^# fe$/m);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// C4：--no-skill 不安装 .opencode
test("init --no-skill does not create .opencode", () => {
    const dir = tmp("init-noskill");
    try {
        mkdirSync(join(dir, "fe"), { recursive: true });
        writeFileSync(join(dir, "fe", "package.json"), "{}");
        const r = cli(["init", "--target", dir, "--frontend", "--frontend-name", "fe", "--no-skill"]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(!existsSync(join(dir, ".opencode")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// C5：已有后端工程：生成跳过、已存在资产不被覆盖
test("init backend skips existing pom generation and preserves existing assets", () => {
    const dir = tmp("init-be-existing");
    const pkgPath = join(dir, "be", "src", "main", "java", "com", "acme", "demo", "common", "web");
    try {
        mkdirSync(join(dir, "be"), { recursive: true });
        writeFileSync(join(dir, "be", "pom.xml"), "<project><parent><version>4.1.0</version></parent></project>");
        mkdirSync(pkgPath, { recursive: true });
        writeFileSync(join(pkgPath, "R.java"), "SENTINEL");

        const r = cli([
            "init", "--target", dir, "--backend",
            "--backend-dir", "be", "--package", "com.acme.demo", "--no-skill"
        ]);
        assert.equal(r.status, 0, r.stderr);
        // pom 被标准模板覆盖（含 MyBatis-Plus）
        assert.match(readFileSync(join(dir, "be", "pom.xml"), "utf8"), /mybatis-plus/);
        // 已存在资产保持原样
        assert.equal(readFileSync(join(pkgPath, "R.java"), "utf8"), "SENTINEL");
        // 新资产按包名落位
        assert.ok(existsSync(join(dir, "be", "src", "main", "java", "com", "acme", "demo", "configuration", "MybatisPlusConfig.java")));
        assert.ok(existsSync(join(dir, "be", "src", "main", "resources", "mapper", "order", "Mapper.xml")));
        // 单侧生成：仓库文件不应出现未生成的前端名
        const agents = readFileSync(join(dir, "AGENTS.md"), "utf8");
        assert.ok(!agents.includes("yangxj96-skills-ui"), "AGENTS 不应含未生成的前端名");
        assert.match(readFileSync(join(dir, "README.md"), "utf8"), /^# be$/m);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// D1：scaffold --backend 平铺
test("scaffold backend flat copy", () => {
    const dir = tmp("scaffold-be");
    try {
        const r = cli(["scaffold", "--backend", "--target", dir]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir, "R.java")));
        assert.ok(existsSync(join(dir, "Mapper.xml")));
        assert.ok(!existsSync(join(dir, "migration-template.sql")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// D2：scaffold --backend --package 按包落位
test("scaffold backend with package places by declaration", () => {
    const dir = tmp("scaffold-be-pkg");
    try {
        const r = cli(["scaffold", "--backend", "--package", "com.acme.demo", "--target", dir]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir, "src", "main", "java", "com", "acme", "demo", "common", "web", "R.java")));
        assert.ok(existsSync(join(dir, "src", "main", "resources", "mapper", "order", "Mapper.xml")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// D2b：技能内 scaffold.mjs 也支持 --package（与 CLI 行为一致）
test("skill scaffold.mjs supports --package", () => {
    const dir = tmp("scaffold-script-pkg");
    try {
        const script = resolve(here, "..", "skills", "spring-vue-stack", "scripts", "scaffold.mjs");
        const r = spawnSync(process.execPath, [script, "--backend", "--package", "com.acme.demo", "--target", dir], { encoding: "utf8" });
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir, "src", "main", "java", "com", "acme", "demo", "common", "web", "R.java")));
        assert.ok(existsSync(join(dir, "src", "main", "resources", "mapper", "order", "Mapper.xml")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// D3/D4/D5/D6：前端平铺、agents、migration、组合
test("scaffold frontend/agents/migration and combined", () => {
    const dir = tmp("scaffold-mix");
    try {
        let r = cli(["scaffold", "--frontend", "--target", dir]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir, "request.ts")));
        assert.ok(existsSync(join(dir, "upload.ts")));

        const dir2 = join(dir, "agents");
        r = cli(["scaffold", "--agents", "--target", dir2]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir2, "AGENTS.md")));

        const dir3 = join(dir, "mig");
        r = cli(["scaffold", "--migration", "--name", "create_x", "--target", dir3]);
        assert.equal(r.status, 0, r.stderr);
        const files = readdirSync(dir3);
        assert.ok(files.some(f => /^V\d{14}__create_x\.sql$/.test(f)), `未生成迁移: ${files.join(",")}`);

        const dir4 = join(dir, "combo");
        r = cli(["scaffold", "--backend", "--frontend", "--agents", "--target", dir4]);
        assert.equal(r.status, 0, r.stderr);
        assert.ok(existsSync(join(dir4, "R.java")));
        assert.ok(existsSync(join(dir4, "request.ts")));
        assert.ok(existsSync(join(dir4, "AGENTS.md")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// D7：scaffold 无参数报错
test("scaffold without action exits non-zero", () => {
    const dir = tmp("scaffold-none");
    try {
        const r = cli(["scaffold", "--target", dir]);
        assert.equal(r.status, 1);
        assert.match(r.stderr, /scaffold 需要/);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// E3：validate 在仓库内通过
test("validate passes", () => {
    const r = cli(["validate"]);
    assert.equal(r.status, 0, r.stderr);
});
