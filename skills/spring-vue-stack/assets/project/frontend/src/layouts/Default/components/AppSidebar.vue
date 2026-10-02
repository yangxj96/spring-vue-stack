<script setup lang="ts">
// 左侧导航：渲染当前顶层模块下的子菜单。
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { sideMenus } from "../menu";

const { t } = useI18n();
const route = useRoute();

const items = computed(() => sideMenus(route.path));
</script>

<template>
    <aside class="app-sidebar">
        <el-menu :default-active="route.path" router class="app-sidebar__menu">
            <el-menu-item v-for="item in items" :key="item.key" :index="item.path ?? item.key" :disabled="!item.path">
                <el-icon class="app-sidebar__icon"><component :is="item.icon" /></el-icon>
                <span>{{ t(item.titleKey) }}</span>
            </el-menu-item>
        </el-menu>
    </aside>
</template>

<style scoped lang="scss">
.app-sidebar {
    width: var(--app-sidebar-width);
    height: 100%;
    border-right: 1px solid var(--el-border-color);

    &__menu {
        height: 100%;
        border-right: none;
    }

    &__icon {
        margin-right: 8px;
    }
}
</style>
