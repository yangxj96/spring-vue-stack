import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import { getToken } from "@/plugins/request/token";

/** 应用路由：登录页独立，其余页面挂在 Default 布局下。 */
const routes: RouteRecordRaw[] = [
    {
        path: "/Login",
        name: "login",
        component: () => import("@/views/Login/index.vue"),
        meta: { title: "登录", hidden: true }
    },
    {
        path: "/",
        component: () => import("@/layouts/Default/index.vue"),
        redirect: "/Home",
        children: [
            {
                path: "Home",
                name: "home",
                component: () => import("@/views/Home/index.vue"),
                meta: { title: "首页", keepAlive: true }
            },
            {
                path: "About",
                name: "about",
                component: () => import("@/views/About/index.vue"),
                meta: { title: "关于" }
            },
            {
                path: "Examples/Table",
                name: "examples-table",
                component: () => import("@/views/Examples/Table/index.vue"),
                meta: { title: "表格" }
            },
            {
                path: "Examples/Form",
                name: "examples-form",
                component: () => import("@/views/Examples/Form/index.vue"),
                meta: { title: "表单" }
            },
            {
                path: "System/User",
                name: "system-user",
                component: () => import("@/views/System/User/index.vue"),
                meta: { title: "用户" }
            },
            {
                path: "System/Role",
                name: "system-role",
                component: () => import("@/views/System/Role/index.vue"),
                meta: { title: "角色" }
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        redirect: "/Home"
    }
];

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/** 登录守卫：未登录跳登录页并携带来源，已登录访问登录页跳首页。 */
router.beforeEach(to => {
    const token = getToken();
    const authenticated = token !== null && token !== "";
    if (!authenticated && to.path !== "/Login") {
        return { path: "/Login", query: { redirect: to.fullPath } };
    }
    if (authenticated && to.path === "/Login") {
        return { path: "/" };
    }
    return true;
});

/** 根据路由 meta 同步文档标题。 */
router.afterEach(to => {
    const title = typeof to.meta.title === "string" ? to.meta.title : "";
    document.title = title ? `${title} - App` : "App";
});
