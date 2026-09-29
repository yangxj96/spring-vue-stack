package com.example.app.order.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.app.common.exception.BizError;
import com.example.app.common.exception.BizException;
import com.example.app.order.javabean.converter.OrderConverter;
import com.example.app.order.javabean.entity.OrderEntity;
import com.example.app.order.javabean.from.OrderCreateFrom;
import com.example.app.order.javabean.vo.OrderVO;
import com.example.app.order.mapper.OrderMapper;
import com.example.app.order.service.OrderService;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 订单服务实现。
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, OrderEntity> implements OrderService {

    private final OrderConverter orderConverter;

    public OrderServiceImpl(OrderConverter orderConverter) {
        this.orderConverter = orderConverter;
    }

    /** {@inheritDoc} */
    @Override
    public Page<OrderVO> pageOrders(long pageNum, long pageSize) {
        long size = Math.min(Math.max(pageSize, 1), 100);
        Page<OrderEntity> page = lambdaQuery()
                .orderByDesc(OrderEntity::getCreatedAt)
                .page(new Page<>(Math.max(pageNum, 1), size));
        Page<OrderVO> result = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        result.setRecords(page.getRecords().stream().map(orderConverter::toVo).toList());
        return result;
    }

    /** {@inheritDoc} */
    @Override
    public OrderVO createOrder(OrderCreateFrom from) {
        long exists = lambdaQuery().eq(OrderEntity::getOrderNo, from.getOrderNo()).count();
        if (exists > 0) {
            throw new BizException(BizError.STATE_CONFLICT);
        }
        OrderEntity entity = new OrderEntity();
        entity.setOrderNo(from.getOrderNo());
        entity.setAmount(from.getAmount());
        save(entity);
        return orderConverter.toVo(entity);
    }

    /** {@inheritDoc} */
    @Override
    public void deleteOrder(UUID id) {
        if (getById(id) == null) {
            throw new BizException(BizError.RESOURCE_NOT_FOUND);
        }
        removeById(id);
    }
}
