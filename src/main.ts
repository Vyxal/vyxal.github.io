import { createApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import "./assets/main.css";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.mount("#app");
