# 脚手架与资产使用

用于从 `assets/` 复制可复用模板、运行 `scripts/scaffold.mjs` 叠加单点资产，或用 `scripts/init.mjs` 初始化一整套项目。资产是**起点**，复制后必须按目标项目改包名、表名、字段与命名，不要原样提交。

## 资产清单

- `assets/backend/`：`R`、`BizError`/`BizException`、`GlobalExceptionHandler`、`MybatisPlusConfig`、`AuditMetaObjectHandler`、`SnakeCaseWebConfig`、`Jackson3Config`、`Entity`/`From`/`VO`/`Mapper`+XML/`Service`+`ServiceImpl`/`Controller`/`Converter`、`migration-template.sql`。这些模板构成一个**最小可用功能骨架**（订单示例），相互引用可直接编译；复制后按实际业务改名/字段。
- `assets/frontend/`：`request.ts`（fetch）、`upload.ts`（XHR）、`api-error.ts`、`page-result.ts`、`eslint.config.ts`、`.prettierrc.yml`、`.prettierignore`、`stylelint.config.mjs`、`date.ts`、`use-list.ts`、`store.ts`、`route-meta.ts`。
- `assets/project/`：整套项目模板（后端 `pom.xml`/`application.yml`、前端 `package.json`/`vite.config.ts`/`tsconfig*`/`src` 基础文件、仓库级 `.mise.toml`/`.gitignore`/`README.md`/`AGENTS.md`）；由 `init.mjs` 使用。
- `assets/opencode/commands/`：opencode 命令模板。
- `assets/AGENTS.template.md`：目标仓库指令模板。

## 手动使用

1. 选定范围（后端/前端/数据库/AGENTS）。
2. 复制对应文件到目标项目**既有目录结构**中，不要另起平行目录。
3. 替换占位：包名 `com.example.app`、业务域 `order`、表名 `biz_order`、字段与注释；**`.java` 文件名必须与 public 类名一致**（如 `Entity.java` → `OrderEntity.java`、`ServiceImpl.java` → `OrderServiceImpl.java`），否则无法编译。
4. 按 [standard-stack.md](standard-stack.md) 与对应 reference 复核契约（`snake_case`、`R<T>`、UUIDv7、Jackson 3、BEM 等）。
5. 编译/运行与项目门禁通过后再提交。

## 脚本使用

`scripts/scaffold.mjs`（Node，跨平台）：

```bash
# 复制后端模板到目标项目
node scripts/scaffold.mjs --backend --target ../my-app/src/main/java/com/acme/app

# 复制前端模板
node scripts/scaffold.mjs --frontend --target ../my-app-ui/src

# 生成 Flyway 迁移文件（UTC 时间戳命名）
node scripts/scaffold.mjs --migration --target ../my-app/src/main/resources/db/migration --name create_biz_order

# 复制 AGENTS 模板到目标仓库根
node scripts/scaffold.mjs --agents --target ../my-app
```

- 脚本只复制文件、生成时间戳文件名；**不修改既有文件、不覆盖**，目标已存在同名文件时跳过并提示。
- 复制后仍需按上面第 3-5 步人工调整。

## 初始化整套项目（init.mjs）

`scripts/init.mjs` 调用官方生成器并叠加本技能资产，生成后端 + 前端 + 仓库级配置，并完成 opencode 项目级集成。**只写文件，不安装依赖、不构建、不初始化 git**；已存在文件跳过。

```bash
node scripts/init.mjs --target <仓库根> \
  --backend-name yangxj96-skills-admin \
  --frontend-name yangxj96-skills-ui \
  --group com.devops00.skills \
  --package com.devops00.skills.demo \
  --frontend-package yangxj96-skills-ui
```

- **后端**：Spring Initializr 生成（Java 25；web/validation/redis/security/postgresql/flyway/actuator/lombok），再用标准 `pom.xml` 覆盖（加入 MyBatis-Plus、MapStruct、springdoc）并叠加后端资产（按 `package` 声明落位，表列映射 XML 放 `resources/mapper/order`）。
- **前端**：`pnpm create vite --template vue-ts`，再用标准 `package.json`/`vite.config.ts`/`tsconfig*`/`src` 覆盖，并叠加前端资产到 `src/api`、`src/utils`、`src/composables`、`src/stores`、`src/types` 与项目根。
- **仓库级**：写入 `.mise.toml`、`.gitignore`、`README.md`、`AGENTS.md`。
- **opencode**：复制技能到 `.opencode/skills/spring-vue-stack/`，命令模板到 `.opencode/commands/`。
- 需要网络；生成后按提示执行 `mvnw` 与 `pnpm install`。版本敏感坐标以 [version-baseline.md](version-baseline.md) 核对。

与 `scaffold.mjs` 的区别：`init` 生成整套工程；`scaffold` 在已有工程里叠加单点资产或迁移。

## 约束

- 资产中的包名、表名、字段仅为占位；直接使用会导致错误命名。
- 资产遵循当前标准栈；目标项目若显式使用不同方案，以项目为准并同步调整模板。
- 版本敏感的 API（Jackson 3、MyBatis-Plus、springdoc）以 [version-baseline.md](version-baseline.md) 与官方文档核对。
