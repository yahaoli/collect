import axios from 'axios'
import Config from '../../../../config'

const {zdApi, env} = Config;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// axios.defaults.withCredentials = true;
// console.log(Config.zdApi[Config.env]);
// 创建axios实例
const service = axios.create({
	timeout: 15000, // 请求超时时间
	baseURL: zdApi[env],
});
// request拦截器
service.interceptors.request.use(config => {
	config.headers['Content-Type'] = 'text/xml; charset=utf-8';
	config.headers.SOAPAction = `http://12301.cc/IPCService/GetOperationLogs`;
	return config
}, error => {
	// Do something with request error
	console.log(error); // for debug
	return Promise.reject(error)
});

// respone拦截器
service.interceptors.response.use(
	response => {
		return response
	},
	error => {
		console.log(error);
		console.log('err' + error);// for debug
		return Promise.reject(error);
	}
);
/**
 * @export service
 * @function service
 * @example
 *  service({
 *      method: 'post',
 *      url: '',
 *      data: {}
 *  })
 *
 *  service.post('url',data)
 */
export default service;
