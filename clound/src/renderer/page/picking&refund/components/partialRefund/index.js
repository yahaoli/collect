import "./index.scss";
import Vuex from "vuex";
import * as Service from "../../service";
import Message from "@/util/message";
import posPayRefund from "@/util/posPayRefund";
import allInPay from "@/util/allInPay";

const {mapMutations, mapActions} = Vuex.createNamespacedHelpers(
	"picking&refund"
);

export default {
	template: require("./index.xtpl"),

	data() {
		return {
			dialogVisible: false,
			willRefundList: [],
			num: 0,
			type: "refund"
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

	computed: {
		willRefundData: function () {
			return this.willRefundList.map(item => {
				return this.orderData.idCardArray.filter(
					son => son.id == item
				)[0];
			});
		}
	},

	watch: {
		willRefundList(value) {
			console.log(value.length);
			this.$set(this.$data, "num", value.length); //选择身份证后做数量变更
		},
		orderData() {
			this.$set(this.$data, "num", 0); //联票切换部分退票时，初始数量重置为0
		}
	},

	methods: {
		...mapMutations(["fix_localData"]),
		...mapActions(["uploadPrintInfo"]),
		toggle(type) {
			if (type) {
				this.type = type;
			}
			this.dialogVisible = !this.dialogVisible;
		},
		computedCheckState(status) {
			switch (status) {
				case "0":
					return "未验证";
				case "1":
					return "已验证";
				case "2":
					return "已取消";
				case "3":
					return "撤改申请中";
				case "4":
					return "已撤改";
				default:
					return "未知";
			}
		},
		pickRefundOne(id) {
			this.willRefundList.includes(id)
				? null
				: this.willRefundList.push(id);
		},
		pickRevokeOne(id) {
			this.willRefundList.includes(id)
				? this.willRefundList.splice(this.willRefundList.indexOf(id), 1)
				: this.willRefundList.push(id);
		},
		chooseAll() {
			this.willRefundList = this.orderData.idCardArray
				.filter(item => item.check_state == 0)
				.map(item => item.id);
		},
		doRevoke() {
			let that = this;
			let pmodeType = that.orderData.pmode;
			if (pmodeType == '19') {
				Message.alert("pos支付订单暂不支持撤销撤改。", "提示");
				return false;
			}

			if (that.num == 0) {
				Message.alert("请选择要撤改的张数。", "提示");
				return false;
			}
			let confirm = Message.confirm(
				"确定要对该票进行撤改操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			).then(result => {
				if (result) {
					that.$store.dispatch("updatePageLoading", true);
					let terminal = that.$store.state.scenicList.find(
						i => i.salerid == i.salerid
					).terminal;
					if (!terminal) {
						Message.alert("无法获取到对应的终端号", "提示");
						return false;
					}
					Service.terminalRevoke({
						ordernum: that.orderData.ordernum,
						tnum: that.orderData.verified_num - that.num,
						terminal: terminal,
						tourist_info: that.willRefundList && that.willRefundList.toString(),
						account: that.$store.state.userInfo.account,
						token: that.$store.state.userInfo.token,
						op_member: that.$store.state.userInfo.member_id,
					})
						.then(res => {
							this.$store.dispatch("updatePageLoading", false);
							if (res.code == "0802" || res.code == "0901") {
								let successText =
									res.code == "0802"
										? "撤销撤改申请成功"
										: "撤销撤改无需审核";
								Message.success(successText);
								if (that.orderData.ifprint == 1) {
									that
										.uploadPrintInfo({
											land_id: that.orderData.lid,
											num: that.num,
											type: 4,
											order: that.orderData.ordernum
										})
										.then(printRes => {
											if (printRes.code != 200) {
												Message.error(
													printRes.msg ||
													"退票作废记录失败"
												);
											}
										});
								}
								that.toggle();
							} else {
								Message.error(res.msg || "操作失败");
							}
						})
						.catch(err => {
							Message.alert(err || "请求出错", "提示");
							this.$store.dispatch("updatePageLoading", false);
						});
				}
			});
		},
		doRefund() {
			let that = this;
			if (that.num == 0) {
				Message.alert("请选择要退票的张数。", "提示");
				return false;
			}
			let confirm = Message.confirm(
				"确定要对该票进行退票操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			).then(result => {
				let ad = that.$NP.minus(
					that.orderData.origin_num,
					that.orderData.refund_num,
					that.num
				);
				//如果是pos支付退款，先验证是否可以退
				let pmodeType = that.orderData.pmode;
				let payload = that.orderData;
				if (pmodeType == '19') {
					payload.num = that.num;
					posPayRefund(payload, '1').then(res => {
						console.log(res.data);
						console.log('---------------->>>>>>>>>>>>>>>>>>>>>>')
						if (res.code != 200) {
							Message.error(res.msg)
							return false;
						} else {
							if (result) {
								this.$store.dispatch("updatePageLoading", true);
								Service.numModify({
									ordernum: that.orderData.ordernum,
									surplus_num:
										that.orderData.origin_num -
										that.orderData.verified_num -
										that.orderData.refund_num -
										that.num,
									tourist_info: that.willRefundList.toString(),
									idcard_type: "reduce"
								}).then(res => {
									this.$store.dispatch("updatePageLoading", false);
									if (res.code == 200) {
										that.fix_localData({
											position: that.positionIndex,
											ordernum: that.orderData.ordernum,
											fixData: {
												tnum: that.$NP.minus(
													that.orderData.origin_num,
													that.orderData.refund_num,
													that.num
												),

												refund_num: that.$NP.plus(
													that.orderData.refund_num,
													that.num
												)
											}
										});
										Message.success("退票成功");
										if (that.orderData.ifprint == 1) {
											that
												.uploadPrintInfo({
													land_id: that.orderData.lid,
													num: that.num,
													type: 4,
													order: that.orderData.ordernum
												})
												.then(printRes => {
													if (printRes.code != 200) {
														Message.error(
															printRes.msg ||
															"退票作废记录失败"
														);
													}
												});
										}
										that.toggle();
									} else {
										Message.error(res.msg || "操作失败");
									}
								})
									.catch(err => {
										Message.alert(err || "请求出错", "提示");
										this.$store.dispatch("updatePageLoading", false);
									});
							}


						}
					});
				} else {
					if (result) {
						this.$store.dispatch("updatePageLoading", true);
						Service.numModify({
							ordernum: that.orderData.ordernum,
							surplus_num:
								that.orderData.origin_num -
								that.orderData.verified_num -
								that.orderData.refund_num -
								that.num,
							tourist_info: that.willRefundList && that.willRefundList.toString(),
							idcard_type: "reduce"
						})
							.then(res => {
								this.$store.dispatch("updatePageLoading", false);
								if (res.code == 200) {
									that.fix_localData({
										position: that.positionIndex,
										ordernum: that.orderData.ordernum,
										fixData: {
											tnum: that.$NP.minus(
												that.orderData.origin_num,
												that.orderData.refund_num,
												that.num
											),

											refund_num: that.$NP.plus(
												that.orderData.refund_num,
												that.num
											)
										}
									});
									Message.success("退票成功");
									if (that.orderData.ifprint == 1) {
										that
											.uploadPrintInfo({
												land_id: that.orderData.lid,
												num: that.num,
												type: 4,
												order: that.orderData.ordernum
											})
											.then(printRes => {
												if (printRes.code != 200) {
													Message.error(
														printRes.msg ||
														"退票作废记录失败"
													);
												}
											});
									}
									that.toggle();
								} else {
									Message.error(res.msg || "操作失败");
								}
							})
							.catch(err => {
								Message.alert(err || "请求出错", "提示");
								this.$store.dispatch("updatePageLoading", false);
							});
					}
				}
			});
		}
	}
};
