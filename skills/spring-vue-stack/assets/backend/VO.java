package com.example.app.order.javabean.vo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 订单展示/响应模型：只包含输出契约需要的字段。
 */
@Getter
@Setter
public class OrderVO {

    private UUID id;

    private String orderNo;

    private BigDecimal amount;

    private OffsetDateTime createdAt;
}
