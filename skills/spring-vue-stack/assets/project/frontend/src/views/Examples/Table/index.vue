<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import TableSearch from "./components/TableSearch.vue";

/** 演示表格行。 */
interface DemoRow {
    id: number;
    name: string;
    status: string;
}

const { t } = useI18n();

const allRows: DemoRow[] = [
    { id: 1, name: "订单 A", status: "PENDING" },
    { id: 2, name: "订单 B", status: "PAID" },
    { id: 3, name: "订单 C", status: "CANCELLED" }
];

const keyword = ref("");
const rows = ref<DemoRow[]>(allRows);
const current = ref(1);
const size = ref(10);
const total = ref(allRows.length);

/** 查询（演示为本地过滤；接入后端时改为请求接口并回填分页）。 */
function handleSearch(): void {
    current.value = 1;
    const kw = keyword.value.trim();
    rows.value = kw ? allRows.filter(row => row.name.includes(kw)) : allRows;
    total.value = rows.value.length;
}

/** 重置查询条件。 */
function handleReset(): void {
    keyword.value = "";
    handleSearch();
}

/** 翻页（演示为单页数据；接入后端时按 current/size 请求）。 */
function handlePageChange(page: number): void {
    current.value = page;
}
</script>

<template>
    <div class="demo-table">
        <TableSearch v-model:keyword="keyword" @search="handleSearch" @reset="handleReset" />

        <div class="demo-table__body">
            <el-table :data="rows" class="demo-table__table">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" :label="t('demo.name')" />
                <el-table-column prop="status" :label="t('demo.status')" />
            </el-table>
        </div>

        <div class="demo-table__pager">
            <el-pagination
                layout="total, prev, pager, next"
                :total="total"
                :current-page="current"
                :page-size="size"
                @current-change="handlePageChange" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.demo-table {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    gap: 16px;

    &__body {
        flex: 1;
        min-height: 0;
        overflow: auto;
    }

    &__table {
        width: 100%;
    }

    &__pager {
        display: flex;
        flex: 0 0 auto;
        justify-content: flex-end;
    }
}
</style>
