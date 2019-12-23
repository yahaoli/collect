import "./index.scss";
import Vuex from "vuex";
import * as Service from "../../service.js";
import Message from "@/util/message";

export default {
	template: require("./index.xtpl"),

	data() {
		return {
			dialogVisible: false,
			willRefundList: [],
			num: 0,
			serverFee: 0
		};
	},

	props: {
		orderData: {
			default: ""
		}
	},

	computed: {
		willRefundData: function() {
			return this.willRefundList.map(item => {
				return this.orderData.idCardArray.filter(
					son => son.id == item
				)[0];
			});
		}
	},

	watch: {
		willRefundList(value) {
			this.$set(this.$data, "num", value.length);
		},
		orderData(value) {
			let that = this;
			Service.getCostFee({
				ordernum: value.ordernum
			}).then(res => {
				if (res.code == 200) {
					that.serverFee = res.data.fee;
				}
			});
		}
	},

	methods: {
		toggle() {
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
		doRefund() {
			let that = this;
			if (that.num == 0) {
				Message.alert("请选择要退票的张数。","提示");
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
			)
				.then(result => {
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
								Message.success("退票成功");
								if (that.orderData.ifprint == 1) {
									Service.uploadPrintInfo({
										type: 4,
										land_id: that.orderData.lid,
										num: that.num,
										order: that.orderData.ordernum
									});
								}
								that.toggle();
							} else {
								Message.error(res.msg || "操作失败");
							}
						});
					}
				})
				.catch(err => {
					Message.alert(err || "查询失败","提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		}
	}
};
