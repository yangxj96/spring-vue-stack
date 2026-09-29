import { createRouter, createWebHistory } from "vue-router";

/** 应用路由：静态路由；动态/权限路由按项目需要扩展。 */
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("@/views/HomePage.vue"),
            meta: { title: "首页", keepAlive: true }
        }
    ]
});
