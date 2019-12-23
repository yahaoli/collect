import axios from "axios";
import {Message} from "element-ui";
import Messages from "@/util/message";
// import qs from "qs";
import Config from "@/config";
import Storage, {KEY} from "@/util/storage";
import md5 from "js-md5";
import {Base64} from "js-base64";

const {env, envList, memberList, app_id, secret} = Config;
const requestUrl = envList[env];
const memberUrl = memberList[env];
const AJAX_TIMEOUT_TEXT = Config.AJAX_TIMEOUT_TEXT;
const AJAX_ERROR_TEXT = Config.AJAX_ERROR_TEXT;
const httpRequestError = (status, statusText) => {
	Message.error(`请求出错 status: ${status} statusText: ${statusText}`);
};
axios.defaults.timeout = 20000;
const delay = (time, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, time);
	});
};

//添加request拦截器
axios.interceptors.request.use(config => {
	if(config.headers){
		config["headers"] = config.headers
	}else{
		config["headers"] = {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			Accept: "application/json"
		};
	}

	if (!config.urlType) {
		const userInfo = Storage.Session.get(KEY.USER_INFO)
			? JSON.parse(Storage.Session.get(KEY.USER_INFO))
			: {};
		const token = userInfo.token || "";
		const account = userInfo.account || "";
		const nowTime = new Date().getTime();
		let data = config.data || (config.data = {});
		let params = data.params || {};
		data["app_id"] = Config.app_id;
		let method = data.method || "";
		let timestamp = (data["timestamp"] = Math.round(nowTime / 1000));
		if (env !== "prod") {
			config.data["__zzzz__"] = {...params};
		}
		params["token"] = token;
		//每个请求，如果没带account，这边会自动补上去
		if (!params.account) params["account"] = account;

		params = Base64.encode(JSON.stringify(params));
		config.data["signature"] = md5(md5(method + secret + timestamp + params));
		config.data["params"] = params;

		Storage.Session.set(KEY.LAST_REQUEST_TIME_KEY, nowTime);
	} else {
		// console.log(config.postType);
		if (config.postType) {
			let initData=config.data.params,
				dataArr=[];
			for(var key in initData){
				dataArr.push(`${key}=${initData[key]}`)
			}
			config.data=dataArr.join('&')
		} else {
			config["headers"]["Content-Type"] = "application/json"
		}
	}
	// config.data = qs.stringify(config.data);
	return config;
});
//添加response拦截器
axios.interceptors.response.use(
	response => {
		if (response.status == 200) {
			return response.data;
		} else {
			httpRequestError(res.status, res.statusText);
			return response.data;
		}
	},
	error => {
		if (error.toString().includes('timeout')) {
			Messages.error('网络故障，请检查网络。');
			Messages.closeLoading()
		} else {
			Messages.closeLoading()
			Message.error('网络故障，请检查网络。');
			//Message.error(error.toString());
		}

		return null;
	}
);

/**
 * 全局请求方法
 * @param {*} url 请求路径
 * @param {*} opt
 *
 * 调用的时候请使用固定格式，因为这是跟后端统一约定好了的
 *
 * request("api.12301.test/v1/",{
 *      type : "post",      //默认用post请求
 * 	    method : "getList"  //调用后端接口的哪个方法  传方法名称
 * 		params : {          //传给后端的数据
 * 			page : 1,
 * 			pid : 12
 * 		}
 * })
 *
 */
function request(url, opt,member) {
	opt = opt || {};
	var urlType;
	if (url === "/") {
		url = requestUrl
	} else if (url === '/member') {
		url = memberUrl;
		urlType = 'duo'
	}
	opt.versionStr === undefined ? (url += "v1/") : (url += opt.versionStr);
	url.endsWith("/") ? null : (url += "/");
	let jsonData={
		method: opt.method || "post",
		params: opt.params
	};
	if(member){
		jsonData= {
			params:opt.params
		};
		console.log(opt.params)

	}else{
		if(opt.postType){
			jsonData={
				params: opt.params
			}
		}
	}
	let config = {
		url: url,
		postType:opt.postType,
		method: opt.type || "post",
		urlType: urlType,
		data: jsonData,
		headers: opt.header
	}
	return axios(config);
}

export default request;
