import "./index.scss";
import Vuex from "vuex";
import * as Service from "@/service";
import Message from "@/util/message";
import allInPay from "@/util/allInPay";
import Vue from "vue";
import Storage, { KEY } from "@/util/storage";
const PRINT_UUID_KEY = KEY.PRINT_UUID_KEY;
let _UUID = Storage.get(PRINT_UUID_KEY) || 0;
const { mapActions, mapMutations } = Vuex.createNamespacedHelpers(
	"picking&refund"
);

export default {
	template: require("./index.xtpl"),
	data() {
		return {
			dialogVisible: false,
			willRefundList: [],
			num: 0,
			orderStatusPopShow: false,
			orderStatus: 0,
			KEYUP_TIME_DISTANCE: 50,
			paycode: "", //付款码
			//每个状态对应的文字
			orderStatusText: "",
			payText: "",
			payTypeDialogs: ''
		};
	},

	props: {
		orderData: {
			default: ""
		},
		positionIndex: {
			type: Number
		}
	},
	mounted() {
		document.addEventListener("keydown", this.onKeydown, false);
	},
	beforeDestroy() {
		document.removeEventListener("keydown", this.onKeydown);
	},

	computed: {
		commonInfo: function() {
			return this.orderData[0];
		},
		totalMoney: function() {
			return this.orderData.reduce((total, item) => {
				return this.$NP.plus(
					total,
					this.$NP.times(this.$NP.divide(item.tprice, 100), item.tnum)
				);
			}, 0);
		}
	},

	methods: {
		...mapActions(["pay"]),
		...Vuex.mapActions(["printTicket"]),
		...mapMutations(["fix_localData"]),
		async goPay(type) {

			this.payTypeDialogs = type;
			this.payText = type;
			this.orderStatusPopShow = true;
			this.orderStatus = 100;

			const ordernum = this.orderData[0].ordernum;
			const totalMoney = this.totalMoney;
			const lid = this.orderData[0].lid;
			const applyDid = this.orderData[0].aid;
			const userInfo=this.$store.state.userInfo
			let that = this;
			if (type == "cash") {
				if (this.$store.state.setting.data.cash_confirm == 1) {
					let comfirm = false;
					try {
						confirm = await Message.confirm(
							`请收现金：${that.totalMoney} 元`,
							"确认收现",
							{
								confirmButtonText: "确定",
								cancelButtonText: "取消",
								type: "warning"
							}
						);
					} catch (err) {
						if (!comfirm) {
							that.closeStatusPop();
							return false;
						}
					}
				}
				//现金支付
				const payOfflineRes = await Service.payOrderOffline(
					{
						ordernum,
						total_fee: totalMoney * 100,
						siteId:userInfo.siteId
					},
					"v1"
				);
				if (!payOfflineRes || payOfflineRes.code != 200) {
					this.orderStatus = 400;
					this.orderStatusText = payOfflineRes
						? payOfflineRes.msg || this.$AJAX_ERROR_TEXT
						: this.$AJAX_ERROR_TEXT;
				} else {
					this.fix_localData({
						position: this.positionIndex,
						ordernum: this.orderData[0].ordernum,
						fixData: {
							pay_status: "1"
						}
					});
					this.buySuccess({ ordernum: ordernum, lid, applyDid });
				}
			} else if (type == "credit") {
				//授信支付
				this.buySuccess({ ordernum: ordernum, lid, applyDid });
			} else if (type == 'tlpos') {
				this.orderStatus = 201;
				this.payText = type;
				this.merchantID = this.$store.state.userInfo.parent_member_id;
				let that = this;
				let money = [totalMoney,ordernum];
				allInPay({cmd:'allinpayPos',data:money}).then(res => {
					if (res.code == 200) {
						const payOfflineRes = Service.payOrderOffline({
							ordernum,
							total_fee: totalMoney * 100,
							tradeno:res.data,
							siteId:userInfo.siteId,
							sorceT:16
						},
						"v1").then(res => {

								if (!res || res.code != 200) {
									that.orderStatus = 400;
									that.orderStatusText = res ? (res.msg || that.$AJAX_ERROR_TEXT) : that.$AJAX_ERROR_TEXT;
									return false;
								}
								that.buySuccess({ ordernum: ordernum, lid, applyDid });
								that.toggle();
							}).catch(err => {
								Message.error(`支付失败，失败原因：${err}`);
							}
							);
					} else {
						Message.error(`支付失败，失败原因：${msg}`);
					}
					that.closeStatusPop(res.code);
				}).catch(err => {
					Message.error(`支付失败，失败原因：${err}`);
					that.closeStatusPop(221);
				});

			} else {
				//在线支付  支付宝或微信
				this.orderStatus = 201;
				if (this.$store.state.setting.data.mobile_pay_checked === 'barCodeBox'){
					console.log('扫码盒子')
					_UUID++;
					Storage.set(PRINT_UUID_KEY, _UUID);
					Vue.ws.send({cmd:'scanData',reqid: _UUID,data:[60000]}, res => {
						if(Number(res.code)===200 && res.data !==null){
							let mainTicket = this.orderData[0];
							const payText = this.payText;
							const payType = payText == "alipay" ? 1 : 2;
							const ordernum = mainTicket.ordernum;
							const merchantID = mainTicket.sellid;
							this.orderStatus = 202;

							Service.payOrder({
								pay_type: payType,
								channel: payType,
								auth_code: res.data.replace(/[\r\n]/g,''),
								ordernum: ordernum,
								siteId:userInfo.siteId,
								merchant_id: merchantID
							}).then(res => {
								if (!res || res.code != 200) {
									that.orderStatus = 400;
									that.orderStatusText =
										res.msg || "支付失败，请稍后重试";
								} else {
									that.fix_localData({
										position: that.positionIndex,
										ordernum: mainTicket.ordernum,
										fixData: {
											pay_status: "1"
										}
									});
									const lid = mainTicket.lid;
									const applyDid = mainTicket.sellid;

									that.buySuccess({ ordernum, lid, applyDid });
								}
							});
						}

					})
				}
			}
		},
		toggle() {
			this.dialogVisible = !this.dialogVisible;
		},
		//从字典查询支付方式
		computePayMode(pay_mode, member) {
			return `${this.$store.state.dictionary.order_paymode[pay_mode]}-${
				member == 112 ? "散客" : "分销商"
			}`;
		},
		//拼接票类状态
		computeOrderMode(pay_status, status, ifprint) {
			return `${pay_status == 1 ? "已支付" : "未支付"}-${
				this.$store.state.dictionary.order_status[status]
			}-${ifprint == 1 ? "已出票" : "未出票"}`;
		},
		closeStatusPop(code) {
			if (this.orderStatus === 201) {
				_UUID++;
				Storage.set(PRINT_UUID_KEY, _UUID);
				Vue.ws.send({cmd: 'scanDataStop', reqid: _UUID});
			}
			this.orderStatusPopShow = false;
			//重新恢复一些相关值到初始状态
			this.orderStatus = 0;
			this.orderStatusText = "";
			this.paycode = "";
			this.lastKeydownTime = "";
			this.orderStatusText = "";
			this.payText = "";

		},
		/**
		 * 购票成功后的接下来流程
		 */
		async buySuccess({ ordernum = "", lid = "", applyDid = "" }) {
			let that = this;
			console.log("buySuccess", "ordernum=" + ordernum);
			Message.success("购票成功！正在为您打印门票，请稍后..");
			this.closeStatusPop(200);
			let mainTicket = this.orderData[0];
			let ifOneMacthOne = false;
			//主票的codes存在且其下所有元素都以'OD#开头'视为一票一码，当以身份证查询到的时候打印需要传idcard
			if (mainTicket.codes) {
				ifOneMacthOne = mainTicket.codes.every(item =>
					item.startsWith("OD#")
				);
			}
			this.printTicket({
				ordernum,
				lid,
				applyDid,
				idcard: ifOneMacthOne
					? that.$store.state["picking&refund"].idcard
					: ""
			})
				.then(res => {
					that.fix_localData({
						position: that.positionIndex,
						ordernum: mainTicket.ordernum,
						fixData: {
							ifprint: "1"
						}
					});
				})
				.catch(err => {
					console.log(err);
				});
		},
		//处理扫描付款码
		onKeydown(e) {
			let that = this;
			const orderStatus = this.orderStatus;
			const KEYUP_TIME_DISTANCE = this.KEYUP_TIME_DISTANCE;
			let paycode = this.paycode;
			let lastKeydownTime = this.lastKeydownTime;
			if (orderStatus != 201) return false;
			//如果是按住了ctrl alt shift meta键，则不做任何处理
			if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return false;
			const now = new Date().getTime();
			const KEY_CODE = ["Tab", "Enter"];
			if (KEY_CODE.includes(e.code)  && paycode) {
				//触发了tab键 表示扫码结束
				//扫码成功，会得到一个付款码payCode
				console.log("paycode", paycode);
				let mainTicket = this.orderData[0];
				const payText = this.payText;
				const payType = payText == "alipay" ? 1 : 2;
				const ordernum = mainTicket.ordernum;
				const merchantID = mainTicket.sellid;
				this.orderStatus = 202;

				Service.payOrder({
					pay_type: payType,
					channel: payType,
					auth_code: paycode,
					siteId: this.$store.state.userInfo.siteId,
					ordernum: ordernum,
					merchant_id: merchantID
				}).then(res => {
					if (!res || res.code != 200) {
						that.orderStatus = 400;
						that.orderStatusText =
							res.msg || "支付失败，请稍后重试";
					} else {
						that.fix_localData({
							position: that.positionIndex,
							ordernum: mainTicket.ordernum,
							fixData: {
								pay_status: "1"
							}
						});
						const lid = mainTicket.lid;
						const applyDid = mainTicket.sellid;

						that.buySuccess({ ordernum, lid, applyDid });
					}
				});
			} else {
				//如果输入的不是数字，也不做处理
				if (e.code.indexOf("Digit") !== 0) return false;
				//如果这次的输入与上一次输入时间间隔大于50毫秒，也过滤掉，不做处理
				if (
					lastKeydownTime > 0 &&
					now - lastKeydownTime > KEYUP_TIME_DISTANCE
				)
					return false;
				lastKeydownTime = now;
				this.paycode += e.key;
			}
		}
	}
};
