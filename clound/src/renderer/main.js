import Vue from 'vue'
import axios from 'axios'
import router from './router'
import store from './store'
import dbs from "./db";
import ElementUI from 'element-ui';
import {remote} from "electron";
import Config from "@/config";
import NP from "number-precision";

Vue.use(ElementUI);


//全局filter
import toyun from "./filter/toyun";  //把后端返回的以分为单位的价格转成元
import tofen from "./filter/tofen";  //把后端返回的以元为单位的价格转成分
toyun(Vue);
tofen(Vue);


if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;
Vue.http = Vue.prototype.$http = axios
Vue.dbs = Vue.prototype.$dbs = dbs;
Vue.NP = Vue.prototype.$NP = NP;
Vue.MAX_STORAGE_NUM = Vue.prototype.$MAX_STORAGE_NUM = Config.MAX_STORAGE_NUM;
Vue.AJAX_ERROR_TEXT = Vue.prototype.$AJAX_ERROR_TEXT = Config.AJAX_ERROR_TEXT;
Vue.AJAX_TIMEOUT_TEXT = Vue.prototype.$AJAX_TIMEOUT_TEXT = Config.AJAX_TIMEOUT_TEXT;
Vue.Config = Vue.prototype.$config = Config;
Vue.$RemoteService = Vue.prototype.$RemoteService = remote.getGlobal("services");
Vue.prototype.$isNull = function (val) {
	return val === undefined || val === null || val === ''
};

new Vue({
	el: '#app',
	router,
	store
});
