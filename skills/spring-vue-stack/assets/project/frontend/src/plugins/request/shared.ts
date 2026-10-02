// 请求层共用逻辑：地址与参数构建、公共请求头、统一壳校验与错误归一化。
import { ApiError } from "./api-error";
import { getToken } from "./token";

/** 接口基础地址；未配置 VITE_API_BASE_URL 时使用同源。 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** 默认超时（毫秒）。 */
export const DEFAULT_TIMEOUT = 15000;

/** 统一响应壳：`code` 恒等于 HTTP 状态码。 */
export interface ApiEnvelope<T> {
    code: number;
    message: string;
    data: T;
}

/** 普通请求选项：在 fetch 基础上补充查询参数、body 与超时。 */
export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
    params?: Record<string, unknown>;
    body?: unknown;
    timeout?: number;
}

/** 拼接基础地址与查询参数；空值（undefined/null/空串）不入参。 */
export function buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(path, BASE_URL || window.location.origin);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.append(key, String(value));
            }
        });
    }
    return url.toString();
}

/** 公共请求头：注入认证头；不含 Content-Type，由调用方按需补充。不要在此打印或记录 token。 */
export function buildHeaders(extra?: HeadersInit): Record<string, string> {
    const token = getToken();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra as Record<string, string> | undefined)
    };
}

/** 统一校验响应壳：204 返回 null；!ok 抛 ApiError；成功返回 data。 */
export function unwrap<T>(status: number, ok: boolean, payload: ApiEnvelope<T> | null): T {
    if (status === 204) {
        return null as T;
    }
    if (!ok) {
        throw new ApiError(payload?.code ?? status, payload?.message ?? "请求失败", payload?.data);
    }
    return payload?.data as T;
}

/** 网络/超时/取消异常归一化为 ApiError。 */
export function normalizeError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
        return new ApiError(408, "请求超时或已取消");
    }
    return new ApiError(0, "网络异常，请稍后重试");
}
