import axios from "axios";
import {Loading, Message} from "element-ui";
import Qs from 'qs';
const defaultContentType = 'application/x-www-form-urlencoded;charset=UTF-8';
window.$axios = axios.create({
  timeout: 10000
  //headers: defaultContentType
});
window.$axios.interceptors.request.use(requestBefore, requestBeforeError);
// 添加响应拦截器
window.$axios.interceptors.response.use(requestAfter, requestAfterError);
window.$upload = axios.create({
  timeout: 10000,
  upload: true
});
window.$upload.interceptors.request.use(requestBefore, requestBeforeError);

// 添加响应拦截器
window.$upload.interceptors.response.use(requestAfter, requestAfterError);

function requestBefore(config) {
  // 在发送请求之前做些什么
  //添加自定义loading来判断是否要出现蒙版加载
  if (config.method === 'post' && config.headers['Content-Type'] === defaultContentType) {
    config.data = Qs.stringify(config.data, { arrayFormat: 'repeat' });
  }
  config.loading && (config.loading = Loading.service({
    lock: true,
    text: "Loading",
    spinner: "el-icon-loading",
    background: 'rgba(0, 0, 0, 0.7)'
  }));
  return config;
}

function requestBeforeError(error) {
  // 对请求错误做些什么
  return Promise.reject(error);
}

function requestAfter(response) {
  // 对响应数据做点什么
  let config = response.config;
  config.loading && config.loading.close();
  if (response.data) {
    return response.data;
  } else {
    Message.error("请求出错，请重试");
    return Promise.reject("");
  }
}

function requestAfterError(error) {
  // 对响应错误做点什么
  let config = error.config;
  config.loading && config.loading.close();
  Message.error("请求出错，请重试");
  return Promise.reject(error);
}
