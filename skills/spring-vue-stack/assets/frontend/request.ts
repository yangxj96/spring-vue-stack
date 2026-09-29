import { ApiError } from "./api-error";

/** 统一响应壳：`code` 恒等于 HTTP 状态码。 */
interface R<T> {
    code: number;
    message: string;
    data: T;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
    params?: Record<string, unknown>;
    body?: unknown;
    timeout?: number;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const DEFAULT_TIMEOUT = 15000;

function buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(path, window.location.origin);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.append(key, String(value));
            }
        });
    }
    return url.toString();
}

/** 认证头注入；不要在此打印或记录 token。 */
function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 普通请求：基于 fetch 的统一封装。
 * <p>204 返回 null；否则解析统一壳；!response.ok 抛 ApiError；成功返回 data。
 */
async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout ?? DEFAULT_TIMEOUT);
    try {
        const response = await fetch(buildUrl(path, options.params), {
            ...options,
            method,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
                ...(options.headers ?? {})
            },
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            signal: controller.signal
        });

        if (response.status === 204) {
            return null as T;
        }

        const payload = (await response.json()) as R<T>;
        if (!response.ok) {
            throw new ApiError(payload.code ?? response.status, payload.message ?? "请求失败", payload.data);
        }
        return payload.data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError(408, "请求超时或已取消");
        }
        throw new ApiError(0, "网络异常，请稍后重试");
    } finally {
        clearTimeout(timer);
    }
}

export const http = {
    get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
    post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
    put: <T>(path: string, options?: RequestOptions) => request<T>("PUT", path, options),
    patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
    delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options)
};
