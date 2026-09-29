package com.example.app.order.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.app.order.javabean.entity.OrderEntity;
import com.example.app.order.javabean.from.OrderCreateFrom;
import com.example.app.order.javabean.vo.OrderVO;

import java.util.UUID;

/**
 * 订单服务：声明业务操作契约，实现类不重复本接口的 Javadoc。
 */
public interface OrderService extends IService<OrderEntity> {

    /**
     * 分页查询订单。
     *
     * @param pageNum  页码，从 1 开始
     * @param pageSize 每页数量，最大 100
     * @return 订单分页数据
     */
    Page<OrderVO> pageOrders(long pageNum, long pageSize);

    /**
     * 创建订单。
     *
     * @param from 创建请求
     * @return 创建后的订单
     * @throws com.example.app.common.exception.BizException 订单号重复时抛出
     */
    OrderVO createOrder(OrderCreateFrom from);

    /**
     * 删除订单（逻辑删除）。
     *
     * @param id 订单主键
     * @throws com.example.app.common.exception.BizException 订单不存在时抛出
     */
    void deleteOrder(UUID id);
}
