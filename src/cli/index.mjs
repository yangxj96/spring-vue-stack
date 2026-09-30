// CLI 入口：解析参数并分派到交互向导或非交互子命令。
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "./args.mjs";
import { packageRoot } from "./paths.mjs";
import { runSkill, runInit, runScaffold, runValidate } from "./commands.mjs";
import { runWizard } from "./wizard.mjs";

const HELP = `spring-vue-stack — Spring Boot 4 + Vue 3 技术栈技能与脚手架

用法:
  spring-vue-stack                  进入交互向导（推荐）
  spring-vue-stack install          同交互向导（别名 wizard）
  spring-vue-stack skill [选项]     安装技能到客户端
  spring-vue-stack init  [选项]     新建整套后端/前端工程
  spring-vue-stack scaffold [选项]  向已有工程叠加资产
  spring-vue-stack validate [选项]  校验技能包
  spring-vue-stack help | version   帮助 / 版本

通用选项:
  -h, --help                        显示帮助
  -v, --version                     显示版本

skill:
  --client <id>      客户端（默认 opencode）
  --scope <scope>    project | global（默认 project）
  --target <dir>     项目根目录（项目级安装用，默认 .）
  --commands         同时安装命令模板（默认不装；交互向导里默认安装）
  --overwrite        已存在时覆盖技能目录（默认不覆盖）

init:
  --target <dir>          目标仓库根（默认 .）
  --backend-dir <name>    后端目录名（默认 yangxj96-skills-admin）
  --group <groupId>       后端 groupId（默认 com.devops00.skills）
  --backend-artifact <id> 后端 artifactId（默认取 --backend-dir）
  --package <pkg>         后端包名（默认 <group>.demo）
  --frontend-name <name>  前端目录（默认 yangxj96-skills-ui）
  --frontend-package <p>  前端包名（默认取 --frontend-name）
  --boot-version <ver>    Spring Boot 版本
  --initializr <url>      Spring Initializr 地址
  --backend / --frontend  只生成其一（默认两者）
  --no-skill              不安装 opencode 技能

scaffold:
  --backend [--package <pkg>]  --frontend  --agents  --migration --name <描述>  --target <dir>
  （--backend 带 --package 时按包名落位，否则平铺复制）

validate:
  --root <dir>       指定校验的仓库根（默认自动探测）

release:
  发布到官方 npm 源：npm run release [-- --dry-run] [-- --bump patch|minor|major]
    [-- --tag <dist-tag>] [-- --otp <code>] [-- --skip-verify] [-- --git]

示例:
  npx @yangxj96/spring-vue-stack
  npx @yangxj96/spring-vue-stack skill --client opencode --scope project --commands
  npx @yangxj96/spring-vue-stack init --target . --package com.acme.demo --frontend-name acme-ui`;

function printVersion() {
    const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
    console.log(pkg.version);
}

export async function run(argv) {
    const { command, options, flags } = parseArgs(argv);

    if (flags.has("help") || command === "help") {
        console.log(HELP);
        return;
    }
    if (flags.has("version") || command === "version") {
        printVersion();
        return;
    }

    switch (command) {
        case undefined:
        case "install":
        case "wizard":
            if (process.stdin.isTTY) {
                return runWizard();
            }
            console.log(HELP);
            return;
        case "skill":
            return runSkill({ options, flags });
        case "init":
            return runInit({ options, flags });
        case "scaffold":
            return runScaffold({ options, flags });
        case "validate": {
            const positionals = [];
            if (options.root) positionals.push("--root", String(options.root));
            return runValidate({ positionals });
        }
        default:
            console.error(`未知命令: ${command}\n`);
            console.log(HELP);
            process.exitCode = 1;
    }
}
