import { defineStore } from "pinia";
import { ref } from "vue";

/** 全局/跨页面共享状态；业务请求经请求层，不在 store 内直接 fetch。 */
export const useAppStore = defineStore("app", () => {
    const collapsed = ref(false);

    function toggleCollapsed(): void {
        collapsed.value = !collapsed.value;
    }

    return { collapsed, toggleCollapsed };
});
