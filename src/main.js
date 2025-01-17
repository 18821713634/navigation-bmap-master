import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { VueJsonp } from "vue-jsonp";

const app = createApp(App);

app.use(Antd);
// app.use(VueJsonp);
app.mount("#app");
