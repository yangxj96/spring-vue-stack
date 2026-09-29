package com.example.app.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.app.order.javabean.entity.OrderEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 订单数据访问：继承 BaseMapper 获得通用 CRUD，复杂查询写在同名 XML。
 */
@Mapper
public interface OrderMapper extends BaseMapper<OrderEntity> {
}
