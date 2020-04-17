import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/utils/axios.js";

Vue.config.productionTip = false;
import "./assets/rem";
import {Toast, Dialog, Notify} from "vant";

Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Notify);
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
