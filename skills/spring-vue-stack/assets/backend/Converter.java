package com.example.app.order.javabean.converter;

import com.example.app.order.javabean.entity.OrderEntity;
import com.example.app.order.javabean.vo.OrderVO;
import org.mapstruct.Mapper;

/**
 * 订单模型转换：只做字段映射，不承载查询、权限或业务决策。
 */
@Mapper(componentModel = "spring")
public interface OrderConverter {

    /**
     * 实体转视图模型。
     *
     * @param entity 订单实体
     * @return 订单视图模型
     */
    OrderVO toVo(OrderEntity entity);
}
