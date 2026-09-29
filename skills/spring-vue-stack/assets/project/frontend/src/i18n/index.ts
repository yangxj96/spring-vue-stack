import { createI18n } from "vue-i18n";

import en from "./locales/en";
import zh from "./locales/zh";

/** 国际化实例：默认中文，回退英文。 */
export const i18n = createI18n({
    legacy: false,
    locale: "zh",
    fallbackLocale: "en",
    messages: { en, zh }
});
