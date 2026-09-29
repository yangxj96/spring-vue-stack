/** 统一的请求错误：`code` 为 HTTP 状态码，`message` 面向用户，`data` 为可选错误数据。 */
export class ApiError extends Error {
    readonly code: number;

    readonly data: unknown;

    constructor(code: number, message: string, data: unknown = null) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.data = data;
    }
}
