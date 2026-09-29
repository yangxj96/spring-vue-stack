# 脚手架与资产使用

用于从 `assets/` 复制可复用模板到目标项目，或理解 `scripts/scaffold.mjs` 的行为。资产是**起点**，复制后必须按目标项目改包名、表名、字段与命名，不要原样提交。

## 资产清单

- `assets/backend/`：`R`、`BizError`/`BizException`、`GlobalExceptionHandler`、`MybatisPlusConfig`、`AuditMetaObjectHandler`、`SnakeCaseWebConfig`、`Jackson3Config`、`Entity`/`From`/`VO`/`Mapper`+XML/`Service`+`ServiceImpl`/`Controller`/`Converter`、`migration-template.sql`。这些模板构成一个**最小可用功能骨架**（订单示例），相互引用可直接编译；复制后按实际业务改名/字段。
- `assets/frontend/`：`request.ts`（fetch）、`upload.ts`（XHR）、`api-error.ts`、`page-result.ts`、`eslint.config.ts`、`.prettierrc.yml`、`.prettierignore`、`stylelint.config.mjs`、`date.ts`、`use-list.ts`、`store.ts`、`route-meta.ts`。
- `assets/AGENTS.template.md`：目标仓库指令模板。

## 手动使用

1. 选定范围（后端/前端/数据库/AGENTS）。
2. 复制对应文件到目标项目**既有目录结构**中，不要另起平行目录。
3. 替换占位：包名 `com.example.app`、业务域 `order`、表名 `biz_order`、字段与注释。
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

## 约束

- 资产中的包名、表名、字段仅为占位；直接使用会导致错误命名。
- 资产遵循当前标准栈；目标项目若显式使用不同方案，以项目为准并同步调整模板。
- 版本敏感的 API（Jackson 3、MyBatis-Plus、springdoc）以 [version-baseline.md](version-baseline.md) 与官方文档核对。
