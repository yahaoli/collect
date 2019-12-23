import Vue from "vue";
import Vuex from "vuex";
import * as Types from "./mutation-types";
import Storage, {KEY} from "@/util/storage";
import router from '../router';
import onfire from "onfire.js";
import modules from './modules'
import {
	queryOrderInfo,
	queryOrderPrintTemplate,
	editOrderPrintStatus,
	getSystemDict,
	changeStatusToPrintTicket,
	CloudSummaryUploadPrintInfo,
	getInvoiceData,
	getTemplate,
	TicketLog
} from "@/service";
import Message from "@/util/message";
import basePrint from "@/util/basePrint";
import TicketPrint from "@/util/ticketPrint";
import ReceiptPrint from "@/util/receiptPrint";
import axios from "axios";
import Config from "@/config";
import {cloneDeep} from "lodash";
import * as Service from '@/service'
import getShowInfoFromOrder from "@/util/getShowInfoFromOrder";

Vue.use(Vuex);
const userInfo = Storage.Session.get(KEY.USER_INFO);
let store = new Vuex.Store({

	modules,

	strict: process.env.NODE_ENV !== "production",

	state: {
		pageLoading: false,
		userInfo: userInfo ? JSON.parse(userInfo) : null,
		// defaultUserSetting: defaultUserSetting ? JSON.parse(defaultUserSetting) : Config.defaultUserSetting,
		scenicListLoading: false,
		websocketReadyState: -1,
		scenicList: [],
		dictionary: null,
		//登录的帐号对应的终端号
		//string类型，默认为空 ""
		terminalNo: ""
	},

	mutations: {
		[Types.UPDATE_PAGE_LOADING](state, val) {
			state.pageLoading = !!val;
		},
		[Types.UPDATE_SOCKET_STATE](state, val) {
			state.websocketReadyState = val;
		},
		[Types.UPDATE_USER_INFO](state, userInfo) {
			state.userInfo = userInfo;
		},
		[Types.UPDATE_SCENIC_LIST](state, data) {
			// console.log('更新数组');
			state.scenicList = data;
		},
		[Types.UPDATE_DICTIONARY](state, data) {
			state.dictionary = data;
		},
		// 判断是否正在请求
		[Types.SCENIC_LIST_STATUS_CHANGE](state, status) {
			state.scenicListLoading = status;
		},
		[Types.UPDATE_PRINT_TICKET_LOADING](state, val) {
			state.printTicketLoading = !!val;
		},
		[Types.UPDATE_TERMINAL_NO](state, val) {
			state.terminalNo = val;
		}
	},

	actions: {
		//获取产品
		//huangzhiyang 20180511 暂时没用到
		// xiaoqiang 180511 使用设置进入检测是否登录状态
		async storeInit({state, commit, dispatch,}) {
			state.userInfo && state.userInfo.account && dispatch('checkSettingConfig', state.userInfo.account);
			//dispatch('getScenicList');
		},

		/**
		 * 获取登录的帐号对应的终端号
		 * queryOrderPrintTemplate接口本来是用来查询打印模板的，但返回的数据里也附带了终端号
		 * 所以取终端号也用这个接口来取
		 */
		queryTerminalByAccount({state, commit, dispatch, rootState}) {
			const {account} = state.userInfo || {};
			if (!account) return false;
			Service.queryOrderPrintTemplate({account, lid: ""}).then((res) => {
				const errorMsg = (errorText = "未知") => `查询终端号出错，错误原因：${errorText}`;
				if (!res) return errorMsg();
				if (res.code != 200) return errorMsg(res.msg || "");
				const data = res.data[0];
				if (!data) return errorMsg("查无结果");
				const {TerminalNo} = data;
				if (!TerminalNo) return errorMsg("终端号为空");
				commit(Types.UPDATE_TERMINAL_NO, TerminalNo);

			}).catch((e) => {
				Message.error(e);
			})
		},

		/**
		 * @author xiaoqiang
		 * @date 2018/5/8
		 * @description:
		 * @param {Boolean} flag 这个值为true 强制更新
		 * @param commit
		 * @param state
		 * @param dispatch
		 * @param sourceType
		 * @param isSiteFilter
		 */
		getScenicList({ state, commit, dispatch }, { flag = false, sourceType = 1, isSiteFilter = 0, date = [] }) {
			console.log(flag, sourceType, isSiteFilter)
			return new Promise((resolve, reject) => {
				if (!state.userInfo) return;
				// if (!flag && state.scenicList.length) {
				// 	resolve(state.scenicList);
				// 	return;
				// }
				let param = { sourceType, isSiteFilter };
				if (date.length) {
					param.begin = date[0];
					param.end = date[1];
				}
				dispatch('getScenicListAjax', param).then((list) => {
					resolve(list);
				}).catch(e => {
					console.log(e);
					reject(e);
				});
			})
		},
		//请求产品
		async getScenicListAjax({state, commit, dispatch, rootState}, param) {
			console.log('请求产品')
			return new Promise((resolve, reject) => {
				// 判断是否正在请求
				if (state.scenicListLoading) return;
				commit(Types.SCENIC_LIST_STATUS_CHANGE, true);
				// console.log('get');
				Service.getScenicList({
					account: rootState.userInfo.account,
					aid: rootState.userInfo.parent_member_id,
					...param,
					siteId: rootState.userInfo.siteId
					// token: rootState.userInfo.token
				}).then(res => {
					// console.log(res);
					if (res.code == 200) {
						dispatch('updateProductListAction', res.data.list).then((data) => {
							// console.log(data);
						}).catch(e => {
							reject(e)
						});
						commit(Types.UPDATE_SCENIC_LIST, res.data.list);
						// commit(Types.UPDATE_SETTING_STATE,{options:res.data.list});
						res.data.list.length === state.scenicList.length ? resolve(res.data.list) : reject(new Error('写入失败'));
					}
				}).finally(() => {
					commit(Types.SCENIC_LIST_STATUS_CHANGE, false);
				})
			})
		},
		updateDictionary({commit, state}, val) {
			let localDic = localStorage.getItem("dictionary");
			if (localDic) {
				commit(Types.UPDATE_DICTIONARY, JSON.parse(localDic));
			} else {
				getSystemDict().then(res => {
					if (res.code == 200) {
						commit(Types.UPDATE_DICTIONARY, res.data);
						localStorage.setItem(
							"dictionary",
							JSON.stringify(res.data)
						);
					}
				});
			}
		},
		updatePageLoading({commit}, val) {
			commit(Types.UPDATE_PAGE_LOADING, !!val);
		},
		updateSocketState({commit}, val) {
			commit(Types.UPDATE_SOCKET_STATE, val);
		},

		// 打印发票
		// 用户输入的覆盖值 ：{ordernum : 订单号,inputTitle：修改表头，inputMoney：修改价格}
		async printInvoice({commit, state, dispatch}, {ordernum, inputTitle, inputMoney}) {
			if (inputMoney !== "" && isNaN(parseInt(inputMoney))) {
				Message.error('修改价格请输入数字')
				return false
			}
			let invoiceData = null;
			Message.loading("正在准备打印发票, 请稍后...");
			getInvoiceData({ordernum: ordernum, op_id: state.userInfo.member_id}).then(res => {
				if (res.code == 200) {
					invoiceData = res.data
					if (!invoiceData) {
						return Promise.reject('发票内容为空')
					}
					return getTemplate({type: 2, fid: state.userInfo.member_id})
				} else {
					return Promise.reject(res.msg || '获取发票数据出错')
				}
			}).then(res => {
				Message.closeLoading()
				if (res.code == 200) {
					if (res.data.content.length == 0) {
						return Promise.reject('发票模板为空，请先配置后再重试')
					}

					let lowtotalfeeOption = res.data.content.find(item => item.name == 'lowtotalfee')
					let titleOption = res.data.content.find(item => item.name == 'invoice')
					if (lowtotalfeeOption && inputMoney) {
						lowtotalfeeOption.inputContent = inputMoney
					}
					if (titleOption && inputTitle) {
						titleOption.inputContent = inputTitle
					}

					basePrint({
						cmd: "printInvoice",
						data: [invoiceData],
						template: res.data.content,
						employeeName: state.userInfo.member_name,
						printSet: {printName: state.setting.data.invoice_print},
						dataKey: "invoiceData"
					}).then(res => {
						Message.success('打印成功');
						//发送发票打印日志
						let ordernum = res.invoiceData[0].ordernum;
						let Member_oper = state.userInfo.member_id;
						let parent_member_account = state.userInfo.parent_member_account;
						let source = 4;
						let action = 18;
						TicketLog({
							ordernum: ordernum,
							oper: Member_oper,
							salerId: parent_member_account,
							source: source,
							action: action
						});

					}).catch(err => {
						console.log(err)
						Message.error(err || '打印失败')
					});
				} else {
					return Promise.reject(res.msg || '获取发票打印模板出错')
				}
			}).catch(err => {
				console.log(err)
				//Message.alert('网络故障！请检查当前网络')
				Message.alert(err.toString());
				Message.closeLoading()
			})
		},
		//按购物车合并打印回执单
		async printMergeReceipt({commit, state, dispatch}, {ordernum, lid}) {
			let orderData = [];
			Message.loading("正在准备打印回执单, 请稍后...");
			queryOrderInfo({
				ordernum,
				applyDid: state.userInfo.parent_member_id,
				order_status: '0|1|7',
				lid
			}).then(res => {
				if (res.code == 200) {
					// 只打印订单号对应的票
					ordernum.forEach(shopOrder => {
						orderData.push(res.data.find(item => item.ordernum == shopOrder))
					})
					if (!orderData.length) {
						return Promise.reject('回执单内容为空')
					}
					return getTemplate({type: 1, fid: state.userInfo.member_id})
				} else {
					return Promise.reject(res.msg || '获取发票数据出错')
				}
			}).then(res => {
				Message.closeLoading()
				if (res.code == 200) {
					if (res.data.content.length == 0) {
						return Promise.reject('回执单模板不能为空，请先进行配置后重试')
					}
					//反序列化数组重新赋值series
					var seriesList = "";
					orderData.forEach(shopOrder => {
						if (shopOrder.p_type == "H") {
							const showInfo = getShowInfoFromOrder(shopOrder.series);
							for (let i = 0; i < shopOrder.tnum * 1; i++) {
								if (!Math.round(i % 15)) {
									seriesList += showInfo.seat[i];
									seriesList += '\n\r';
								} else {
									seriesList += showInfo.seat[i] + '_';
								}
							}
							//去掉最后一个逗号(如果不需要去掉，就不用写)
							if (seriesList.length > 0) {
								seriesList = seriesList.substr(0, seriesList.length - 1);
							}

							seriesList = '演出时间：' + showInfo.dateTime + ',座位分区:' + showInfo.area + ',座位号:' + seriesList;
						}

						//新增字段为剧场演出信息
						shopOrder.sceniclist = seriesList;
					});
					ReceiptPrint({
						data: orderData,
						template: res.data.content,
						employeeName: state.userInfo.member_name,
						printSet: {printName: state.setting.data.invoice_print}
					}).then(res => {
						Message.success('打印成功');
						//发送回执单打印日志
						let Member_oper = state.userInfo.member_id;
						let parent_member_account = state.userInfo.parent_member_account;
						let source = 4;
						let action = 19;
						ordernum.forEach(item => {
							TicketLog({
								ordernum: item,
								oper: Member_oper,
								salerId: parent_member_account,
								source: source,
								action: action
							});
						})
					}).catch(err => {
						console.log(err)
						Message.error(err || '打印失败')
					})
				} else {
					return Promise.reject(res.msg || '获取发票打印模板出错')
				}
			}).catch(err => {
				console.log(err)
				//Message.alert('网络故障！请检查当前网络')
				Message.error(err.toString());
				Message.closeLoading()
			})
		},
		// 打印回执单
		// 用户输入的覆盖值 ：{ordernum : 订单号 ,inputTitle：修改表头，inputMoney：修改价格}
		async printReceipt({commit, state, dispatch}, {ordernum, inputTitle, inputMoney, lid}) {
			if (inputMoney !== "" && isNaN(parseInt(inputMoney))) {
				Message.error('修改价格请输入数字')
				return false
			}
			let orderData = null;
			Message.loading("正在准备打印回执单, 请稍后...");
			queryOrderInfo({
				ordernum,
				applyDid: state.userInfo.parent_member_id,
				order_status: '0|1|7',
				lid
			}).then(res => {
				if (res.code == 200) {
					// 只打印订单号对应的票
					orderData = res.data.find(item => item.ordernum == ordernum)
					if (!orderData) {
						return Promise.reject('回执单内容为空')
					}
					return getTemplate({type: 1, fid: state.userInfo.member_id})
				} else {
					return Promise.reject(res.msg || '获取发票数据出错')
				}
			}).then(res => {
				Message.closeLoading()
				if (res.code == 200) {
					if (res.data.content.length == 0) {
						return Promise.reject('回执单模板不能为空，请先进行配置后重试')
					}

					let tableOption = res.data.content.find(item => item.name == 'table')
					if (tableOption && inputMoney) {
						tableOption.inputContent = inputMoney
					}
					//反序列化数组重新赋值series
					var seriesList = "";
					if (orderData.p_type == "H") {
						const showInfo = getShowInfoFromOrder(orderData.series);
						for (let i = 0; i < orderData.tnum * 1; i++) {
							if (!Math.round(i % 15)) {
								seriesList += showInfo.seat[i];
								seriesList += '\n\r';
							} else {
								seriesList += showInfo.seat[i] + '_';
							}
						}
						//去掉最后一个逗号(如果不需要去掉，就不用写)
						if (seriesList.length > 0) {
							seriesList = seriesList.substr(0, seriesList.length - 1);
						}

						seriesList = '演出时间：' + showInfo.dateTime + ',座位分区:' + showInfo.area + ',座位号:' + seriesList;
					}


					//新增字段为剧场演出信息
					orderData.sceniclist = seriesList;

					// console.log(orderData);
					// return false;


					ReceiptPrint({
						data: orderData,
						template: res.data.content,
						employeeName: state.userInfo.member_name,
						printSet: {printName: state.setting.data.invoice_print}
					}).then(res => {
						Message.success('打印成功');
						//发送回执单打印日志
						let ordernum = res.data["0"].UUordernum;
						let Member_oper = state.userInfo.member_id;
						let parent_member_account = state.userInfo.parent_member_account;
						let source = 4;
						let action = 19;
						TicketLog({
							ordernum: ordernum,
							oper: Member_oper,
							salerId: parent_member_account,
							source: source,
							action: action
						});

					}).catch(err => {
						console.log(err)
						Message.error(err || '打印失败')
					})
				} else {
					return Promise.reject(res.msg || '获取发票打印模板出错')
				}
			}).catch(err => {
				console.log(err)
				Message.alert(err.toString());
				Message.closeLoading()
			})
		},

		/**
		 * huangzhiyang 20180322
		 * 全局统一的打印门票action
		 * @param {string} type      1==售票打印  2==重打印  3==取票打印
		 * @param {string} ordernum  多个订单号时用","隔开
		 * @param {string} lid       产品id  多个时用","隔开
		 * @param {string} applyDid  这个订单所买的产品的供应商ID   多个时用","隔开
		 * @param commit
		 * @param state
		 * @param dispatch
		 *
		 * 门票的打印方式:  PrinType==2(门票订单打印)  PrinType==4(门票单张打印)
		 *
		 *
		 */
		async printTicket({commit, state, dispatch, rootState}, {type = "1", ordernum, idcard = "", seatStatus, idcards, lid, applyDid}) {
			return new Promise((printResolve,printReject) => {
				//最终要打印的订单列表
				let printList = [];
				const {account, member_id} = state.userInfo;
				const {set_ticket_checked} = state.setting.data;
				//1==打印主票  2==打印子票
				const printIfpack = set_ticket_checked == "main" ? 1 : 2;
				const {order_paymode} = state.dictionary;
				const output = (code, msg) => {
					code, msg
				};
				const queryOrderInfoAndTemp = ({ordernum, lid, applyDid}) => {
					let printParams = {ordernum, salerid: lid, oper: member_id, printIfpack};
					if (idcard) printParams["rawQueryParam"] = idcard;
					return axios.all([
						changeStatusToPrintTicket(printParams),
						queryOrderInfo({ordernum, lid, salerid: lid, applyDid, personid: idcard}),
						queryOrderPrintTemplate({account, lid})
					]);
				};
				// function test(){
				// 	return new Promise((resolve,reject) => {
				// 		setTimeout(function () {
				// 			console.log(111111111)
				// 			resolve(111);
				// 		},5000)
				// 	})
				// }


				const ordernumArr = ordernum.split(",");
				const lidArr = lid.split(",");
				const applyDidArr = applyDid.split(",");
				const all = ordernumArr.map((ordernum, index) => {
					return queryOrderInfoAndTemp({ordernum, lid: lidArr[index], applyDid: applyDidArr[index]})
				});
				//延迟重试问题
				let allRes, printLoad, printStart = false;
				let printTime = setTimeout(function () {
					printStart = true;
					Message.confirm("打印门票超时，请重试。", '网络故障', {
						closeOnClickModal: false,
						closeOnPressEscape: false
					}).then(() => {
						axios.all(all).then(res => {
							printStart = false;
							allRes = res;
							printTask();
						});
					}).catch((e) => {
						Message.closeLoading();
					})
				}, 10000);
				Message.loading("正在准备打印门票, 请稍后...");
				axios.all(all).then(res => {
					allRes = res;
					!printStart && printTask();
				});

				function printTask() {
					printStart = true;
					clearTimeout(printTime);
					Message.closeLoading();
					let errorMsgList = [];
					let errorPrintList = []; //没有配置打印提示
					let availRes = [];
					allRes.forEach((group, index) => {
						const ordernum = ordernumArr[index];
						const printStatusRes = group[0]; //修改订单打印状态
						const orderRes = group[1]; //订单详情的返回数据
						const tempRes = group[2];  //订单模板
						let msgArr = [];
						let errorPrint = []; //无配置打印提示
						if (+printStatusRes.code === 409) {
							errorPrint.push(`${printStatusRes.msg}`)
						} else if (!printStatusRes || printStatusRes.code != 200) {
							msgArr.push(`${printStatusRes ? (printStatusRes.msg || '网络异常') : '网络异常'}`);
						} else if (orderRes.code != 200) {
							msgArr.push(`找不到可打印的订单`);
						} else if (!orderRes.data || orderRes.data.length == 0) {
							msgArr.push(`找不到可打印的订单`);
						}
						if (tempRes.code != 200) {
							msgArr.push('网络异常，请手动重打印门票');
						} else if (!tempRes.data || tempRes.data.length == 0) {
							msgArr.push(`网络异常，请手动重打印门票`);
						}
						if (msgArr.length > 0) {
							msgArr.unshift(`订单${ordernum}`);
							errorMsgList.push(msgArr.join(" "));
						} else if (errorPrint.length > 0) {
							errorPrintList.push(errorPrint.join(" "))
						} else {
							availRes.push(group);
						}
					})


					// errorMsgList = ["请求打印模板数据出错","请求打印模板数据出错","请求打印模板数据出错"];
					if (errorMsgList.length > 0) {
						const htmlStr = errorMsgList.map((item) => `<div class="errorTip">${item}</div>`);
						Message.alert({
							title: ordernumArr.length > 1 ? "打印提示" : "打印提示",
							message: htmlStr.join(""),
							dangerouslyUseHTMLString: true,
							customClass: "gPriceModeAlert"
						})
					}
					//无配置打印提示
					if (errorPrintList.length > 0) {
						Message.warning(errorPrintList.join(""))
					}
					if (availRes.length == 0) return Promise.reject("没有可打印的订单");
					//判断是否是选座类订单
					var seatShow = seatStatus;
					console.log('测试代码')
					availRes.forEach((group, index) => {
						const ordernum = ordernumArr[index];
						const orderRes = group[1];
						let orderList = orderRes.data;
						const tempRes = group[2];
						const tempList = tempRes.data;


						/**
						 * huangzhiyang 2018-04-03
						 *
						 * 门票打印逻辑
						 *
						 * 判断一个订单号查出来的订单是什么类型：1、套票订单;  2、联票订单;  3、普通票订单
						 * orderList是个array,如果是套票的情况,那么orderList里每个item的ifpack字段要么是1要么是2，不可能为0
						 * 如果是联票订单，那么orderList.length>=2且每个item必须有concat_id字段
						 * 除以上2种情况外的都属于普通票订单
						 *
						 * 套票时，
						 * 1、套票里面是否有某个子票是否被取消，如果只要有一个子票被取消，则整个套票订单都不打印
						 * 2、需要接着判断系统设置里的套票打印方式：打印主票还是打印子票
						 * 但这里有个特殊情况：演出类产品的套票，也是会把子票查询出来，但是主票的ifpack是等于0，跟普通的门票一样的，但会有多个票。
						 * 目前判断是否是演出套票的方法：
						 *        返回的数据里有>=2个票，
						 *        且只有第一张票的p_type==H且余下的票的p_type都不能为H
						 *        且所有票的ifpack==0
						 *
						 *
						 *
						 * 联票时，需要先判断是否是一票一码，如果是一票一码，则主票跟子票都要打印，而且要按照门票单张打印的方式打印
						 * 如果不是一票一码，则需要结合zd后台的门票打印方式：
						 * 1、如果是订单单张打印，则只打印联票主票的票名，但门票数量必须是主票与子票的门票数总和
						 * 2、如果是门票单张打印，则主票跟子票都打印
						 *
						 * 另外注意，如果门票设置了一票一码，则不论zd后台的门票打印方式是什么，都默认按门票单张打印的方式打印
						 * 而判断是否是一票一码，目前只通过orderList item里的codes字段，
						 * 一票一码或一票一证的才有codes字段
						 * 如果codes里的每个item都是以"OD#"开头，则判定为一票一码
						 *
						 *
						 */

							//判断是否是套票
						const isPack = (orderList) => orderList.every((order) => order.ifpack != 0);
						//判断套票里面是否有某个子票是否被取消，如果只要有一个子票被取消，则整个套票订单都不打印
						const isPackOrderCanPrint = (orderList) => (isPack(orderList) && orderList.some((order) => order.status == 3));


						//先判断是否是演出套票
						const isShowPack = (orderList) => {
							let firstOrder = orderList[0];
							let _orderList = cloneDeep(orderList).slice(1);
							return orderList.length >= 2 &&
								firstOrder.p_type == "H" &&
								orderList.every((order) => order.ifpack === 0) &&
								_orderList.every((order) => order.p_type != "H")
						};

						//判断是否是一票一码
						const isODCodes = (ticket) => {
							return ticket.codes && ticket.codes.every((code) => code.indexOf("OD#") == 0);
						}


						//如果订单状态status==3 说明是已取消的订单，这时不能打印出票
						orderList.forEach((order) => {
							if (order.status == 3) {
								Message.error(`${order.ltitle} - ${order.ttitle}订单已被取消，无法出票`);
							}
						})


						if (isPackOrderCanPrint(orderList)) {//如果是套票订单，并且其中有任何一个子票被取消了，则整个套票不打印
							orderList = [];
						} else {
							//先过滤掉订单状态status==3的(已取消)
							orderList = orderList.filter((order) => order.status != 3);
							if (isShowPack(orderList)) { //演出套票
								if (printIfpack == 1) {//打印主票
									orderList = orderList.slice(0, 1);
								} else if (printIfpack == 2) {//打印子票
									orderList = orderList.slice(1);
								}
							} else if (orderList.length >= 2 && orderList.every((order) => order.ifpack != 0)) {//如果是套票  0==普通票 1==套票主票  2==套票子票
								orderList = orderList.filter((order) => {
									return order.ifpack == printIfpack;
								})
							} else if (orderList.length >= 2 && orderList.every((order) => order.concat_id == orderList[0].ordernum)) { //如果是联票
								//如果是联票时，zd后台门票打印方式，以主票为准
								const tid = orderList[0].tid;
								const tempData = tempList.find((item) => item.tid == tid) || tempList[0];
								const printType = tempData.PrinType;
								if (!isODCodes(orderList[0]) && printType != 4) { //如果不是一票一码并且zd后台设置了门票订单打印
									const totalTnum = orderList.reduce((prevVal, current) => (prevVal + current.tnum * 1), 0);
									orderList[0]["tnum"] = totalTnum;
									orderList = [cloneDeep(orderList[0])];
								}
							}
						}
						orderList.forEach((order) => {
							const tid = order.tid;
							const tempData = tempList.find((item) => item.tid == tid) || tempList[0];
							const printType = tempData.PrinType;
							if (order.p_type == "H") { //演出类产品，其它规则都不需要管，只管门票一张一张打印,但要结合坐位信息
								for (let i = 0; i < order.tnum * 1; i++) {
									let _order = cloneDeep(order);
									_order["tnum"] = 1;
									if (order.codes && order.codes[i]) {
										_order["code"] = order.codes[i];
									}
									_order["paymode"] = order_paymode[order.pmode] || "";

									const showInfo = getShowInfoFromOrder(order.series);
									if (showInfo && showInfo.seat) showInfo.seat = showInfo.seat[i];
									_order.series = showInfo;
									printList.push({order: _order, temp: cloneDeep(tempData)});
								}
							} else if (isODCodes(order)) {//如果是一票一码 则后端返回几个身份证就打印几张票
								for (let i = 0; i < order.idcards.length; i++) {
									let _order = cloneDeep(order);
									_order["tnum"] = 1;
									if (order.codes && order.codes[i]) {
										_order["code"] = order.codes[i]
									}
									_order["paymode"] = order_paymode[order.pmode] || "";
									printList.push({order: _order, temp: cloneDeep(tempData)});
								}
							} else if (printType == 4) {//zd后台设置了门票单张打印
								for (let i = 0; i < order.tnum * 1; i++) {
									let _order = cloneDeep(order);
									_order["tnum"] = 1;
									if (order.codes && order.codes[i]) {
										_order["code"] = order.codes[i]
									}
									_order["paymode"] = order_paymode[order.pmode] || "";
									printList.push({order: _order, temp: cloneDeep(tempData)});
								}
							} else { //票门订单打印
								let _order = cloneDeep(order);
								_order["paymode"] = order_paymode[order.pmode] || "";
								printList.push({order: _order, temp: cloneDeep(tempData)});
							}
						})
					});
					console.log('打印服务')
					if(printList.length===0) return printReject();
					if (!seatShow) {
						printResolve(printList);
						dispatch('printSeatTicket', {printList: printList, type: type})
					} else {
						printResolve(printList)
					}
				}
			})
		},
		async printSeatTicket({commit, state, dispatch, rootState}, {printList, type}) {
			//获取系统设置里的门票打印设置
			const setting = state.setting;
			const fixProduct = setting.data.product || {};
			const fixProductID = fixProduct.id;
			const printMedList = setting.repertory.print_list;

			//门票打印机一
			const entrance_ticket = setting.data.entrance_ticket;
			//门票打印机二
			const entrance_ticket2 = setting.data.entrance_ticket2;
			const printTodoList = [];
			printList.forEach((print) => {
				const order = print.order;
				order.operatorName = rootState.userInfo.member_name;
				order.operatorId = rootState.userInfo.member_id;
				//判断是否是指定产品
				const isSpecProd = order.lid == fixProductID;
				const printName = isSpecProd ? entrance_ticket2 : entrance_ticket;
				// 上报打印汇总的信息
				//CloudSummaryUploadPrintInfo({type, num: order.tnum, order: order.ordernum, landID: order.lid});
				printTodoList.push({
					task: () => {
						return new Promise((resolve, reject) => {
							TicketPrint({
								data: order,
								template: print.temp,
								printSet: {
									printName
								}
							}).then(() => {
								resolve()
							}).catch(err => {
								reject(err)
							})
						})
					},
					type: type,
					orderInfo: order
				})
			})
			onfire.fire('StartProgress', printTodoList, function () {
			});
			//return Promise.all(printTodoList);
		}
	},
	getters: {
		scenicList: state => state.scenicList
	}
});

export default store
