import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    buildPlaceholderMap,
    applyPlaceholders,
    DEFAULT_BOOT_VERSION
} from "../skills/spring-vue-stack/scripts/lib/placeholders.mjs";
import { overlayBackendAssets } from "../skills/spring-vue-stack/scripts/lib/backend.mjs";
import { overlayFrontendAssets } from "../skills/spring-vue-stack/scripts/lib/frontend.mjs";
import { resolveSkillDest, installSkill } from "../skills/spring-vue-stack/scripts/lib/skill.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..", "skills", "spring-vue-stack");
const noop = () => {};

test("buildPlaceholderMap derives package path and default boot version", () => {
    const map = buildPlaceholderMap({
        backendDir: "backend-dir",
        backendArtifact: "backend-artifact",
        frontendName: "f",
        group: "com.acme",
        packageName: "com.acme.demo",
        frontendPackage: "acme-ui"
    });
    assert.equal(map.__PACKAGE_PATH__, "com/acme/demo");
    assert.equal(map.__BOOT_VERSION__, DEFAULT_BOOT_VERSION);
    assert.equal(map.__FRONTEND_PACKAGE__, "acme-ui");
    assert.equal(map.__BACKEND_DIR__, "backend-dir");
    assert.equal(map.__BACKEND_ARTIFACT__, "backend-artifact");
});

test("applyPlaceholders replaces every occurrence", () => {
    const out = applyPlaceholders("a __X__ b __X__", { __X__: "y" });
    assert.equal(out, "a y b y");
});

test("overlayBackendAssets places java by package declaration", () => {
    const dir = mkdtempSync(join(tmpdir(), "svs-backend-"));
    try {
        overlayBackendAssets({ target: dir, packageName: "com.acme.demo", log: noop });
        assert.ok(existsSync(join(dir, "src", "main", "java", "com", "acme", "demo", "common", "web", "R.java")));
        assert.ok(existsSync(join(dir, "src", "main", "resources", "mapper", "order", "Mapper.xml")));
        assert.ok(!existsSync(join(dir, "migration-template.sql")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("overlayFrontendAssets copies templates flat", () => {
    const dir = mkdtempSync(join(tmpdir(), "svs-frontend-"));
    try {
        overlayFrontendAssets({ target: dir, log: noop });
        assert.ok(existsSync(join(dir, "request.ts")));
        assert.ok(existsSync(join(dir, "eslint.config.ts")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("resolveSkillDest maps project and global scopes", () => {
    const project = resolveSkillDest({ clientId: "opencode", scope: "project", target: "C:/proj" });
    assert.ok(project.endsWith(join(".opencode", "skills", "spring-vue-stack")));
    const global = resolveSkillDest({ clientId: "opencode", scope: "global" });
    assert.ok(global.endsWith(join(".config", "opencode", "skills", "spring-vue-stack")));
});

test("installSkill copies skill and commands", () => {
    const dir = mkdtempSync(join(tmpdir(), "svs-skill-"));
    try {
        installSkill({
            skillSource: skillRoot,
            clientId: "opencode",
            scope: "project",
            target: dir,
            withCommands: true,
            log: noop
        });
        assert.ok(existsSync(join(dir, ".opencode", "skills", "spring-vue-stack", "SKILL.md")));
        assert.ok(existsSync(join(dir, ".opencode", "commands", "new-feature.md")));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});
