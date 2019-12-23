import store from "@/store";
import * as Service from "../service";
import {payOrderOffline, payOrder} from "@/service";
import Message from "@/util/message";
import {cloneDeep} from "lodash";
import Vue from "vue";
import NP from "number-precision";
import posPayRefund from "@/util/posPayRefund";
import allInPay from "@/util/allInPay";

store.registerModule("picking&refund", {
	namespaced: true,
	state: {
		loading: true,
		showEmptyText: false,
		orderList: [],
		queryType: "code",
		seatList: [],//订单的座位号
		idcard: "" //如果是用身份证查单的情况下取票要打印要记录用来查找的身份证
	},
	getters: {},

	actions: {
		//获取产品
		async getScenicList({state, commit, dispatch, rootState}, {sourceType, isSiteFilter}) {
			//if (rootState.scenicList.length == 0) {
			dispatch("getScenicList", {flag: null, sourceType, isSiteFilter}, {root: true});
			//}
		},

		//查单
		async orderQuery({state, commit, dispatch, rootState}, data) {
			let queryWord = data.queryWord.replace(/(^\s*)|(\s*$)/g, "");
			let queryLength = queryWord.length;
			if (queryLength == 18) {
				commit("update_state", {idcard: queryWord});
			} else {
				commit("update_state", {idcard: ""});
			}
			let queryType = "code";
			if (queryLength == 0) {
				Message.alert(
					"请输入手机号、凭证号、订单号或身份证中的一种！",
					"提示"
				);
				return false;
			}
			commit("update_state", {orderList: []});
			dispatch("updatePageLoading", true, {root: true});
			if (data.searchType == "other") {
				switch (queryLength) {
					case 11:
						queryType = "ordertel";
						break;
					case 18:
						queryType = "personid";
						break;
					default:
						queryType = "ordernum";
						break;
				}
			} else {
				queryType = "code";
			}

			commit("update_state", {queryType: queryType});
			let res = await Service.orderQuery({
				order_status: data.type == "picking" ? "0|7" : "0|1|7|5",
				[queryType]: queryWord,
				lid: data.scenicValue == "-1" ? "" : data.scenicValue,
				salerid: data.salerid,
				apply_did: rootState.userInfo.parent_member_id
			}).catch(err => {
				Message.alert(err || "查询失败", "提示");
				dispatch("updatePageLoading", false, {root: true});
			});
			//console.log(res)
			if (res.code == 200 && res.data.length != 0) {
				commit("update_state", {showEmptyText: true});
				//在前端对套票和联票进行组合
				// 联票：concat_id字段不为空，是主票的订单号；
				// 套票：ifpack=1是套票主票，ifpack=2是套票子票，pack_order是套票主票的订单号。
				let serializeData = {};
				res.data.forEach(item => {
					//退票只能查到云票务下单的票,退票不能查到未支付的订单
					if (
						data.type == "refund" &&
						((item.ordermode != 10 && item.ordermode != 99 && item.ordermode != 98 && item.ordermode != 19) || item.pay_status == 2)
					) {
						return false;
					}
					//如果用身份证查一票一证的情况下的票数应该为1（tnum）
					if (data.type == "picking" && item.codes && state.idcard) {
						if (item.codes.every(item => item.startsWith("OD#"))) {
							item.origin_num = item.tnum;
						}
					}
					//取票只能查到未使用和未支付的票
					if (
						data.type == "picking" &&
						(item.status != 0 && item.status != 7)
					) {
						return false;
					}
					console.log(item.ifpack);
					//如果是套票
					if (item.ifpack == 1 || item.ifpack == 2) {
						serializeData[item.ordernum] = [item];
						//如果是主票
						// if (item.ifpack == 1) {
						// 	serializeData[item.concat_id]
						// 		? null
						// 		: (serializeData[item.concat_id] = []);
						// 	serializeData[item.concat_id].push(item);
						// } else {
						// 	//如果是子票
						// 	serializeData[item.pack_order]
						// 		? null
						// 		: (serializeData[item.pack_order] = []);
						// 	serializeData[item.pack_order].push(item);
						// }
					} else {
						//如果是联票
						serializeData[item.ordernum] = [item];
						// if (item.concat_id) {
						// 	//如果是主票
						// 	if (item.concat_id == item.ordernum) {
						// 		serializeData[item.concat_id]
						// 			? null
						// 			: (serializeData[item.concat_id] = []);
						// 		serializeData[item.concat_id].unshift(item);
						// 	} else {
						// 		//如果是子票
						// 		serializeData[item.concat_id]
						// 			? null
						// 			: (serializeData[item.concat_id] = []);
						// 		serializeData[item.concat_id].push(item);
						// 	}
						// } else {
						// 	//普通票
						// 	serializeData[item.ordernum] = [item];
						// }
					}
				});
				console.log('查单', serializeData);
				let orderData = Object.values(serializeData);
				orderData.reverse(); //按时间倒叙
				if (orderData.length > 0) {
					commit("update_state", {
						orderList: orderData,
						showEmptyText: false
					});
				} else {
					commit("update_state", {
						orderList: orderData,
						showEmptyText: true
					});
				}
			} else if (res.code != 200) {
				Message.alert(res.msg || "查询失败", "提示");
			} else {
				commit("update_state", {orderList: [], showEmptyText: true});
			}

			dispatch("updatePageLoading", false, {root: true});
		},

		//撤销操作
		async ticketRevoke({state, commit, dispatch, rootState}, orderData) {
			let confirm = await Message.confirm(
				"确定要对该票进行撤销操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			);

			if (!confirm) return false;

			dispatch("updatePageLoading", true, {root: true});

			let queue = orderData.map(item =>
					//map+assign+promise会出现promise.all的时候所有promise都使用最后一项item的情况
				{
					let terminal = rootState.scenicList.find(
						i => i.salerid == item.salerid
					).terminal;
					if (!terminal) {
						return Promise.resolve({
							code: 500,
							msg: "找不到对应终端号"
						});
					} else {
						return Service.terminalRevoke({
							ordernum: item.ordernum,
							tnum: 0,
							terminal: terminal,
							account: rootState.userInfo.account,
							token: rootState.userInfo.token,
							op_member: rootState.userInfo.member_id
						});
					}
				}
			);
			Promise.all(queue).then(resList => {
				let failList = [];
				let successText = "";
				resList.forEach((item, index) => {
					//0802需要撤改申请   0901无需审核
					if (item.code == "0802" || item.code == "0901") {
						successText =
							item.code == "0802"
								? "撤销撤改申请成功"
								: "撤销撤改无需审核";
						if (orderData[index].ifprint == 1) {
							dispatch(
								"uploadPrintInfo",
								{
									land_id: orderData[index].lid,
									num: orderData[index].verified_num, //撤销只能把所有验证的都退掉
									type: 4,
									order: orderData[index].ordernum
								},
								{root: false}
							);
						}
					} else {
						failList.push({
							msg: item.msg,
							ttitle: orderData[index].ttitle
						});
					}
				});
				resultPrompt(failList, successText);
				dispatch("updatePageLoading", false, {root: true});
			});
		},
		//部分座位票打印
		async seatPrintTicket({state, commit, dispatch, rootState}, list) {
			dispatch("printSeatTicket", {printList: list, type: 2}, {root: true})
				.then(resList => {
				})
				.catch(err => {
					//出票失败
				});
		},
		//取票
		async ticketFetch({state, commit, dispatch, rootState}, payload) {
			let confirm = await Message.confirm(
				"确定要对该票进行该操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			);
			if (!confirm) return false;
			const position = payload.position;
			const mainTicket = payload.orderData[0];
			const seatStatus = payload.type
			let ifOneMacthOne = false;
			//主票的codes存在且其下所有元素都以'OD#开头'视为一票一码，当以身份证查询到的时候打印需要传idcard
			if (mainTicket.codes) {
				ifOneMacthOne = mainTicket.codes.every(item =>
					item.startsWith("OD#")
				);
			}
			//传给打印接口的参数
			const printInfo = {
				lid: mainTicket.lid,
				applyDid: mainTicket.sellid,
				idcards: mainTicket.idcards,
				ordernum: mainTicket.ordernum,
				type: mainTicket.ifprint == 1 ? 2 : 3, //1==售票打印  2==重打印  3==取票打印
				idcard: ifOneMacthOne ? state.idcard : ""
			};
			//修改本地数据的参数
			const fixData = {
				ifprint: 1
			};
			//console.log(ifOneMacthOne ? state.idcard : "");
			//出票
			if (seatStatus && mainTicket.p_type === "H" && state.queryType !== 'personid') {
				printInfo.seatStatus = true;
				dispatch("printTicket", printInfo, {root: true})
					.then(resList => {
						commit('set_seatList', {list: resList})
					})
					.catch(err => {
						//出票失败
					});
			} else {
				dispatch("printTicket", printInfo, {root: true})
					.then(resList => {
						//如果出票成功了 将'取票'更新未已打印
						commit("fix_localData", {
							position: position,
							ordernum: mainTicket.ordernum,
							fixData: fixData
						});
						//开启取票验证
						if (rootState.setting.data.ticket_pick == 1) {
							const timestamp = Date.parse(new Date())
								.toString()
								.substring(0, 10);
							Service.orderCheck({
								ordernum: mainTicket.ordernum,
								source: 4,
								msg: "云票务买即验"
							}).then(res => {
								if (!res || res.code != 200) {
									Message.alert(
										res.msg || "验证失败，服务器出错",
										"提示"
									);
									return false;
								} else {
									Message.success("验证成功");
								}
							});
						}
					})
					.catch(err => {
						//出票失败
					});
			}
		},
		//退票操作
		async ticketRefund({state, commit, dispatch, rootState}, payload) {
			let confirm = await Message.confirm(
				"确定要对该票进行退票操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			);

			if (!confirm) return false;
			let posOrderData = payload.orderData[0];
			let pmodeType = payload.orderData[0].pmode;

			//如果是pos支付退款，先验证是否可以退
			if (pmodeType == '19') {
				let res = await posPayRefund(posOrderData, '0');
				if (res.code != 200) {
					Message.error(res.msg)
					return false
				}
			}

			dispatch("updatePageLoading", true, {root: true});
			const orderData = payload.orderData;
			const position = payload.position;
			let queue = orderData.map(item => {
				let canRefundNum = NP.minus(
					item.origin_num,
					item.verified_num,
					item.refund_num
				);
				//map+assign+promise会出现promise.all的时候所有promise都使用最后一项item的情况
				return Service.modifyTicketNum({
					num: NP.minus(
						item.origin_num - item.refund_num,
						canRefundNum
					), //退票后的数量
					ordernum: item.ordernum, //订单号
					apply_did: rootState.userInfo.member_id,
					channel: 4

				});
			});

			let successList = [];
			let failList = [];
			Promise.all(queue).then(resList => {
				// console.log(resList);
				dispatch("updatePageLoading", false, {root: true});
				resList.forEach((item, index) => {
					// console.log(item);
					const ticket = orderData[index];
					const canRefundNum = NP.minus(
						ticket.origin_num,
						ticket.verified_num,
						ticket.refund_num
					);
					//本地数据修正
					const fixData = {
						tnum: NP.minus(
							ticket.origin_num - ticket.refund_num,
							canRefundNum
						),
						refund_num: NP.plus(ticket.refund_num, canRefundNum)
					};
					//退票作废的打印信息
					const printInfo = {
						land_id: ticket.lid,
						num: canRefundNum,
						type: 4,
						order: ticket.ordernum
					};
					if (item.code == 200) {
						commit("fix_localData", {
							position: position,
							ordernum: ticket.ordernum,
							fixData: fixData
						});
						if (ticket.ifprint == 1) {
							dispatch("uploadPrintInfo", printInfo, {
								root: false
							});
						}
					} else {
						failList.push({
							msg: item.msg,
							ttitle: ticket.ttitle
						});
					}
				});
				console.log(failList);
				resultPrompt(failList);
			});
		},
		//已打印的票退票成功后要进行退票作废记录
		uploadPrintInfo({state, commit, dispatch, rootState}, payload) {
			return Service.uploadPrintInfo(payload)
			// .then(res => {
			// 	if (res.code != 200) {
			// 		Message.error(res.msg || "退票作废记录失败。");
			// 	}
			// });
		},

		//支付
		async pay({state, commit, dispatch, rootState}, payload) {
			if (payload.type == 0) {
				payOrderOffline({
					ordernum: payload.ordernum,
					total_fee: payload.totalFee
				});
			} else if (payload.type == 1 || payload.type == 2) {
				payOrder({
					ordernum: payload.ordernum
				});
			}
		}
	},
	mutations: {
		//设置座位
		set_seatList(state, val) {
			var list = cloneDeep(val)
			state.seatList = list.list
		},
		update_state(state, map) {
			Object.entries(map).forEach(item => {
				let key = item[0];
				let value = item[1];
				state[key] = value;
			});
		},
		fix_localData(state, payload) {
			let newData = cloneDeep(state.orderList);
			let target = newData[payload.position].find(
				item => item.ordernum == payload.ordernum
			);
			console.log(payload.fixData);
			Object.entries(payload.fixData).forEach(item => {
				let key = item[0];
				let value = item[1];
				target[key] = value;
			});

			state.orderList = newData;
		}
	}
});

export default store;

//失败原因提示（）
function resultPrompt(failList, successText) {
	const h = new Vue().$createElement;
	failList.length == 0
		? Message.success(successText || "操作成功")
		: Message.alert({
			title: "操作失败",
			message: h(
				"p",
				null,
				failList.map(item =>
					h(
						"p",
						{
							style: "color: red;margin-bottom:10px;"
						},
						`失败票名： ${item.ttitle} ， 错误原因：${item.msg}`
					)
				)
			)
		});
}
