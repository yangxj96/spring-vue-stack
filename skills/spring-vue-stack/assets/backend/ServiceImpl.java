package com.example.app.order.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.app.order.javabean.entity.OrderEntity;
import com.example.app.order.mapper.OrderMapper;
import com.example.app.order.service.OrderService;
import org.springframework.stereotype.Service;

/**
 * 订单服务实现。
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, OrderEntity> implements OrderService {
}
