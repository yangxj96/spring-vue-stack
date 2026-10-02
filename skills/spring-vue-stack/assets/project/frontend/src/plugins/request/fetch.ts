// 普通请求：基于 fetch 的封装，共用 shared 的地址/请求头/统一壳校验/错误归一化。
import { buildHeaders, buildUrl, DEFAULT_TIMEOUT, normalizeError, unwrap } from "./shared";
import type { ApiEnvelope, RequestOptions } from "./shared";

/** 发送一次普通请求：204 → null；否则解析统一壳，!ok 抛 ApiError，成功返回 data。 */
async function send<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout ?? DEFAULT_TIMEOUT);
    try {
        const response = await fetch(buildUrl(path, options.params), {
            ...options,
            method,
            headers: buildHeaders({
                "Content-Type": "application/json",
                ...(options.headers as Record<string, string> | undefined)
            }),
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            signal: controller.signal
        });

        const payload = response.status === 204 ? null : ((await response.json()) as ApiEnvelope<T>);
        return unwrap<T>(response.status, response.ok, payload);
    } catch (error) {
        throw normalizeError(error);
    } finally {
        clearTimeout(timer);
    }
}

/** fetch 客户端：普通请求（JSON）。业务模块经统一出口 request 使用，不直接调用 fetch。 */
export const fetchClient = {
    get: <T>(path: string, options?: RequestOptions) => send<T>("GET", path, options),
    post: <T>(path: string, options?: RequestOptions) => send<T>("POST", path, options),
    put: <T>(path: string, options?: RequestOptions) => send<T>("PUT", path, options),
    patch: <T>(path: string, options?: RequestOptions) => send<T>("PATCH", path, options),
    delete: <T>(path: string, options?: RequestOptions) => send<T>("DELETE", path, options)
};
