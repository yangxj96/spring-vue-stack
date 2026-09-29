package com.example.app.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 将 GET 查询参数的 snake_case 名称适配为 Java 小驼峰，
 * 同时覆盖 {@code @RequestParam} 与查询 From/{@code @ModelAttribute} 两种绑定路径。
 * <p>
 * 说明：这是统一适配的起点。合并后同名的 camelCase 参数优先；同名多值参数与名称冲突按项目定义复核，
 * 不要只在 Controller 中对个别参数手工改名。
 */
@Configuration(proxyBeanMethods = false)
public class SnakeCaseWebConfig {

    @Bean
    public FilterRegistrationBean<SnakeCaseParameterFilter> snakeCaseParameterFilter() {
        FilterRegistrationBean<SnakeCaseParameterFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SnakeCaseParameterFilter());
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    /** 为带下划线的查询参数补充小驼峰别名。 */
    static class SnakeCaseParameterFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            filterChain.doFilter(new SnakeCaseRequestWrapper(request), response);
        }
    }

    /** 请求包装：同时提供原始与 camelCase 参数名。 */
    static class SnakeCaseRequestWrapper extends HttpServletRequestWrapper {

        private final Map<String, String[]> merged;

        SnakeCaseRequestWrapper(HttpServletRequest request) {
            super(request);
            Map<String, String[]> params = new LinkedHashMap<>(request.getParameterMap());
            params.forEach((name, values) -> {
                String camel = toCamel(name);
                if (camel != null && !params.containsKey(camel)) {
                    params.put(camel, values);
                }
            });
            this.merged = params;
        }

        @Override
        public String getParameter(String name) {
            String[] values = merged.get(name);
            return (values == null || values.length == 0) ? null : values[0];
        }

        @Override
        public String[] getParameterValues(String name) {
            return merged.get(name);
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            return merged;
        }

        private static String toCamel(String name) {
            if (name == null || name.indexOf('_') < 0) {
                return null;
            }
            StringBuilder sb = new StringBuilder(name.length());
            boolean upper = false;
            for (char c : name.toCharArray()) {
                if (c == '_') {
                    upper = true;
                } else if (upper) {
                    sb.append(Character.toUpperCase(c));
                    upper = false;
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }
    }
}
