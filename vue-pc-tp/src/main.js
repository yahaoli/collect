import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/utils/routeHooks.js"
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/utils/axios.js";
Vue.use(ElementUI);
Vue.config.productionTip = false;
new Vue({
    router,
    render: h => h(App)
}).$mount("#app");
