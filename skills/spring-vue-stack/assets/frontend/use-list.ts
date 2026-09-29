import { ref } from "vue";

/**
 * 列表分页加载的通用状态。
 *
 * @param fetcher 调用方提供的分页请求函数
 * @returns 列表、总数、分页参数与加载方法
 */
export function useList<T>(
    fetcher: (pageNum: number, pageSize: number) => Promise<{ records: T[]; total: number }>
) {
    const loading = ref(false);
    const list = ref<T[]>([]);
    const total = ref(0);
    const pageNum = ref(1);
    const pageSize = ref(20);

    async function load(): Promise<void> {
        loading.value = true;
        try {
            const data = await fetcher(pageNum.value, pageSize.value);
            list.value = data.records;
            total.value = data.total;
        } finally {
            loading.value = false;
        }
    }

    return { loading, list, total, pageNum, pageSize, load };
}
