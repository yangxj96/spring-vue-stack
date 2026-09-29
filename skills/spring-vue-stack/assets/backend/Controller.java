package com.example.app.order.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.app.common.web.R;
import com.example.app.order.javabean.from.OrderCreateFrom;
import com.example.app.order.javabean.vo.OrderVO;
import com.example.app.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * 订单接口：只做路由、绑定与响应适配，业务规则在 Service。
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 分页查询订单。
     *
     * @param pageNum  页码，从 1 开始（query 参数 page_num）
     * @param pageSize 每页数量（query 参数 page_size）
     * @return 分页数据
     */
    @GetMapping
    public R<Page<OrderVO>> page(
            @RequestParam(name = "page_num", defaultValue = "1") long pageNum,
            @RequestParam(name = "page_size", defaultValue = "20") long pageSize) {
        return R.ok(orderService.pageOrders(pageNum, pageSize));
    }

    /**
     * 创建订单。
     *
     * @param from 创建请求
     * @return 创建后的订单
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public R<OrderVO> create(@Valid @RequestBody OrderCreateFrom from) {
        return R.created(orderService.createOrder(from));
    }

    /**
     * 删除订单（逻辑删除）。
     *
     * @param id 订单主键
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        orderService.deleteOrder(id);
    }
}
