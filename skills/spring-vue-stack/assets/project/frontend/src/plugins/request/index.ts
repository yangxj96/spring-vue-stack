// HTTP 客户端统一出口：普通请求走 fetch，文件上传走 XHR；两者共用 shared 的构建与校验逻辑。
import { fetchClient } from "./fetch";
import { upload } from "./xhr";

/**
 * 统一 HTTP 客户端：业务模块经此发起请求，不直接调用 fetch/XMLHttpRequest。
 * 普通请求用 `request.get/post/put/patch/delete`；文件上传用 `request.upload`。
 */
export const request = {
    ...fetchClient,
    upload
};

export { ApiError } from "./api-error";
export { upload } from "./xhr";
export type { ApiEnvelope, RequestOptions } from "./shared";
export type { UploadOptions, UploadProgress } from "./xhr";
