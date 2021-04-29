import Vue from "vue";
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import App from "./App.vue";
import router from "./router";
import store from './store'
import "@/utils/routeHooks.js"
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import '@/styles/index.scss' // global css
import "@/utils/axios.js";
import '@/icons' // icon
Vue.use(ElementUI, { size: 'small' });
Vue.config.productionTip = false;
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
