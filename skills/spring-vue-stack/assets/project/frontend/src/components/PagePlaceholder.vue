<script setup lang="ts">
// 全局共享占位组件：用于演示中尚未实现的页面。
defineProps<{
    /** 页面标题 */
    title: string;
}>();
</script>

<template>
    <div class="page-placeholder">
        <el-empty class="page-placeholder__empty" :description="title" />
    </div>
</template>

<style scoped lang="scss">
.page-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
}
</style>
