<script setup lang="ts">
// 整体布局：顶部固定、主体区左右分栏，使用 flex 保证窗口缩放时不错位。
import AppBreadcrumb from "./components/AppBreadcrumb.vue";
import AppHeader from "./components/AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
</script>

<template>
    <div class="app-layout">
        <AppHeader class="app-layout__header" />
        <div class="app-layout__body">
            <AppSidebar class="app-layout__aside" />
            <main class="app-layout__main">
                <AppBreadcrumb class="app-layout__breadcrumb" />
                <div class="app-layout__content">
                    <RouterView />
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;

    &__header {
        flex: 0 0 auto;
    }

    &__body {
        display: flex;
        flex: 1;
        min-height: 0;
    }

    &__aside {
        flex: 0 0 auto;
    }

    &__main {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        gap: 16px;
        padding: 16px;
        overflow: hidden;
    }

    &__breadcrumb {
        flex: 0 0 auto;
    }

    &__content {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
        overflow: auto;
    }
}
</style>
