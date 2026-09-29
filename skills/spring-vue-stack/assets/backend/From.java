package com.example.app.order.javabean.from;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 创建订单的请求模型。
 */
@Getter
@Setter
public class OrderCreateFrom {

    @NotBlank
    @Size(max = 32)
    private String orderNo;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal amount;
}
