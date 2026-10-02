// 认证 token 的本地存取：request 与 auth store 共用，避免双向依赖。

const TOKEN_KEY = "access_token";

/** 读取 token；未登录返回 null。 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/** 写入 token。 */
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/** 清除 token。 */
export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}
