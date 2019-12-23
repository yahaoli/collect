/*
 * @Author: huangzhiyang
 * @Date: 2017-11-03 16:01:35
 * @Last Modified by: huangzhiyang
 * @Last Modified time: 2018-05-21 12:02:16
 */

import {isArray, isObject, isString} from "lodash";


import Config from "@/config";

const {env,origin,version} = Config;

export const KEY = {
	USER_INFO: `user_info`,
	LAST_REQUEST_TIME_KEY: `last_request_time`,
	COMMON_MAP: `common_map`,
	EXPIRE: `expire`,
	RECENT_ORDER: `recent_order`,
	DEFAULT_USER_SETTING: `default_user_setting`,
	//是否记住密码
	LOGIN_SAVE_PWD: "login_save_pwd",
	//记住的登录用户名
	LOGIN_ACCOUNT_NAME: "login_account_name",
	//记住的登录密码(md5加密过)
	LOGIN_ACCOUNT_PWD: "login_account_pwd",
	// 设置内容
	SETTING_CONTENT: 'setting_content',

	//打印
	PRINT_UUID_KEY : 'print_uuid',

	//购票页面,购票方例表数据
	BUY_TICKET_RELATION_LIST: 'buy_ticket_relation_list',
	//购票页面，散客的产品列表数据
	BUY_TICKET_PRODUCT_LIST_PERSON: 'buy_ticket_product_list_person',
	//购票页面，分销商的产品列表数据
	BUY_TICKET_PRODUCT_LIST_DIS: 'buy_ticket_product_list_dis'

};

const getAccount = () => {
	let userInfo = sessionStorage.getItem(`${env}_${KEY.USER_INFO}`);
	userInfo = userInfo ? JSON.parse(userInfo) : null;
	if(!userInfo) return "";
	return userInfo.account || "";
}

/**
 * 统一获取storage的key值
 * 默认所有要存入storage的key都是要区分开发环境及帐号的，但有些key并不需要要按帐号来分
 * 所以在函数里要做特殊处理
 * @param {string} key
 */
const prefixKey = (key) => {
	if(!isString(key)) return false;
	if(key=="") return false;

	if(key=="print_uuid") return key;

	key = `${origin}_${key}`;

	if(key=="user_info" || key=="login_save_pwd" || key=="login_account_name" || key=="login_account_pwd"){
		return `${env}_${key}`;
	}

	const account = getAccount();

	return `${env}_${account}_${key}`;

}


//localStorage
const Storage = {
	get(key){
		if(!isString(key)) return false;
		if(key=="") return false;
		const _key = prefixKey(key);
		return localStorage.getItem(_key);
	},
	set(key,val){
		if(!isString(key)){
			throw new Error("key must be string");
		}else{
			if(isArray(val) || isObject(val)) {
				try{
					val = JSON.stringify(val);
				}catch(e){
					throw new Error(e);
				}
			}
			const _key = prefixKey(key);
			localStorage.setItem(_key, val);
		}
	},
	remove(key){
		if(isString(key) && key){
			const _key = prefixKey(key);
			localStorage.removeItem(_key);
		}
	}
};
Storage.Session = {
	get(key){
		if(!isString(key)) return false;
		if(key=="") return false;
		const _key = prefixKey(key);
		return sessionStorage.getItem(_key);
	},
	set(key, val){
		if(!isString(key)){
			throw new Error("key must be string");
		}else{
			if(isArray(val) || isObject(val)) {
				try{
					val = JSON.stringify(val);
				}catch(e){
					throw new Error(e);
				}
			}
			const _key = prefixKey(key);
			sessionStorage.setItem(_key, val);
		}
	},
	remove(key){
		if(isString(key) && key){
			const _key = prefixKey(key);
			sessionStorage.removeItem(_key);
		}
	}
};


export default Storage;
