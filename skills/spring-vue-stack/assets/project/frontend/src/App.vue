<script setup lang="ts">
// 应用根：通过 ElConfigProvider 让 Element Plus 组件语言跟随 vue-i18n。
import { useElementPlusLocale } from "./plugins/element-plus";

const elementLocale = useElementPlusLocale();
</script>

<template>
    <el-config-provider :locale="elementLocale">
        <RouterView />
    </el-config-provider>
</template>
