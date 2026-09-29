package com.example.app.configuration;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.PropertyNamingStrategies;

import java.util.TimeZone;

/**
 * Jackson 3 序列化配置（Spring Boot 4 默认）。
 * <p>
 * 统一设置字段命名（snake_case）、未知字段容错与默认时区。时间格式、Long/BigInteger 字符串化、
 * 枚举输出等按项目需要补充；不要在每个 DTO/VO 上重复配置。
 */
@Configuration(proxyBeanMethods = false)
public class Jackson3Config {

    @Bean
    public JsonMapperBuilderCustomizer jsonMapperBuilderCustomizer() {
        return builder -> {
            builder.propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
            builder.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
            builder.defaultTimeZone(TimeZone.getTimeZone("UTC"));
            // 时间格式 / LocalDate(Time) 序列化器、Long 字符串化等按项目需要接入。
        };
    }
}
