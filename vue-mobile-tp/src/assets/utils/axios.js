import axios from "axios";
import {Toast} from "vant";

window.$axios = axios.create({
  timeout: 10000
  //headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
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
  config.loading && (config.loading = Toast.loading({
    message: "加载中...",
    forbidClick: true,
    duration: 0
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
  config.loading && config.loading.clear();
  if (response.data) {
    return response.data;
  } else {
    Toast("请求出错，请重试");
    return Promise.reject("");
  }
}

function requestAfterError(error) {
  // 对响应错误做点什么
  let config = error.config;
  config.loading && config.loading.clear();
  Toast("请求出错，请重试");
  return Promise.reject(error);
}
