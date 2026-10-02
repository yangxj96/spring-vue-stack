// 文件上传：原生 XHR 封装（可获取进度），共用 shared 的地址/认证头/统一壳校验。
import { ApiError } from "./api-error";
import { buildHeaders, buildUrl, DEFAULT_TIMEOUT, unwrap, type ApiEnvelope } from "./shared";

/** 上传进度。 */
export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

/** 上传选项。 */
export interface UploadOptions {
    /** 附加表单字段；`file` 为 File/Blob 时随文件一起提交（FormData 入参时忽略） */
    fields?: Record<string, string>;
    /** 文件字段名，默认 `file`（`file` 为 File/Blob 时生效） */
    fileField?: string;
    /** 超时毫秒 */
    timeout?: number;
    /** 进度回调 */
    onProgress?: (progress: UploadProgress) => void;
    /** 取消信号 */
    signal?: AbortSignal;
}

/**
 * 原生 XHR 上传封装：可获取进度，处理成功/失败/取消/超时。
 * 不要手写 Content-Type（由浏览器带 boundary）。
 */
export function upload<T>(path: string, file: File | Blob | FormData, options: UploadOptions = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", buildUrl(path));
        Object.entries(buildHeaders()).forEach(([key, value]) => xhr.setRequestHeader(key, value));
        xhr.timeout = options.timeout ?? DEFAULT_TIMEOUT;

        const form = file instanceof FormData ? file : new FormData();
        if (!(file instanceof FormData)) {
            form.append(options.fileField ?? "file", file);
            Object.entries(options.fields ?? {}).forEach(([key, value]) => form.append(key, value));
        }

        xhr.upload.onprogress = event => {
            if (event.lengthComputable && options.onProgress) {
                options.onProgress({
                    loaded: event.loaded,
                    total: event.total,
                    percent: Math.round((event.loaded / event.total) * 100)
                });
            }
        };

        xhr.onload = () => {
            try {
                const payload = xhr.status === 204 ? null : (JSON.parse(xhr.responseText) as ApiEnvelope<T>);
                resolve(unwrap<T>(xhr.status, xhr.status >= 200 && xhr.status < 300, payload));
            } catch (error) {
                reject(error instanceof ApiError ? error : new ApiError(xhr.status, "上传响应解析失败"));
            }
        };
        xhr.onerror = () => reject(new ApiError(0, "上传网络异常"));
        xhr.ontimeout = () => reject(new ApiError(408, "上传超时"));
        xhr.onabort = () => reject(new ApiError(499, "上传已取消"));

        if (options.signal) {
            if (options.signal.aborted) {
                xhr.abort();
                return;
            }
            options.signal.addEventListener("abort", () => xhr.abort(), { once: true });
        }

        xhr.send(form);
    });
}
