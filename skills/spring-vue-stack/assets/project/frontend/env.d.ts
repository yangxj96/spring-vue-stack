/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** 接口基础地址；未设置时使用同源。 */
    readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "*.vue" {
    import type { DefineComponent } from "vue";

    const component: DefineComponent<object, object, unknown>;
    export default component;
}
