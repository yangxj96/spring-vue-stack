import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { computed, type App } from "vue";
import { useI18n } from "vue-i18n";

/** Element Plus 语言包：与 vue-i18n 的 locale 一一对应。 */
const elementLocales = { zh: zhCn, en };

/** 注册 Element Plus 组件库与全局样式。 */
export function setupElementPlus(app: App): void {
    app.use(ElementPlus);
}

/** 当前 Element Plus 语言包，跟随 vue-i18n 的 locale；在根组件 setup 中调用。 */
export function useElementPlusLocale() {
    const { locale } = useI18n();
    return computed(() => elementLocales[locale.value as keyof typeof elementLocales] ?? en);
}
