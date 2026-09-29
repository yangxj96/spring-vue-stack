/** MyBatis-Plus Page 的响应结构（snake_case 与后端一致）。 */
export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}
