-- 迁移模板（Flyway 时间戳式）：V{yyyyMMddHHmmss}__{描述}.sql，UTC 生成，同一秒冲突用后缀递增。
-- 主键 UUIDv7；表与所有列都必须 COMMENT；已执行迁移不可改内容，只追加新迁移。

CREATE TABLE biz_order (
    id         uuid          NOT NULL DEFAULT uuidv7(),
    order_no   varchar(32)   NOT NULL,
    amount     numeric(18,2) NOT NULL,
    version    bigint        NOT NULL DEFAULT 0,
    created_at timestamptz   NOT NULL,
    created_by varchar(64),
    updated_at timestamptz,
    updated_by varchar(64),
    deleted    boolean       NOT NULL DEFAULT false
);

ALTER TABLE biz_order ADD CONSTRAINT uk_biz_order_order_no UNIQUE (order_no);
CREATE INDEX idx_biz_order_created_at ON biz_order (created_at DESC);

COMMENT ON TABLE  biz_order            IS '业务订单主表';
COMMENT ON COLUMN biz_order.id         IS '主键，UUIDv7';
COMMENT ON COLUMN biz_order.order_no   IS '订单号，全局唯一';
COMMENT ON COLUMN biz_order.amount     IS '订单金额（元），精确到分';
COMMENT ON COLUMN biz_order.version    IS '乐观锁版本号';
COMMENT ON COLUMN biz_order.created_at IS '创建时间（带时区）';
COMMENT ON COLUMN biz_order.created_by IS '创建人标识';
COMMENT ON COLUMN biz_order.updated_at IS '更新时间（带时区）';
COMMENT ON COLUMN biz_order.updated_by IS '更新人标识';
COMMENT ON COLUMN biz_order.deleted    IS '逻辑删除：true 已删除，false 正常';
