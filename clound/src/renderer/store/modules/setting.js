import * as Type from '../mutation-types'
import Config from '../../config'
import router from '../../router'
import {remote} from 'electron'
import Storage, {KEY} from "../../util/storage";
// 获取当前的window对象
const win = remote.getCurrentWindow();

let setting = {
	state: {
		show: false,
		repertory: {
			// 密码
			enter: {
				timeStr: 0,
				sure: false
			},
			// 功能列表
			options: [
				{
					type: 'booking',
					name: '购票',
					disabled: true,
				},
				{
					type: 'picking',
					name: '取票',
					disabled: false,
				},
				{
					type: 'refund',
					name: '退票',
					disabled: false,
				},
				{
					type: 'summary',
					name: '汇总',
					disabled: false,
				}, {
					type: 'summary_sales',
					name: '销售汇总',
					disabled: false,
				},
				{
					type: 'my_order',
					name: '订单查询',
					disabled: false,
				},
				{
					type: 'summary_log',
					name: '操作日志',
					disabled: false,
				},
				// 新加预约出票
				{
					type: 'tickets_order_out',
					name: '预约出票',
					disabled: false,
				},
				// {
				// 	type: 'tickets_order',
				// 	name: '预售',
				// 	disabled: false,
				// },
				/*{
					type: 'tickets_scan',
					name: '扫码购票',
					disabled: true,
				},
				{
					type: 'card',
					name: '一卡通',
					disabled: false,
				},
				*/
				{
					type: 'banjie',
					name: '班结',
					disabled: false,
				},
				{
					type: 'seat_selection',
					name: '选座售票',
					disabled: false,
				},
				{
					type: 'invoice',
					name: '发票管理',
					disabled: false,
				},
			],
			// 套票
			set_tickets: [
				{
					type: 'main',
					name: '打印主票',
					disabled: false,
				},
				{
					type: 'sub',
					name: '打印子票',
					disabled: false,
				},
			],
			// 移动支付设备
			mobile_pay_type: [
				{
					type: 'barCodeGun',
					name: '扫码枪',
					disabled: false,
				},
				{
					type: 'barCodeBox',
					name: '扫码盒子',
					disabled: false,
				},
			],
			// 打印机列表
			print_list: [],
			// 产品列表
			products: [],
			// 读卡类型列表
			card_read_type_list: [
				{
					type: '',
					name: '关闭',
					disabled: false,
				},
				{
					type: 'typeIC',
					name: '果核IC读卡器',
					disabled: false,
				},
				{
					type: 'typeID',
					name: '果核ID读卡器',
					disabled: false,
				},
				{
					type: 'twoInOne',
					name: '精伦身份证二合一',
					disabled: false,
				},
			],
			// 身份证读卡器列表
			id_read_type_list: [
				{
					type: 0,
					name: '关闭',
					disabled: false,
				},
				{
					type: 1,
					name: '精伦身份证读卡器',
					disabled: false,
				},
				{
					type: 2,
					name: '新中新身份证读卡器',
					disabled: false,
				},
			],
			// 购票信息输入
			tickets_buy_insert_list: [
				{
					key: 'mobile',
					name: '手机号',
					disabled: false,
				},
				/*{
					key: 'examine',
					name: '审批人',
					disabled: false,
				},
				{
					key: 'touristID',
					name: '游客身份信息',
					disabled: false,
				},*/
				{
					key: 'ticketNumber',
					name: '票面流水号',
					disabled: false,
				},
				{
					key: 'memo',
					name: '备注',
					disabled: false,
				},
				{
					key: 'message',
					name: '是否发送信息',
					disabled: false,
				},
				{
					key: 'touristDestination',
					name: '客源地',
					disabled: false,
				},
				{
					key: 'mainAssn',
					name: '总社',
					disabled: false,
				},
				{
					key: 'travelItinerary',
					name: '行程单',
					disabled: false,
				}
			],
			// 提交身份信息不打门票
			// id_no_ticket: false,
			id_no_ticket_disabled: false,
			// 二次确认
			// cash_confirm: false,
			cash_confirm_disabled: false,
			// 返回客户状态
			// tickets_buy_return_tourist_status: false,
			tickets_buy_return_tourist_status_disabled: false,
			// 渠道按钮
			// channel_btn: false,
			channel_btn_disabled: false,
			// 门票打印确认
			// ticket_print: false,
			ticket_print_disabled: false,
			// 取票订票验证：
			// ticket_pick: false,
			ticket_pick_disabled: false,
			// 购票订票验证：
			// ticket_buy: false,
			ticket_buy_disabled: false,
			//快捷键售票
			shortcutKeys_disabled: false,
			//祥源会会员
			memberSet_disabled: false,
			//找零
			changeMoney_disabled: false,
			//客源地设置
			originSet_disabled: false,
			//票类分组
			ticketGroup_disabled: false,
			//总社搜索
			mainAssnSearch_disabled: false,
			//订单购买成功自动打印发票
			//ticket_buy_print:false,
			ticket_buy_print_disabled:false,
			//合并打印回执单
			merge_receipt_disabled:false,
			//是否开启电子发票功能
			//ticket_btn_send_open:false,
			ticket_send_open:false,

			// 支付类型
			pay_type_list: [
				{
					name: '现金',
					type: 'cash',
				},
				{
					name: '微信',
					type: 'wx',
				},
				{
					name: '支付宝',
					type: 'alipay'
				},
				{
					name:'银行卡',
					type:'tlpos'
				},
				{
					name:'云闪付',
					type:'couldpay'
				}
			],
		},
		data: {
			// 输入密码
			// settingPassword: Config.defaultUserSetting.settingPassword,
			// account: '',
			name: 'setting',
			option: ['booking', 'picking', 'refund', 'summary', 'summary_sales', 'my_order', 'summary_log'],

			set_ticket_checked: 'main',
			mobile_pay_checked: 'barCodeGun',
			// 小票打印机
			// min_ticket: '',
			// 门票打印机
			entrance_ticket: '',
			// 门票打印机2
			entrance_ticket2: '',
			// 发票打印机
			invoice_print: '',
			// 产品列表
			product: {},
			// 读卡类型
			card_read_type: '',
			// 身份证读卡器列表
			id_read_type: '',
			// 购票信息输入
			tickets_buy_insert: ['ticketNumber','mainAssn'],
			// 支付类型
			pay_type: [],
			// 提交身份信息不打门票
			id_no_ticket: 0,
			// 返回客户状态
			tickets_buy_return_tourist_status: 0,
			// 渠道按钮
			channel_btn: 0,
			// 门票打印确认
			ticket_print: 0,
			// 二次确认
			cash_confirm: 0,
			// 取票订票验证：
			ticket_pick: 0,
			// 购票订票验证：
			ticket_buy: 0,
			//购票完打印发票
			ticket_buy_print:0,
			//开启发送电子发票功能
			ticket_btn_send_open:0,
			//合并打印回执单
			merge_receipt:0,
			//是否开启快捷键购票
			shortcutKeys:0,
			//是否开启祥源会会员
			memberSet:0,
			//客源地开启后是否必填
			originSet:0,
			//票类分组
			ticketGroup:0,
			//找零
			changeMoney:0,
			//是否开启总社搜索
			mainAssnSearch:1
		}
	},
	mutations: {
		[Type.CHANGE_SETTING_STATUS] (state, showStatus) {
			state.show = showStatus;
			showStatus || (state.repertory.enter.sure = false);
		},
		[Type.UPDATE_PRINT_LIST] (state, list = []) {
			state.repertory.print_list = list;

		},
		[Type.UPDATE_SETTING_STATE] (state, changeStatus = {}) {

			const {data, repertory, repertory: {pay_type_list,}} = state,
				{products} = changeStatus;
			// console.log(changeStatus);
			let changeData = {};
			for (let prop in data) {
				if (!data.hasOwnProperty(prop) ||
					!changeStatus.hasOwnProperty(prop) ||
					changeStatus[prop] === undefined ||
					changeStatus[prop] === 'undefined') continue;
				changeData[prop] = changeStatus[prop];
			}
			try {
				Object.assign(data, changeData,);
			} catch (e) {
				console.log(e);
			}
			// booking
			if (data.option.indexOf('booking') <= -1) {
				data.option.push('booking')
			}
			if (products) {
				state.repertory.products = products;
			}
			// pay_type
			if (data.pay_type.length <= 0) {
				state.data.pay_type = [pay_type_list[0].type]
			}
			else {
				let flag = false;
				pay_type_list.find((item) => {
					if (data.pay_type.indexOf(item.type) !== -1) {
						flag = true;
					}
				});
				flag || (state.data.pay_type = [pay_type_list[0].type])
			}
			const endPrint = repertory.print_list[0], PRINT_NAME = 'printname';
			const tickets = ['entrance_ticket', 'entrance_ticket2', 'invoice_print',];

			for (let i = 0; i < tickets.length; i++) {
				if (!endPrint) break;
				let newPrint = data[tickets[i]], flag = false;
				repertory.print_list.find(item => {
					if (item[PRINT_NAME] === newPrint) flag = true;
				});
				flag || (data[tickets[i]] = endPrint[PRINT_NAME]);
			}
			const {id_read_type} = data;
			if (!id_read_type || !parseInt(id_read_type) || repertory.id_read_type_list.length < id_read_type || id_read_type < 0) {
				data.id_read_type = 0;
			}
		},
		[Type.ENTER_KEY] (state, key) {
			// if (!state.data.settingPassword) state.data.settingPassword = key;
			state.repertory.enter.sure = Config.defaultUserSetting.settingPassword === key;
		},
	},
	actions: {
		updatePrintListAction ({commit, state}, list) {
			return new Promise((resolve, reject) => {
				commit(Type.UPDATE_PRINT_LIST, list);
				commit(Type.UPDATE_SETTING_STATE);
				state.repertory.print_list === list ? resolve(list) : reject()
			})
		},
		updateProductListAction ({commit, state}, products = []) {
			return new Promise((resolve, reject) => {
				commit(Type.UPDATE_SETTING_STATE, {products});
				state.repertory.products.length === products.length ? resolve(products) : reject()
			})
		},
		changeSettingStatusAction ({commit}, showStatus) {
			commit(Type.CHANGE_SETTING_STATUS, showStatus)
		},
		submitAction ({commit, state, state: {data}, dispatch}, changeObj) {
			return new Promise((resolve, reject) => {
				const {changeTypeList = [], data} = changeObj;
				commit(Type.UPDATE_SETTING_STATE, data);
				for (let i = 0; i < changeTypeList.length; i++) {
					let prop = changeTypeList[i];
					if (data[prop] !== data[prop]) {
						reject('保存出问题了');
						return;
					}
				}
				if (!data) return resolve;
				dispatch('insertdbAction').then((res) => {
					setTimeout(() => {
						commit(Type.CHANGE_SETTING_STATUS, false);
						// 重置为根路由
						router.push('/');
						win.reload();

					}, 1000);
					resolve({msg: '保存成功', data: res});
				}).catch(e => {
					reject(e)
				});
			});
		},
		insertdbAction (/*context*/{state: {data}}) {
			return new Promise((resolve, reject) => {
				let obj = {};
				try {
					// console.log(data);
					Storage.set(KEY.SETTING_CONTENT, Object.assign({}, data));
					// Storage.set(KEY.SETTING_CONTENT, Object.assign(obj, data, {name: 'setting'}));
					resolve(obj);
				} catch (e) {
					reject(e)
				}

			})
		},
		/**
		 * @author wells
		 * @date 2018/5/7
		 * @description: 初始化setting
		 */
		checkSettingConfig ({commit, state: {data}},) {

			let newData = JSON.parse(Storage.get(KEY.SETTING_CONTENT)) || {}, changeData = {};
			// console.log(newData);
			newData = Object.assign({}, Config.defaultUserSetting, newData);
			for (let prop in data) {
				if (!data.hasOwnProperty(prop)) continue;
				changeData[prop] = newData[prop]
			}

			commit(Type.UPDATE_SETTING_STATE, changeData);
		},
		/**
		 * @author wells
		 * @date 2018/5/7
		 * @description: 输入密码验证
		 * @param key 密码输入
		 * @param commit
		 * @param state
		 */
		enterSettingKeyAction ({commit, state,}, key) {
			return new Promise((resolve, reject) => {
				commit(Type.ENTER_KEY, key);
				return state.repertory.enter.sure ?
					resolve() :
					reject()
			})
		},
		/**
		 * @author wells
		 * @date 2018/5/7
		 * @description: 重置setting 为默认
		 */
		resetSettingAction ({commit, state, dispatch,}) {
			return new Promise((resolve, reject) => {

				dispatch('submitAction', {
					data: Config.defaultUserSetting
				}).then(({data},) => {
					resolve({msg: '重置成功', data: data});
				}).catch(err => {
					// console.log(err);
					reject(err)
				});
			})

		},
	},
	getters: {
		navShow: state => (str) => {
			return state.data.option.indexOf(str) > -1
		},
		enterShow: state => !state.repertory.enter.sure,
		/**
		 * @author xiaoqiang
		 * @date 2018/5/10
		 * @description: checkStatus
		 * @params (key[,str]) 获取state.data [key] 的值  [，获取[key]属性下的数组是否存在 str字段]
		 */
		checkStatus: (state, getters) =>
			/**
			 * @description
			 * @param key state.data 内部
			 * @param str state.data[key] 为数组时 判断数组中是否存在 str
			 */
				(key, str) => {
				if (!state.data.hasOwnProperty(key)) {
					return new Error('key is not in setting.data');
				}
				if (key === 'nav') {
					return getters.navShow(str);
				}
				if (Array.isArray(state.data[key]))
					return state.data[key].indexOf(str) > -1;
				return state.data[key]
			},
	}
};
/*

function f (state, changeStatus) {
	const {data, repertory, repertory: {pay_type_list,}} = state,
		{products} = changeStatus;
	// console.log(changeStatus);
	let changeData = {};
	for (let prop in data) {
		if (!data.hasOwnProperty(prop) ||
			!changeStatus.hasOwnProperty(prop) ||
			changeStatus[prop] === undefined ||
			changeStatus[prop] === 'undefined') continue;
		changeData[prop] = changeStatus[prop];
	}
	try {
		Object.assign(data, changeData,);
	} catch (e) {
		console.log(e);
	}
	// booking
	if (data.option.indexOf('booking') <= -1) {
		data.option.push('booking')
	}
	if (products) {
		state.repertory.products = products;
	}
	// pay_type
	if (data.pay_type.length <= 0) {
		data.pay_type = pay_type_list[0].type
	}
	else {
		let flag = false;
		pay_type_list.find((item) => {
			if (data.pay_type.indexOf(item.type) !== -1) {
				flag = true;
			}
		});
		flag || (data.pay_type = pay_type_list[0].type)
	}
	const endPrint = repertory.print_list[0], PRINT_NAME = 'printname';
	const tickets = ['entrance_ticket', 'entrance_ticket2', 'invoice_print',];

	for (let i = 0; i < tickets.length; i++) {
		if (!endPrint) break;
		let newPrint = data[tickets[i]], flag = false;
		repertory.print_list.find(item => {
			if (item[PRINT_NAME] === newPrint) flag = true;
		});
		flag || (data[tickets[i]] = endPrint[PRINT_NAME]);
	}
	const {id_read_type} = data;
	if (!id_read_type || !parseInt(id_read_type) || repertory.id_read_type_list.length < id_read_type || id_read_type < 0) {
		data.id_read_type = 0;
	}
}
*/

(function selfUpdate () {
	let {data} = setting.state, newData = JSON.parse(Storage.get(KEY.SETTING_CONTENT)) || {}, changeData = {};
	newData = $.extend(Config.defaultUserSetting, newData);
	for (let prop in data) {
		if (!data.hasOwnProperty(prop)) continue;
		changeData[prop] = newData[prop] === undefined ? 0 : newData[prop];
	}
	setting.state.data = Object.assign({}, changeData, {name: 'setting'});

	Array.isArray(setting.state.data.pay_type) || (setting.state.data.pay_type = [setting.state.repertory.pay_type_list[0]])
})();

export default setting;
