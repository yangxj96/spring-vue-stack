# 契约先行端到端示例

本文件演示一条贯穿「数据库 → 后端 → 前端」的完整纵向切片，展示各标准如何组合应用。示例是**演示**，不是必须逐一照抄；落到目标项目时按仓库实际结构、命名和相邻实现调整。

场景：订单的**分页查询**与**创建、删除**。

## 0. 契约先行

先定 API 契约，再写实现：

| 方法与路径 | 成功 | 说明 |
|---|---|---|
| `GET /api/orders?page_num=1&page_size=20&status=...&order_by=created_at` | `200` | 分页查询，`data` 为 `Page<OrderVO>` |
| `POST /api/orders` | `201` | 创建，`data` 为 `OrderVO`，可带 `Location` |
| `DELETE /api/orders/{id}` | `204` | 删除，空 body |

字段使用 `snake_case`，统一壳 `{code,message,data}`，状态码见 [standard-stack.md](standard-stack.md)。主键 UUIDv7。

## 1. 数据库迁移（Flyway 时间戳式）

`src/main/resources/db/migration/V20240115123045__create_biz_order.sql`

```sql
CREATE TABLE biz_order (
    id            uuid        NOT NULL DEFAULT uuidv7(),
    order_no      varchar(32) NOT NULL,
    customer_name varchar(64) NOT NULL,
    amount        numeric(18,2) NOT NULL,
    status        varchar(20) NOT NULL,
    version       bigint      NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL,
    created_by    varchar(64),
    updated_at    timestamptz,
    updated_by    varchar(64),
    deleted       boolean     NOT NULL DEFAULT false
);

ALTER TABLE biz_order ADD CONSTRAINT uk_biz_order_order_no UNIQUE (order_no);
ALTER TABLE biz_order ADD CONSTRAINT ck_biz_order_status CHECK (status IN ('PENDING','PAID','CANCELLED'));
CREATE INDEX idx_biz_order_created_at ON biz_order (created_at DESC);

COMMENT ON TABLE  biz_order               IS '业务订单主表';
COMMENT ON COLUMN biz_order.id            IS '主键，UUIDv7';
COMMENT ON COLUMN biz_order.order_no      IS '订单号，全局唯一';
COMMENT ON COLUMN biz_order.customer_name IS '客户名称';
COMMENT ON COLUMN biz_order.amount        IS '订单金额（元），精确到分';
COMMENT ON COLUMN biz_order.status        IS '订单状态：PENDING 待支付 / PAID 已支付 / CANCELLED 已取消';
COMMENT ON COLUMN biz_order.version       IS '乐观锁版本号';
COMMENT ON COLUMN biz_order.created_at    IS '创建时间（带时区）';
COMMENT ON COLUMN biz_order.created_by    IS '创建人标识';
COMMENT ON COLUMN biz_order.updated_at    IS '更新时间（带时区）';
COMMENT ON COLUMN biz_order.updated_by    IS '更新人标识';
COMMENT ON COLUMN biz_order.deleted       IS '逻辑删除：true 已删除，false 正常';
```

要点：主键 UUIDv7、审计/软删除/版本列命名统一、绝对时刻用 `timestamptz`、表与所有列都有 `COMMENT`、索引命名 `idx_/uk_/ck_`。见 [postgres.md](postgres.md)。

## 2. 实体、枚举与模型

```java
/** 订单状态：与数据库 status 取值和前端展示一致。 */
public enum OrderStatus {
    /** 待支付 */
    PENDING,
    /** 已支付 */
    PAID,
    /** 已取消 */
    CANCELLED
}

/** 订单持久化实体：每个字段显式映射列名，特殊字段按语义追加注解。 */
@TableName("biz_order")
public class OrderEntity {
    @TableId(value = "id", type = IdType.INPUT)
    private UUID id;
    @TableField(value = "order_no")
    private String orderNo;
    @TableField(value = "customer_name")
    private String customerName;
    @TableField(value = "amount")
    private BigDecimal amount;
    @TableField(value = "status")
    private OrderStatus status;
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

/** 创建订单的请求模型。 */
public class OrderCreateFrom {
    @NotBlank
    @Size(max = 32)
    private String orderNo;
    @NotBlank
    @Size(max = 64)
    private String customerName;
    @NotNull
    @DecimalMin("0.00")
    private BigDecimal amount;
}

/** 订单分页查询的请求模型。 */
public class OrderQueryFrom {
    private OrderStatus status;
    private OffsetDateTime createdFrom;
    private OffsetDateTime createdTo;
}
```

模型按职责放入功能包 `javabean` 对应子目录（entity/from/enum…）；转换用 MapStruct，不手工复制字段。实体每个字段显式 `@TableField(value = "...")` 映射列名，主键用 `@TableId(value = "id", type = ...)`，逻辑删除/乐观锁/自动填充分别用 `@TableLogic`/`@Version`/`fill = FieldFill.*`。见 [backend.md](backend.md)。

## 3. Mapper

```java
public interface OrderMapper extends BaseMapper<OrderEntity> {
}
```

`resources/mapper/order/OrderMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.app.order.mapper.OrderMapper">
    <!-- 复杂条件查询才写 XML；简单 CRUD 用 BaseMapper -->
</mapper>
```

即使暂无自定义语句，也保持接口与 XML 一一对应。见 [backend.md](backend.md) 的 MyBatis-Plus 章节。

## 4. Service：接口写契约，实现不重复注释

```java
/** 订单服务：订单查询与生命周期操作。 */
public interface OrderService extends IService<OrderEntity> {

    /**
     * 分页查询订单。
     *
     * @param query   查询条件
     * @param pageNum 页码，从 1 开始
     * @param pageSize 每页数量，最大 100
     * @return 订单分页数据
     */
    Page<OrderVO> pageOrders(OrderQueryFrom query, long pageNum, long pageSize);

    /**
     * 创建订单。
     *
     * @param from 创建请求
     * @return 创建后的订单
     * @throws BizException 订单号重复或金额非法时抛出
     */
    OrderVO createOrder(OrderCreateFrom from);

    /**
     * 删除订单（逻辑删除）。
     *
     * @param id 订单主键
     * @throws BizException 订单不存在时抛出
     */
    void deleteOrder(UUID id);
}
```

```java
/** 订单服务实现。 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, OrderEntity> implements OrderService {

    private final OrderConverter orderConverter;

    public OrderServiceImpl(OrderConverter orderConverter) {
        this.orderConverter = orderConverter;
    }

    /** {@inheritDoc} */
    @Override
    public Page<OrderVO> pageOrders(OrderQueryFrom query, long pageNum, long pageSize) {
        long size = Math.min(Math.max(pageSize, 1), 100);
        Page<OrderEntity> page = lambdaQuery()
                .eq(query.getStatus() != null, OrderEntity::getStatus, query.getStatus())
                .ge(query.getCreatedFrom() != null, OrderEntity::getCreatedAt, query.getCreatedFrom())
                .le(query.getCreatedTo() != null, OrderEntity::getCreatedAt, query.getCreatedTo())
                .orderByDesc(OrderEntity::getCreatedAt)
                .page(new Page<>(Math.max(pageNum, 1), size));
        return orderConverter.toVoPage(page);
    }

    /** {@inheritDoc} */
    @Override
    @Transactional
    public OrderVO createOrder(OrderCreateFrom from) {
        long exists = lambdaQuery().eq(OrderEntity::getOrderNo, from.getOrderNo()).count();
        if (exists > 0) {
            throw new BizException(BizError.ORDER_NO_DUPLICATED);
        }
        OrderEntity entity = orderConverter.fromCreate(from);
        entity.setStatus(OrderStatus.PENDING);
        save(entity);
        return orderConverter.toVo(entity);
    }

    /** {@inheritDoc} */
    @Override
    public void deleteOrder(UUID id) {
        if (getById(id) == null) {
            throw new BizException(BizError.ORDER_NOT_FOUND);
        }
        removeById(id);
    }
}
```

要点：实现类只写 `{@inheritDoc}` 或完全不写，**不复制接口注释**；审计字段由 `MetaObjectHandler` 填充，业务不手工设置。见 [comments.md](comments.md)。

## 5. Controller

```java
/** 订单接口。 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** 分页查询订单。 */
    @GetMapping
    public R<Page<OrderVO>> page(
            @Validated OrderQueryFrom query,
            @RequestParam(name = "page_num", defaultValue = "1") long pageNum,
            @RequestParam(name = "page_size", defaultValue = "20") long pageSize) {
        return R.ok(orderService.pageOrders(query, pageNum, pageSize));
    }

    /** 创建订单。 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public R<OrderVO> create(@Validated @RequestBody OrderCreateFrom from) {
        return R.created(orderService.createOrder(from));
    }

    /** 删除订单。 */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        orderService.deleteOrder(id);
    }
}
```

要点：`GET` 参数名用 `snake_case` 并映射到小驼峰；创建返回 `201`、删除返回 `204`（无 body）；统一壳由 `R` 承载。见 [standard-stack.md](standard-stack.md)。

## 6. 异常映射

```java
/** 业务异常，携带对应 HTTP 状态。 */
public class BizException extends RuntimeException {
    private final BizError error;

    public BizException(BizError error) {
        super(error.message());
        this.error = error;
    }

    public BizError error() {
        return error;
    }
}

/** 统一异常处理：业务异常映射到标准状态码与统一壳，含未预期异常的兜底。 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public ResponseEntity<R<Void>> handleBiz(BizException ex) {
        HttpStatus status = ex.error().status();
        return ResponseEntity.status(status).body(R.error(status, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<R<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("参数校验失败");
        return ResponseEntity.badRequest().body(R.error(HttpStatus.BAD_REQUEST, message));
    }

    /** 兜底：未预期异常统一返回 500，内部记录完整日志，对外不暴露堆栈与内部细节。 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<R<Void>> handleUnexpected(Exception ex) {
        log.error("未处理的异常", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(R.error(HttpStatus.INTERNAL_SERVER_ERROR, "服务器内部错误"));
    }
}
```

对外不泄露堆栈与内部细节；`code` 恒等于 HTTP 状态；兜底处理器必须存在，避免未预期异常把堆栈暴露给调用方。见 [backend.md](backend.md)。

## 7. 前端 API 模块与类型

`src/types/api/order.ts`（`snake_case` 与线上契约一致）

```ts
/** 订单状态，与后端取值一致。 */
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

/** 订单视图模型。 */
export interface OrderVO {
    id: string;
    order_no: string;
    customer_name: string;
    amount: string;
    status: OrderStatus;
    created_at: string;
}

/** 创建订单请求。 */
export interface OrderCreateFrom {
    order_no: string;
    customer_name: string;
    amount: string;
}

/** 订单分页查询参数。 */
export interface OrderQueryParams {
    page_num?: number;
    page_size?: number;
    status?: OrderStatus;
}
```

`src/api/order.ts`

```ts
import { request } from "@/plugin/request";
import type { PageResult } from "@/types/api/common";
import type { OrderCreateFrom, OrderQueryParams, OrderVO } from "@/types/api/order";

/** 分页查询订单。 */
export function pageOrders(params: OrderQueryParams): Promise<PageResult<OrderVO>> {
    return request.get("/api/orders", { params });
}

/** 创建订单。 */
export function createOrder(data: OrderCreateFrom): Promise<OrderVO> {
    return request.post("/api/orders", data);
}

/** 删除订单。 */
export function deleteOrder(id: string): Promise<void> {
    return request.delete(`/api/orders/${id}`);
}
```

要点：ID 按字符串；金额用字符串；时间字段返回 ISO-8601 字符串（带偏移或 UTC），前端用 dayjs 本地化，不返回无偏移的本地时间；类型集中维护并能与后端同步（优先 OpenAPI 生成）。见 [frontend.md](frontend.md)。

## 8. 前端 Composable 与页面

`src/composables/use-order-list.ts`

```ts
import { ref } from "vue";

import { pageOrders } from "@/api/order";
import type { OrderVO } from "@/types/api/order";

/**
 * 订单列表的分页加载与筛选状态。
 *
 * @returns 列表数据、分页信息与刷新方法
 */
export function useOrderList() {
    const loading = ref(false);
    const list = ref<OrderVO[]>([]);
    const total = ref(0);

    async function load(pageNum = 1, pageSize = 20) {
        loading.value = true;
        try {
            const data = await pageOrders({ page_num: pageNum, page_size: pageSize });
            list.value = data.records;
            total.value = data.total;
        } finally {
            loading.value = false;
        }
    }

    return { loading, list, total, load };
}
```

`src/views/order/OrderListPage.vue`

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { useOrderList } from "@/composables/use-order-list";

const { t } = useI18n();
const { loading, list, total, load } = useOrderList();

onMounted(() => load());
</script>

<template>
    <div class="order-list">
        <el-table v-loading="loading" :data="list" class="order-list__table">
            <el-table-column prop="order_no" :label="t('order.list.orderNo')" />
            <el-table-column prop="customer_name" :label="t('order.list.customer')" />
            <el-table-column prop="amount" :label="t('order.list.amount')" />
        </el-table>
        <el-pagination
            class="order-list__pager"
            layout="total, prev, pager, next"
            :total="total"
            @current-change="load"
        />
    </div>
</template>

<style scoped lang="scss">
.order-list {
    &__table {
        width: 100%;
    }

    &__pager {
        margin-top: 16px;
        justify-content: flex-end;
    }
}
</style>
```

要点：严格 BEM、`script → template → style`、文案走 i18n、请求经 API 模块、加载/空/错误状态齐全。见 [frontend.md](frontend.md) 与 [frontend-lint.md](frontend-lint.md)。

## 9. i18n

```ts
export default {
    order: {
        list: {
            orderNo: "订单号",
            customer: "客户",
            amount: "金额"
        }
    }
};
```

## 10. 测试

- 后端：Service 覆盖创建重复订单号、分页边界、删除不存在的订单；Mapper 集成测试覆盖分页与映射；Controller 覆盖 `201`/`204` 与校验失败 `400`。
- 前端：`useOrderList` 单测覆盖成功、空结果与失败；E2E 覆盖列表加载与创建。

见 [backend.md](backend.md)、[frontend.md](frontend.md) 与 [docs-and-delivery.md](docs-and-delivery.md) 的 Definition of Done。

## 本示例用到的标准清单

- 主键 UUIDv7、审计/软删除/版本列命名、表列 `COMMENT`（[postgres.md](postgres.md)）。
- Flyway 时间戳式迁移、已执行迁移不改（[postgres.md](postgres.md)）。
- MyBatis-Plus `BaseMapper`/`IService`/`ServiceImpl`、实体字段显式 `@TableField(value)`/`@TableId`、`MetaObjectHandler`、`@Version`、`@TableLogic`（[backend.md](backend.md)）。
- 接口 Javadoc 为契约、impl 不重复注释（[comments.md](comments.md)）。
- `snake_case`、统一壳、`200`/`201`/`204`、`Page` 分页、ISO-8601 时间（[standard-stack.md](standard-stack.md)）。
- 前端 `fetch` 请求封装、类型契约同步、BEM、i18n、加载/错误状态（[frontend.md](frontend.md)）。
