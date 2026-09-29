package com.example.app.common.web;

import java.io.Serializable;

/**
 * 统一响应壳：{@code code} 恒等于本次 HTTP 状态码。
 *
 * @param code    与 HTTP 状态码一致的状态码
 * @param message 面向调用方的可读信息
 * @param data    业务数据；无数据时为 {@code null}
 * @param <T>     业务数据类型
 */
public record R<T>(int code, String message, T data) implements Serializable {

    /**
     * 成功读取 / 更新（HTTP 200）。
     *
     * @param data 业务数据
     * @return 成功响应
     */
    public static <T> R<T> ok(T data) {
        return new R<>(200, "OK", data);
    }

    /**
     * 新建成功（HTTP 201）。
     *
     * @param data 创建后的数据
     * @return 创建成功响应
     */
    public static <T> R<T> created(T data) {
        return new R<>(201, "Created", data);
    }

    /**
     * 失败响应：错误一定有 body。
     *
     * @param code    HTTP 状态码
     * @param message 面向调用方的可读信息
     * @return 失败响应
     */
    public static <T> R<T> error(int code, String message) {
        return new R<>(code, message, null);
    }
}
