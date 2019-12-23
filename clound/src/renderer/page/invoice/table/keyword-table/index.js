import "./index.scss";
import Vuex from "vuex";
import * as Service from "../../service.js";
import Message from "@/util/message";


export default {
	template: require("./index.xtpl"),

	data() {
		return {
			ordernum: "",
			order: {},
		};
	},

	props: {
		orderData: {
			type: Array,
			default: []
		}
	},
	components: {

	},
	methods: {
		//订单状态颜色
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
		//订单状态
		invoice: function (val) {
			let invoiceHtml = '';
			switch (parseInt(val)) {
				//未开票
				case 0:
					invoiceHtml = '未开票';
					break;
				case 1:
					invoiceHtml = '未开票';
					break;
				case 2:
					invoiceHtml = '开票成功';
					break;
				case 3:
					invoiceHtml = '未开票';
					break;
				case 4:
					invoiceHtml = '已申请';
					break;
				case 5:
					invoiceHtml = '已开电子发票';
					break;
				case 6:
					invoiceHtml = '已开纸质发票';
					break;
			}
			return invoiceHtml;
		},
		openInvoice(info) {
			let ordernum = info.ordernum;
			let confirm = Message.confirm(
				"确定要对该票进行开具纸质发票操作吗?",
				"提示",
				{
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}
			).then(result => {
				Service.updatePaperTickets({
					order_num: ordernum
				})
					.then(res => {
						if (res.code == 200) {
							Message.success("开具纸质发票成功");
							info.invoice_status = "6";
						} else {
							Message.alert(res.msg || "退票失败", "提示");
						}
					})
					.catch(err => {
						Message.alert(err || "开具失败", "提示");
					});
			}).catch(err => {
				this.$message('用户已取消');
				return false;
			})

		}
	}
};
