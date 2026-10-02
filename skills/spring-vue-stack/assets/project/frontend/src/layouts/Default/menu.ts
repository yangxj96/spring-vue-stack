// 菜单模型：顶层为模块，children 为模块下的页面。
// 顶部导航渲染顶层模块，侧边导航渲染当前模块的 children；新增页面时在此登记，path 与路由保持一致。
import { Collection, EditPen, Grid, HomeFilled, InfoFilled, Key, Odometer, Setting, User } from "@element-plus/icons-vue";

import type { Component } from "vue";

/** 菜单项。 */
export interface MenuItem {
    /** 唯一标识 */
    key: string;
    /** i18n 标题 key */
    titleKey: string;
    /** 图标（@element-plus/icons-vue 组件） */
    icon?: Component;
    /** 叶子节点路由路径；父级模块可省略 */
    path?: string;
    /** 子菜单（模块下的页面） */
    children?: MenuItem[];
}

/** 演示菜单：3 个顶层模块，各含 2 个子页面。 */
export const menuItems: MenuItem[] = [
    {
        key: "dashboard",
        titleKey: "nav.dashboard",
        icon: Odometer,
        children: [
            {
                key: "home",
                titleKey: "nav.home",
                icon: HomeFilled,
                path: "/Home"
            },
            {
                key: "about",
                titleKey: "nav.about",
                icon: InfoFilled,
                path: "/About"
            }
        ]
    },
    {
        key: "examples",
        titleKey: "nav.examples",
        icon: Collection,
        children: [
            {
                key: "examples-table",
                titleKey: "nav.table",
                icon: Grid,
                path: "/Examples/Table"
            },
            {
                key: "examples-form",
                titleKey: "nav.form",
                icon: EditPen,
                path: "/Examples/Form"
            }
        ]
    },
    {
        key: "system",
        titleKey: "nav.system",
        icon: Setting,
        children: [
            {
                key: "system-user",
                titleKey: "nav.user",
                icon: User,
                path: "/System/User"
            },
            {
                key: "system-role",
                titleKey: "nav.role",
                icon: Key,
                path: "/System/Role"
            }
        ]
    }
];

/** 根据当前路径找到所属顶层模块。 */
export function findTopMenu(path: string): MenuItem | undefined {
    return menuItems.find(item => {
        if (item.path === path) {
            return true;
        }
        return item.children?.some(child => child.path === path) ?? false;
    });
}

/** 当前路径对应的侧边菜单项；找不到时回退顶层模块自身。 */
export function sideMenus(path: string): MenuItem[] {
    const top = findTopMenu(path);
    if (!top) {
        return [];
    }
    return top.children ?? [top];
}

/** 顶层模块可跳转的第一个叶子路径。 */
export function firstPath(item: MenuItem): string | undefined {
    if (item.path) {
        return item.path;
    }
    return item.children?.find(child => child.path)?.path;
}
