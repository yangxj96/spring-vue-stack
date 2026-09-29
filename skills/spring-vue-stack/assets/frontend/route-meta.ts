import "vue-router";

/** 路由 meta 约定：驱动守卫、菜单/面包屑/多页签。 */
declare module "vue-router" {
    interface RouteMeta {
        /** 页面标题，用于文档标题与页签 */
        title?: string;
        /** 访问所需权限标识 */
        permission?: string;
        /** 是否缓存页面 */
        keepAlive?: boolean;
        /** 是否在菜单中隐藏 */
        hidden?: boolean;
    }
}
