<script setup lang="ts">
// 表格页私有搜索组件：关键字 + 查询/重置，就近放在页面目录内（Colocation）。
import { Refresh, Search } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const keyword = defineModel<string>("keyword", { required: true });
const emit = defineEmits<{
    search: [];
    reset: [];
}>();

const { t } = useI18n();
</script>

<template>
    <el-form class="table-search" inline @submit.prevent="emit('search')">
        <el-form-item :label="t('demo.keyword')">
            <el-input
                v-model="keyword"
                :placeholder="t('demo.keywordPlaceholder')"
                clearable
                @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" :icon="Search" @click="emit('search')">{{ t("demo.search") }}</el-button>
            <el-button :icon="Refresh" @click="emit('reset')">{{ t("demo.reset") }}</el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped lang="scss">
.table-search {
    flex: 0 0 auto;
}
</style>
