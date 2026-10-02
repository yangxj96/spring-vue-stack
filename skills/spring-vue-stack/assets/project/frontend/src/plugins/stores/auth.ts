import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { clearToken, getToken, setToken as persistToken } from "@/plugins/request/token";

/** 登录请求参数。 */
export interface LoginPayload {
    username: string;
    password: string;
}

/**
 * 认证状态：持有 token 与登录态，登录/退出在此收口。
 * token 不放进普通业务 store 持久化，统一由 request/token 读写。
 */
export const useAuthStore = defineStore("auth", () => {
    const token = ref<string>(getToken() ?? "");
    const isAuthenticated = computed(() => token.value !== "");

    function setToken(value: string): void {
        token.value = value;
        persistToken(value);
    }

    function clear(): void {
        token.value = "";
        clearToken();
    }

    /**
     * 登录。当前为 Mock 实现，便于无后端时验证页面与守卫。
     * 接入后端时替换为真实接口，例如：
     * <pre>
     * const data = await request.post&lt;{ token: string }&gt;("/api/auth/login", payload);
     * setToken(data.token);
     * </pre>
     */
    async function login(payload: LoginPayload): Promise<void> {
        if (!payload.username || !payload.password) {
            throw new Error("用户名或密码不能为空");
        }
        // 模拟网络延迟，便于观察 loading 状态
        await new Promise(resolve => setTimeout(resolve, 300));
        setToken(`mock-token-${Date.now()}`);
    }

    function logout(): void {
        clear();
    }

    return { token, isAuthenticated, setToken, clear, login, logout };
});
