import "./index.scss";
import * as Service from "../../service";
import partialRefund from "../partialRefund";
import payDialog from "../payDialog";
import Message from "@/util/message";

import Vuex from "vuex";
const {mapState, mapActions,mapMutations  } = Vuex.createNamespacedHelpers("picking&refund");

export default {
	template: require("./index.xtpl"),

	props: {
		orderData: {
			type: [Array],
			default: []
		},
		type: {
			type: String,
			default: "refund"
		},
		// 用于查找本地修改的数据位置索引
		positionIndex: {
			type: Number
		}
	},

	data() {
		return {
			hoverTextState: false,
			serverFee: this.orderData.map(item => 0),
			chooseOrderData:[], //选择的进行部分退票的票数据,
			checkAllSeat: true,
			checkedSeat: [],
			isIndeterminate: false
		};
	},
	mounted() {
		let that = this;
		//退票手续费不会随查单接口返回,要单独调取接口
		if (this.type == "refund") {
			this.orderData.forEach((item, index) => {
				Service.getCostFee({ ordernum: item.ordernum }).then(res => {
					if (res.code == 200) {
						that.$set(that.$data.serverFee, index, res.data.fee);
					}
				});
			});
		}
	},

	components: {
		partialRefund,
		payDialog
	},

	computed: {
		//座位打印选择
		...mapState([
			'seatList'
		]),
		totalServerFee: function() {
			let mainTicket = this.computedOrderData[0];
			//撤销
			if (
				mainTicket.verified_num != 0 &&
				mainTicket.origin_num - mainTicket.refund_num ==
					mainTicket.verified_num
			) {
				return this.orderData.reduce((pre, cur, index) => {
					let canOperateNum = cur.verified_num;
					if (cur.ifpack != 2) {
						return (
							pre +
							this.$NP.times(canOperateNum, this.serverFee[index])
						);
					} else {
						return pre + 0;
					}
				}, 0);
			} else {
				// 退票
				return this.orderData.reduce((pre, cur, index) => {
					let canOperateNum =
						cur.origin_num - cur.verified_num - cur.refund_num;
					if (cur.ifpack != 2) {
						return (
							pre +
							this.$NP.times(canOperateNum, this.serverFee[index])
						);
					} else {
						return pre + 0;
					}
				}, 0);
			}
		},
		totalRefundMoney: function() {
			let mainTicket = this.computedOrderData[0];
			//撤销
			if (
				mainTicket.verified_num != 0 &&
				mainTicket.origin_num - mainTicket.refund_num ==
					mainTicket.verified_num
			) {
				return this.orderData.reduce((pre, cur, index) => {
					let canOperateNum = cur.verified_num;
					if (cur.ifpack != 2) {
						return (
							pre -
							this.$NP.times(
								canOperateNum,
								this.serverFee[index]
							) +
							this.$NP.times(canOperateNum, cur.tprice)
						);
					} else {
						return pre + 0;
					}
				}, 0);
			} else {
				return this.orderData.reduce((pre, cur, index) => {
					let canOperateNum =
						cur.origin_num - cur.verified_num - cur.refund_num;
					if (cur.ifpack != 2) {
						return (
							pre -
							this.$NP.times(
								canOperateNum,
								this.serverFee[index]
							) +
							this.$NP.times(canOperateNum, cur.tprice)
						);
					} else {
						return pre + 0;
					}
				}, 0);
			}
		},
		computedOrderData: function() {
			//退票时不显示子票
			if (this.type == "refund") {
				return this.orderData.filter(item => item.ifpack != 2);
			} else {
				return this.orderData;
			}
		},
		//主票信息
		commonInfo: function() {
			return this.orderData[0];
		},
		//用户信息
		userInfo: function() {
			return this.orderData
				.filter(item => item.batch_check != 1 || item.batch_check != 2)
				.map(item => {
					return {
						title: item.ttitle
					};
				});
		},
		//取退票是否启用
		isAvaliable: function() {
			//只要主票数量为0就不可退票、取票
			let ifMainTicket =
				this.orderData.reduce(
					(pre, cur) =>
						pre + cur.ifpack != 2
							? cur.origin_num - cur.refund_num
							: 0,
					0
				) > 0;

			let ifExpired = this.orderData[0].status == 2;

			//只有主票有数量且未过期的票才可以退
			return ifMainTicket && !ifExpired;
		}
	},

	methods: {
		...mapActions(["ticketFetch", "ticketRefund", "ticketRevoke","seatPrintTicket"]),
		...mapMutations(['set_seatList']),
		initSeat(){
			this.checkedSeat =this.seatList;
			this.isIndeterminate = false;
		},
		seatPrint(){
			if(this.checkedSeat.length===0){
				this.$message.warning('请选择要打印的座位号');
				return
			}
			this.seatPrintTicket(this.checkedSeat);
			this.set_seatList({list:[]});
		},
		resetSeat(){
			this.$nextTick(() => {
				this.set_seatList({list:[]})
			})
		},
		//座位选择打印
		handleCheckAllSeat(val) {
			this.checkedSeat = val ? this.seatList : [];
			this.isIndeterminate = false;
		},
		handleCheckedSeatChange(value) {
			let checkedCount = value.length;
			this.checkAllSeat = checkedCount === this.seatList.length;
			this.isIndeterminate = checkedCount > 0 && checkedCount < this.seatList.length;
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
		//阶梯退票悬浮（暂时关闭）
		onRegularMouseenter(e) {
			let position = e.target.getBoundingClientRect();
			$("#hoverText")
				.show()
				.css({
					left: position.left + $(e.target)[0].offsetWidth + 10,
					top: position.top - 10
				});
		},
		onReguleMouseout() {
			$("#hoverText").hide();
		},
		computeTypeName(val) {
			switch (val) {
				case "A":
					return "景区";
				case "B":
					return "线路";
				case "C":
					return "酒店";
				case "F":
					return "套票";
				case "G":
					return "餐饮";
				case "H":
					return "剧场";
				case "I":
					return "年卡";
				case "J":
					return "特产";
				default:
					return "未知";
			}
		},
		//点击取票
		onClickPickButton(type) {
			this.ticketFetch({
				position: this.positionIndex,
				orderData: this.orderData,
				type:type||false
			});
		},
		//点击退票
		onClickRefundButton() {
			this.ticketRefund({
				position: this.positionIndex,
				orderData: this.orderData
			});
		},
		onClickRevokeButton() {
			this.ticketRevoke(this.orderData);
		},
		onClickTeamModify (orderData, type) {
			let that = this;
			Message.loading('信息加载中，请稍后...')
			//进行部分退票前要请求身份证信息接口，如果有身份证对应关系部分退票要做对应身份证的退票
			Service.getOrderTouristInfo({
				ordernum: orderData.ordernum
			})
				.then(res => {
					if (res.code == 200) {
						that.chooseOrderData = Object.assign(res.data, {
							ordernum: orderData.ordernum,
							title: orderData.ttitle,
							tprice: orderData.tprice,
							ifprint: orderData.ifprint,
							lid: orderData.lid,
							tnum: orderData.tnum,
							team_order: orderData.team_order,
							team_county: orderData.team_county,
							team_city: orderData.team_city,
							team_province: orderData.team_province,
						});
						// that.$refs.teamModify.toggle(type);
						Message.closeLoading()
					} else {
						Message.alert(res.msg || "获取游客信息失败", "提示");
					}
				})
				.catch(err => {
					Message.alert(err || "查询失败", "提示");
					Message.closeLoading()
				});
		},
		onClickPayButton() {
			this.$refs.payDialog.toggle();
		},
		//套票联票的选择进行部分退票
		handleCommand(index) {
			this.partialRefund(
				this.computedOrderData[index],
				this.serverFee[index],
				"refund"
			);
		},
		//部分退票
		async partialRefund(orderData, serverFee, type) {
			let that = this;
			this.$store.dispatch("updatePageLoading", true);
			//进行部分退票前要请求身份证信息接口，如果有身份证对应关系部分退票要做对应身份证的退票
			Service.getOrderTouristInfo({
				ordernum: orderData.ordernum
			})
				.then(res => {
					if (res.code == 200) {
						that.chooseOrderData = Object.assign(res.data, {
							ordernum: orderData.ordernum,
							title: orderData.ttitle,
							tprice: orderData.tprice,
							ifprint: orderData.ifprint,
							lid: orderData.lid,
							Mprice:orderData.Mprice,
							trade_no:orderData.trade_no,
							origin_num:orderData.origin_num,
							pmode:orderData.pmode,
							num:0,
							serverFee: serverFee
						});  
						that.$refs.partialRefund.toggle(type);
						that.$store.dispatch("updatePageLoading", false);
					} else {
						Message.alert(res.msg || "退票失败","提示");
					}
				})
				.catch(err => {
					Message.alert(err || "查询失败","提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		}
	}
};
