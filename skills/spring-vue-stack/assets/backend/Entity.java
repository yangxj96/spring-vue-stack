package com.example.app.order.javabean.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 订单持久化实体：每个字段显式映射列名，特殊字段按语义追加注解。
 */
@Getter
@Setter
@TableName("biz_order")
public class OrderEntity {

    @TableId(value = "id", type = IdType.INPUT)
    private UUID id;

    @TableField(value = "order_no")
    private String orderNo;

    @TableField(value = "amount")
    private BigDecimal amount;

    @TableField(value = "version")
    @Version
    private Long version;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(value = "created_by", fill = FieldFill.INSERT)
    private String createdBy;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(value = "updated_by", fill = FieldFill.INSERT_UPDATE)
    private String updatedBy;

    @TableField(value = "deleted")
    @TableLogic(value = "false", delval = "true")
    private Boolean deleted;
}
