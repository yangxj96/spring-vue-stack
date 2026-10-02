<script setup lang="ts">
// 顶部栏：左侧品牌（图标+名称）、中间横向模块导航、最右用户头像。
import { User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/plugins/stores/auth";

import { findTopMenu, firstPath, menuItems, type MenuItem } from "../menu";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

/** 当前高亮的顶层模块。 */
const activeTop = computed(() => findTopMenu(route.path)?.key ?? "");

/** 点击顶层模块：跳转到其第一个可达页面。 */
function handleTop(item: MenuItem): void {
    const path = firstPath(item);
    if (path && path !== route.path) {
        void router.push(path);
    }
}

/** 退出登录并回到登录页。 */
function handleLogout(): void {
    authStore.logout();
    ElMessage.success(t("nav.logoutSuccess"));
    void router.replace("/Login");
}
</script>

<template>
    <header class="app-header">
        <RouterLink class="app-header__brand" to="/Home">
            <svg class="app-header__logo" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="var(--el-color-primary)" />
                <path d="M9 21V11h3.4l3.6 6 3.6-6H23v10h-3v-5.1l-3 4.6h-.8l-3-4.6V21H9z" fill="#fff" />
            </svg>
            <span class="app-header__name">{{ t("app.name") }}</span>
        </RouterLink>

        <nav class="app-header__nav">
            <el-menu :default-active="activeTop" mode="horizontal" :ellipsis="false" class="app-header__menu">
                <el-menu-item v-for="item in menuItems" :key="item.key" :index="item.key" @click="handleTop(item)">
                    <el-icon class="app-header__menu-icon"><component :is="item.icon" /></el-icon>
                    <span>{{ t(item.titleKey) }}</span>
                </el-menu-item>
            </el-menu>
        </nav>

        <div class="app-header__actions">
            <el-dropdown trigger="click">
                <el-avatar :size="32" :icon="User" class="app-header__avatar" />
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleLogout">{{ t("nav.logout") }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>
</template>

<style scoped lang="scss">
.app-header {
    display: flex;
    height: 60px;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);

    &__brand {
        display: flex;
        flex: 0 0 var(--app-sidebar-width);
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        color: var(--el-text-color-primary);
        text-decoration: none;
    }

    &__logo {
        width: 32px;
        height: 32px;
    }

    &__name {
        font-size: 18px;
        font-weight: 600;
        white-space: nowrap;
    }

    &__nav {
        flex: 1;
        min-width: 0;
        overflow: hidden;
    }

    &__menu {
        height: 100%;
        border-bottom: none;
    }

    &__menu-icon {
        margin-right: 6px;
    }

    &__actions {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        padding: 0 16px;
    }

    &__avatar {
        cursor: pointer;
    }
}
</style>
