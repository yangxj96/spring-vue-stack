import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { setupElementPlus } from "./plugins/element-plus";
import { i18n } from "./plugins/i18n";
import { router } from "./plugins/router";

import "./styles/index.scss";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
setupElementPlus(app);

app.mount("#app");
