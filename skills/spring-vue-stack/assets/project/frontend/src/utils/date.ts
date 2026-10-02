import dayjs from "dayjs";

/** 展示层统一日期格式。 */
export const DATE_FORMAT = "YYYY-MM-DD";

/** 展示层统一日期时间格式。 */
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

/**
 * 格式化日期；后端返回 ISO-8601（带偏移或 UTC），此处转为用户本地展示。
 *
 * @param value ISO-8601 字符串
 * @returns 本地日期字符串；空值返回空串
 */
export function formatDate(value?: string | null): string {
    return value ? dayjs(value).format(DATE_FORMAT) : "";
}

/**
 * 格式化日期时间；后端返回 ISO-8601（带偏移或 UTC），此处转为用户本地展示。
 *
 * @param value ISO-8601 字符串
 * @returns 本地日期时间字符串；空值返回空串
 */
export function formatDateTime(value?: string | null): string {
    return value ? dayjs(value).format(DATETIME_FORMAT) : "";
}
