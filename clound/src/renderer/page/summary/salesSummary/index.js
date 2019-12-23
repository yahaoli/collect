// require("./store");
import './index.scss';
import Message from '@/util/message';
import moment from 'moment';
import * as Service from './service';
import csvExport from '@/util/csvExport';

const FileSaver = require('file-saver');
// import html2canvas from "html2canvas";
import basePrint from '@/util/basePrint';

export default {
	template: require('./index.xtpl'),

	components: {},

	data() {
		return {
			SIZE: 10,
			total: 0,
			// showEmptyText: false,
			timeRange: [
				moment().format('YYYY-MM-DD'),
				moment().format('YYYY-MM-DD'),
			],
			summary: '',
			summaryList: [],
			pickerOptions: {
				shortcuts: [
					{
						text: '今天',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							picker.$emit('pick', [
								moment(start).format('YYYY-MM-DD'),
								moment(end).format('YYYY-MM-DD'),
							]);
						},
					},
					{
						text: '昨天',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24);
							end.setTime(end.getTime() - 3600 * 1000 * 24);
							picker.$emit('pick', [
								moment(start).format('YYYY-MM-DD'),
								moment(end).format('YYYY-MM-DD'),
							]);
						},
					},
					{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(
								start.getTime() - 3600 * 1000 * 24 * 7,
							);
							picker.$emit('pick', [
								moment(start).format('YYYY-MM-DD'),
								moment(end).format('YYYY-MM-DD'),
							]);
						},
					},
					{
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(
								start.getTime() - 3600 * 1000 * 24 * 30,
							);
							picker.$emit('pick', [
								moment(start).format('YYYY-MM-DD'),
								moment(end).format('YYYY-MM-DD'),
							]);
						},
					},
					{
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(
								start.getTime() - 3600 * 1000 * 24 * 90,
							);
							picker.$emit('pick', [
								moment(start).format('YYYY-MM-DD'),
								moment(end).format('YYYY-MM-DD'),
							]);
						},
					},
				],
			},
			scenicValue: [],
			scenicValueCurrent: [],
			oldOptions: [],
		};
	},
	mounted() {
		this.getScenicList(true);
		this.fecthSummary();
	},
	computed: {
		//汇总列表数据全部打平便于后面导出表格
		summaryListComputed: function() {
			return this.summaryList.map(item => {
				return {
					...item,
					order_price: this.$NP.divide(item.order_price, 100),
					cancel_price: this.$NP.divide(item.cancel_price, 100),
				};
			});
		},
		scenicList: function() {
			let scenicList = this.$store.state.scenicList;

			return scenicList.length ? [
				{ id: -1, title: '所有产品' },
				...this.$store.state.scenicList,
			] : [];
		},
	},
	methods: {
		selectAll(val) {
			// 用来储存上一次的值，可以进行对比
			let allValues = this.scenicList.map(item => item.id)
				, oldVal = this.oldOptions.length ? this.oldOptions : []
				, selectAll = val.indexOf(-1) >= 0
				, selectAllOld = oldVal.indexOf(-1) >= 0;
			// 若是全部选择
			if (selectAll) this.scenicValue = allValues;

			// 取消全部选中  上次有 当前没有 表示取消全选
			if (selectAllOld && !selectAll) this.scenicValue = [];

			// 点击非全部选中  需要排除全部选中 以及 当前点击的选项
			// 新老数据都有全部选中
			if (selectAllOld && selectAll) {
				const index = val.indexOf(-1);
				val.splice(index, 1); // 排除全选选项
				this.scenicValue = val;
			}

			//全选未选 但是其他选项全部选上 则全选选上 上次和当前 都没有全选
			if (!selectAllOld && !selectAll) {
				if (val.length === allValues.length - 1) this.scenicValue = [-1].concat(val);
			}

			//储存当前最后的结果 作为下次的老数据
			this.oldOptions = this.scenicValue;
		},
		getScenicList(refresh) {
			let timeRange = this.timeRange.map(item => moment(item).format('YYYYMMDD'));
			if (this.$store.state.scenicList.length === 0 || refresh) {
				//初始化全选设置
				this.scenicValue = '';
				this.oldOptions = [];
				this.$store.dispatch('getScenicList', { flag: null, date: timeRange }, { root: true });
			}
		},
		//当有全选时去掉全选
		getScenicValue: function() {
			let scenicValue = [].concat(this.scenicValue);
			return scenicValue.indexOf(-1) >= 0 ? '' : scenicValue.join(',');
		},
		//汇总查询
		fecthSummary() {
			let that = this;
			let params = {
				begin: this.timeRange
					? moment(this.timeRange[0]).format('YYYYMMDD')
					: moment().format('YYYYMMDD'),
				end: this.timeRange
					? moment(this.timeRange[1]).format('YYYYMMDD')
					: moment().format('YYYYMMDD'),
				// op_id: this.$store.state.userInfo.member_id,
				land_id: this.getScenicValue(),
			};
			this.$store.dispatch('updatePageLoading', true);
			Service.orderSummary(params)
				.then(res => {
					if (res.code == 200) {
						//后端的数据暂时有问题，让用前端算
						res.data.receivable = res.data.order_summary.reduce(
							(pre, cur) => {
								/*let itemInCancel = res.data.cancel_summary.find(
									item => (item.name == cur.name || item.name == cur.name)
								);
								if (itemInCancel) {
									console.log(pre)
									return [
										...pre,
										{
											name: cur.name,
											ticket: that.$NP.minus(
												cur.ticket,
												itemInCancel.ticket
											),
											money: that.$NP.minus(
												cur.money,
												itemInCancel.money
											)
										}
									];
								} else {
									return [...pre, cur];
								}
								return pre;*/
								let itemInCancel = {}, itemInRefund = {};
								res.data.cancel_summary.forEach(item => {
									if (item.name === cur.name) {
										itemInCancel = item;
									} else if (item.name === cur.name + '(撤改)') {
										itemInRefund = item;
									}
								});
								return [
									...pre,
									{
										name: cur.name,
										ticket: that.$NP.minus(
											cur.ticket,
											itemInCancel.ticket || 0,
											itemInRefund.ticket || 0,
										),
										money: that.$NP.minus(
											cur.money,
											itemInCancel.money || 0,
											itemInRefund.money || 0,
										),
									},
								];
							},
							[],
						);
						that.$set(that.$data, 'summary', res.data || '');
					} else {
						Message.alert(res.msg || '查询失败', '提示');
					}
					that.$store.dispatch('updatePageLoading', false);
				})
				.catch(err => {
					Message.alert(err || '查询失败', '提示');
					this.$store.dispatch('updatePageLoading', false);
				});
			this.getSummaryList();
		},
		//汇总表格查询
		async getSummaryList(page = 1) {
			if (!this.timeRange) {
				Message.alert('请选择时间', '提示');
				return false;
			}
			let that = this;
			let params = {
				begin_time: moment(this.timeRange[0]).format(
					'YYYY-MM-DD 00:00:00',
				),
				end_time: moment(this.timeRange[1]).format(
					'YYYY-MM-DD 23:59:59',
				),
				// op_id: this.$store.state.userInfo.member_id,
				lid: this.getScenicValue(),
				page: page,
				size: this.SIZE,
				is_summary: true,
			};

			await Service.getSummaryList(params)
				.then(res => {
					if (res.code == 200) {
						// console.log(res)
						that.summaryList = res.data;
						// that.total = res.data.total;
					} else {
						that.summary = '';
						that.summaryList = [];
						//that.total = 0;
						Message.error(res.msg || '查询失败', '提示');
					}
					// if (res.code == 200) {
					// that.summaryList = res.data.list;
					// that.total = res.data.total;
					// } else {
					//that.summary = "";
					// that.summaryList = [];
					// that.total = 0;
					// Message.error(res.msg || "查询失败", "提示");
					// }
				})
				.catch(err => {
					Message.alert(err || '查询失败', '提示');
					this.$store.dispatch('updatePageLoading', false);
				});
		},

		changePage(page) {
			this.getSummaryList(page);
		},
		fetchTotal(data) {
			if (data && data.length > 0) {
				return data.reduce(
					(pre, cur) => {
						console.log();
						return {
							ticket: this.$NP.plus(pre.ticket, cur.ticket || 0),
							money: this.$NP.plus(pre.money, cur.money || 0),
						};
					},
					{ ticket: 0, money: 0 },
				);
			} else {
				return {
					ticket: 0,
					money: 0,
				};
			}
		},

		//打印报表
		async reportPrint() {
			let that = this;
			if (!this.timeRange) {
				Message.alert('请选择时间', '提示');
				return false;
			}

			if (
				moment(this.timeRange[0]).month() !=
				moment(this.timeRange[1]).month()
			) {
				Message.alert(
					'不能跨月打印报表，请确保开始时间和结束时间在同一月内。',
					'提示',
				);
				return false;
			}

			let confirm = await Message.confirm('确定要打印报表吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			});
			if (!confirm) {
				return false;
			}
			this.$store.dispatch('updatePageLoading', true);
			Service.exportStaffSaleReport({
				op_id: this.$store.state.userInfo.member_id,
				beginTime: moment(this.timeRange[0]).format(
					'YYYY-MM-DD 00:00:00',
				),
				endTime: moment(this.timeRange[1]).format(
					'YYYY-MM-DD 23:59:59',
				),
				landId: this.getScenicValue(),
			})
				.then(res => {
					that.$store.dispatch('updatePageLoading', false);
					if (res.code == 200) {
						// console.log(res);
						// Message.error('维护中')
						basePrint({
							cmd: 'printreports',
							data: res.data,
							template: {},
							printSet: {
								printName:
								that.$store.state.setting.data.invoice_print,
							},
							dataKey: 'reportData',
						});
					} else {
						Message.alert(
							res.msg || '导出失败，服务器错误',
							'提示',
						);
					}
				})
				.catch(err => {
					that.$store.dispatch('updatePageLoading', false);
					Message.error(err || '请求出错');
				});

			//图片格式导出
			// let timeRange = `${
			// 	this.timeRange
			// 		? moment().format("YYYYMMDD")
			// 		: moment(this.timeRange[0]).format("YYYYMMDD") +
			// 		  "至" +
			// 		  moment(this.timeRange[1]).format("YYYYMMDD")
			// }`;
			// let productName = this.scenicList.find(
			// 	item => item.id == this.scenicValue
			// ).title;
			// html2canvas(document.getElementById("summaryReport"), {
			// 	allowTaint: true,
			// 	useCORS: true
			// }).then(canvas => {
			// 	canvas.toBlob(function(blob) {
			// 		FileSaver.saveAs(
			// 			blob,
			// 			`销售报表-${timeRange}-${productName}.png`
			// 		);
			// 	});
			// });

			//前端做excel格式导出
			// if (!this.summary) {
			// 	Message.alert("没有可以导出的数据！");
			// 	return false;
			// }

			// let preContent = "\uFEFF"; //防乱码

			// //售票汇总
			// let order_summary = "售票汇总\n" + "支付方式,票数,金额（元）\n";
			// this.summary.order_summary.forEach(item => {
			// 	order_summary += `${item.name},${item.ticket},${this.$NP.divide(
			// 		item.money,
			// 		100
			// 	)}\n`;
			// });
			// this.summary.order_summary.length == 0
			// 	? (order_summary += `汇总,0,0\n\n`)
			// 	: (order_summary += `汇总,${
			// 			this.fetchTotal(this.summary.order_summary).ticket
			// 	  },${this.fetchTotal(this.summary.order_summary).money}\n\n`);

			// //退票汇总
			// let cancel_summary = "退票汇总\n" + "支付方式,票数,金额（元）\n";

			// this.summary.cancel_summary.forEach(item => {
			// 	cancel_summary += `${item.name},${
			// 		item.ticket
			// 	},${this.$NP.divide(item.money, 100)}\n`;
			// });

			// this.summary.cancel_summary.length == 0
			// 	? (cancel_summary += `汇总,0,0\n\n`)
			// 	: (cancel_summary += `汇总,${
			// 			this.fetchTotal(this.summary.cancel_summary).ticket
			// 	  },${this.fetchTotal(this.summary.cancel_summary).money}\n\n`);

			// //应收汇总
			// let arap_summary = "应收汇总\n" + "支付方式,票数,金额（元）\n";
			// this.summary.arap_summary.forEach(item => {
			// 	arap_summary += `${item.name},${item.ticket},${this.$NP.divide(
			// 		item.money,
			// 		100
			// 	)}\n`;
			// });

			// this.summary.arap_summary.length == 0
			// 	? (arap_summary += `汇总,0\n\n`)
			// 	: (arap_summary += `汇总,${
			// 			this.fetchTotal(this.summary.arap_summary).ticket
			// 	  },${this.fetchTotal(this.summary.arap_summary).money}\n\n`);

			// //打印汇总
			// let print_summary = "打印汇总\n" + "操作,打印票数\n";
			// this.summary.print_summary.forEach(item => {
			// 	print_summary += `${item.name},${item.ticket}\n`;
			// });

			// this.summary.print_summary.length == 0
			// 	? (print_summary += `汇总,0,0\n\n`)
			// 	: (print_summary += `汇总,${
			// 			this.fetchTotal(this.summary.print_summary).ticket
			// 	  }`);

			// let blob = new Blob(
			// 	[
			// 		preContent +
			// 			order_summary +
			// 			cancel_summary +
			// 			arap_summary +
			// 			print_summary
			// 	],
			// 	{
			// 		type: "text/plain;charset=utf-8"
			// 	}
			// );

			// FileSaver.saveAs(blob, `汇总报表.csv`);
		},

		//导出列表
		async exprotCsv() {
			if (
				moment(this.timeRange[1]) - moment(this.timeRange[0]) >
				7 * 24 * 3600 * 1000
			) {
				Message.alert('导出数据时间请不要超过7天', '提示');
				return false;
			}
			let timeRange = `${
				this.timeRange
					? moment().format('YYYYMMDD')
					: moment(this.timeRange[0]).format('YYYYMMDD') +
					'至' +
					moment(this.timeRange[1]).format('YYYYMMDD')
				}`;

			Service.getSummaryExcel({
				begin_time: this.timeRange
					? moment(this.timeRange[0]).format('YYYY-MM-DD 00:00:00')
					: moment().format('YYYY-MM-DD 00:00:00'),
				end_time: this.timeRange
					? moment(this.timeRange[1]).format('YYYY-MM-DD 23:59:59')
					: moment().format('YYYY-MM-DD 23:59:59'),
				// op_id: this.$store.state.userInfo.member_id,
				lid: this.getScenicValue(),
				size: this.SIZE,
				is_summary: true,
			})
				.then(res => {
					let table = res.split('\n');
					if (table.length > 1 && table[1]) {
						let blob = new Blob(table.map(item => (item += '\n')), {
							type: 'text/plain;charset=utf-8',
						});
						FileSaver.saveAs(
							blob,
							`销售记录清单-${timeRange}.csv`,
						);
					} else {
						Message.alert('导出失败，没有可导出的数据', '提示');
					}
				})
				.catch(err => {
					Message.alert('导出失败，服务器错误', '提示');
				});
		},
	},
};
