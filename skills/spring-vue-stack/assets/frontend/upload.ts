import { ApiError } from "./api-error";

/** 上传进度。 */
export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

/**
 * 原生 XHR 上传封装：可获取进度，处理成功/失败/取消/超时。
 * <p>不要手写 Content-Type（由浏览器带 boundary）。
 */
export function upload<T>(path: string, form: FormData, onProgress?: (progress: UploadProgress) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", path);
        const token = localStorage.getItem("access_token");
        if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.timeout = 60000;

        xhr.upload.onprogress = event => {
            if (event.lengthComputable && onProgress) {
                onProgress({
                    loaded: event.loaded,
                    total: event.total,
                    percent: Math.round((event.loaded / event.total) * 100)
                });
            }
        };

        xhr.onload = () => {
            if (xhr.status === 204) {
                resolve(null as T);
                return;
            }
            try {
                const payload = JSON.parse(xhr.responseText) as { code: number; message: string; data: T };
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(payload.data);
                } else {
                    reject(new ApiError(payload.code ?? xhr.status, payload.message ?? "上传失败", payload.data));
                }
            } catch {
                reject(new ApiError(xhr.status, "上传响应解析失败"));
            }
        };
        xhr.onerror = () => reject(new ApiError(0, "上传网络异常"));
        xhr.ontimeout = () => reject(new ApiError(408, "上传超时"));
        xhr.onabort = () => reject(new ApiError(499, "上传已取消"));

        xhr.send(form);
    });
}
