---
description: 按 spring-vue-stack 技能生成 Flyway 时间戳迁移
---

生成数据库迁移：$ARGUMENTS

要求：

1. 读取 `postgres.md` 与 `references/scaffolding.md`。
2. 迁移文件命名为 `V{yyyyMMddHHmmss}__{描述}.sql`（UTC、14 位定长）。
3. 新表主键用 UUIDv7（`uuidv7()`）；表与所有列添加 `COMMENT`。
4. 已执行迁移不改内容；高风险变更拆分并说明回滚与兼容性。
