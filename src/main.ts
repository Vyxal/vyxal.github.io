import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import "./assets/main.css";

import { Vyxal } from "./helpers/modules";
// import { HelpText } from "./helpers/modules";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.mount("#app");
