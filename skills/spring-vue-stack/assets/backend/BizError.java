package com.example.app.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 业务错误：把业务失败映射到最贴切的标准 HTTP 状态。
 * <p>
 * 不设置额外业务子码；code 恒等于 HTTP 状态码。
 */
public enum BizError {

    /** 请求参数不合法 -> 400 */
    PARAM_INVALID("参数不合法", HttpStatus.BAD_REQUEST),

    /** 资源不存在 -> 404 */
    RESOURCE_NOT_FOUND("资源不存在", HttpStatus.NOT_FOUND),

    /** 资源状态冲突或重复提交 -> 409 */
    STATE_CONFLICT("资源状态冲突", HttpStatus.CONFLICT);

    private final String message;

    private final HttpStatus status;

    BizError(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    public String message() {
        return message;
    }

    public HttpStatus status() {
        return status;
    }
}
