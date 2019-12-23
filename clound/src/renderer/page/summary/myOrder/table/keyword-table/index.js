import "./index.scss";
import Vuex from "vuex";
import * as Service from "../../service.js";
import Message from "@/util/message";

import orderDetails from "../../components/OrderDetails";
import partialRefund from "../../components/partial-refund";

export default {
	template: require("./index.xtpl"),

	data () {
		return {
			chooseOrderData: "",
			ordernum: "",
			order: {},
			centerDialogVisible: false,
			modifyValue: {
				visible: false,
				ordernum: "",
				inputMoney: "",
				inputTitle: "",
				lid: ""
			},
		};
	},

	props: {
		orderData: {
			type: Array,
			default: []
		}
	},
	components: {
		partialRefund,
		orderDetails
	},
	methods: {
		toColor: function (value) {
			let color = "f07845";
			switch (parseInt(value)) {
				//未使用
				case 0:
					color = "#f07845";
					break;
				//已使用
				case 1:
					color = "green";
					break;
				//已过期
				case 2:
					color = "#f07845";
					break;
				//被取消
				case 3:
					color = "#92a0ab";
					break;
				//撤改
				case 4:
					color = "#92a0ab";
					break;
				//撤改
				case 5:
					color = "#92a0ab";
					break;
				//撤销
				case 6:
					color = "#92a0ab";
					break;
			}
			return color;
		},
		rePrint (item) {
			this.$store.dispatch("printTicket", {
				type: 2,
				ordernum: item.ordernum,
				lid: item.lid.id,
				applyDid: item.apply_did
			});
		},



		// 打印发票
		onInvoicePrintBtnClick (item) {
			this.$set(this.$data, 'modifyValue', {
				visible: true,
				type: "invoice",
				inputMoney: "",
				inputTitle: "",
				ordernum: item.ordernum
			})
		},
		// 打印回执单
		onReceiptPrintBtnClick (order) {
			let shopStatus=order.concat_info.concat_id.indexOf(',')
			let merge_receipt=this.$store.state.setting.data.merge_receipt
			let that = this;
			if(shopStatus>=0&&merge_receipt>0){
				let num=order.concat_info.concat_tum
					,price=order.concat_info.concat_total_money
					,ordernum=order.concat_info.concat_id.split(',')
					,lid=[];
				console.log(order.concat_info)
				let title=`<p>合计人数：${num}人</p><p>合计金额：${price}元</p>`
				this.$confirm(title, '选择回执单打印模式', {
					confirmButtonText: '购物车订单打印',
					dangerouslyUseHTMLString:true,
					distinguishCancelAndClose:true,
					cancelButtonText: '单笔订单打印'
				}).then(() => {
					this.$store.dispatch("printMergeReceipt", {
						ordernum: ordernum,
						lid: lid
					})
				}).catch(action  => {
					action==='cancel'&&singleReceipt()
				});
			}else {
				singleReceipt()
			}
			//单笔打印
			function singleReceipt() {
				that.$set(that.$data, 'modifyValue', {
					visible: true,
					type: "receipt",
					inputMoney: "",
					inputTitle: "",
					ordernum: order.ordernum,
					lid: order.lid.id
				})
			}
		},

		//确认发票/回执单打印
		confirmPrint () {
			if (this.modifyValue.type == 'invoice') {
				this.$store.dispatch("printInvoice", {
					ordernum: this.modifyValue.ordernum,
					inputMoney: this.modifyValue.inputMoney,
					inputTitle: this.modifyValue.inputTitle,
				})
			} else if (this.modifyValue.type == 'receipt') {
				this.$store.dispatch("printReceipt", {
					ordernum: this.modifyValue.ordernum,
					inputMoney: this.modifyValue.inputMoney,
					lid: this.modifyValue.lid
				})
			}
			this.$set(this.$data.modifyValue, 'visible', false)
		},

		showOrder (order) {
			// console.log(order.ordernum);
			this.centerDialogVisible = true;
			this.ordernum = order.ordernum;
			this.order = order;
		},
		//部分退票
		async partialRefund (payload) {
			let that = this;
			this.$store.dispatch("updatePageLoading", true);
			Service.getOrderTouristInfo({
				ordernum: payload.ordernum
			})
				.then(res => {
					if (res.code == 200) {
						that.chooseOrderData = Object.assign(res.data, {
							ordernum: payload.ordernum,
							title: payload.tid.title,
							tprice: payload.sale_money,
							ifprint: payload.print.id,
							lid: payload.lid.id
						});
						that.$refs.partialRefund.toggle();
						that.$store.dispatch("updatePageLoading", false);
					} else {
						Message.alert(res.msg || "退票失败", "提示");
					}
				})
				.catch(err => {
					Message.alert(err || "查询失败", "提示");
					that.$store.dispatch("updatePageLoading", false);
				});
		},
		//全部退票（取消）
		async refund (payload) {
			let that = this;
			let confirm = await Message.confirm(
				"确定要对该票进行退票操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			);
			if (confirm) {
				this.$store.dispatch("updatePageLoading", true);
				let params = {
					apply_did: this.$store.state.userInfo.member_id,
					num: 0,
					ordernum: payload.ordernum,
					channel: 4
				};
				Service.allRefund(params)
					.then(res => {
						if (res.code == 200) {
							Message.success("退票成功");
							if (payload.print.id == 1) {
								Service.uploadPrintInfo({
									type: 4,
									land_id: payload.lid.id,
									num: payload.tnum,
									order: payload.ordernum
								});
							}

							payload.button.cancel = 0;
							payload.status.name = "已取消";
						} else {
							Message.alert(res.msg || "退票失败", "提示");
						}
						that.$store.dispatch("updatePageLoading", false);
					})
					.catch(err => {
						Message.alert(err || "查询失败", "提示");
						that.$store.dispatch("updatePageLoading", false);
					});
			}
		}
	}
};
