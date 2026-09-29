package com.example.app.configuration;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * 审计字段自动填充：创建/更新时间由 UTC 时钟写入。
 * <p>
 * 人员标识（createdBy/updatedBy）按项目安全上下文填充；禁止在 Controller/Service 手工设置这些字段。
 */
@Component
public class AuditMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        strictInsertFill(metaObject, "createdAt", OffsetDateTime.class, now);
        strictInsertFill(metaObject, "updatedAt", OffsetDateTime.class, now);
        // strictInsertFill(metaObject, "createdBy", String.class, currentUserId());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        strictUpdateFill(metaObject, "updatedAt", OffsetDateTime.class, OffsetDateTime.now(ZoneOffset.UTC));
        // strictUpdateFill(metaObject, "updatedBy", String.class, currentUserId());
    }
}
