<script setup lang="ts">
// 面包屑：模块 / 当前页；模块可点击跳到该模块第一个页面。
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { findTopMenu, firstPath } from "../menu";

/** 面包屑项。 */
interface Crumb {
    key: string;
    label: string;
    /** 有值时可点击；当前页不设置 */
    to?: string;
}

const { t } = useI18n();
const route = useRoute();

const crumbs = computed<Crumb[]>(() => {
    const top = findTopMenu(route.path);
    if (top) {
        const list: Crumb[] = [{ key: top.key, label: t(top.titleKey), to: firstPath(top) }];
        const child = top.children?.find(item => item.path === route.path);
        if (child) {
            list.push({ key: child.key, label: t(child.titleKey) });
        }
        return list;
    }
    const title = typeof route.meta.title === "string" ? route.meta.title : "";
    return title ? [{ key: String(route.name ?? route.path), label: title }] : [];
});
</script>

<template>
    <el-breadcrumb v-if="crumbs.length > 0" class="app-breadcrumb" separator="/">
        <el-breadcrumb-item v-for="crumb in crumbs" :key="crumb.key" :to="crumb.to">
            {{ crumb.label }}
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>
