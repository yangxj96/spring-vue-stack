package com.example.app.common.exception;

/**
 * 业务异常：携带 {@link BizError}，由统一异常处理映射为对应状态码与统一壳。
 */
public class BizException extends RuntimeException {

    private final BizError error;

    public BizException(BizError error) {
        super(error.message());
        this.error = error;
    }

    public BizError error() {
        return error;
    }
}
