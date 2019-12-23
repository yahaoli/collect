require("./index.scss");
import moment from "moment";
import Vuex from "vuex";
import * as Service from "./service";

const FileSaver = require("file-saver");
import Message from "@/util/message";
import { cloneDeep } from "lodash";

import keywordTable from "./table/keyword-table";
import summaryTable from "./table/summary-table";

export default {
	template: require("./index.xtpl"),

	data() {
		return {
			distributorName: "",
			ticketName: "",
			actionList: [],
			payWayList: [],
			key_word: "",
			total: 0,
			PAGE_SIZE: 10,

			queryParams: {
				reseller_id: "",
				lid: "-1",
				tid: "",
				pay_mode: "-1",
				action: "-1"
			},
			searchType: 4, //用于导出，换页时判断表格类型
			timeRange: [
				moment().format("YYYY-MM-DD 00:00:00"),
				moment().format("YYYY-MM-DD 23:59:59")
			],
			myOrderData: [],
			plantOrderData: [],
			// chooseOrderData: "",
			// ordernum: "",
			// order: {},
			// centerDialogVisible: false
		};
	},

	mounted() {
		this.getScenicList();
		this.getSearchConfig();
	},

	components: {
		keywordTable,
		summaryTable
	},

	computed: {
		scenicList: function() {
			return [
				{ id: "-1", title: "所有产品" },
				...this.$store.state.scenicList
			];
		}
	},

	methods: {
		getScenicList() {
			if (this.$store.state.scenicList.length == 0) {
				this.$store.dispatch("getScenicList", {flag:null}, { root: true });
			}
		},
		chooseToday() {
			const end = new Date();
			const start = new Date();
			this.$set(this.$data, "timeRange", [
				moment(start).format("YYYY-MM-DD 00:00:00"),
				moment(end).format("YYYY-MM-DD 23:59:59")
			]);
		},
		chooseYesterday() {
			const end = new Date();
			const start = new Date();
			start.setTime(start.getTime() - 3600 * 1000 * 24);
			end.setTime(end.getTime() - 3600 * 1000 * 24);
			this.$set(this.$data, "timeRange", [
				moment(start).format("YYYY-MM-DD 00:00:00"),
				moment(end).format("YYYY-MM-DD 23:59:59")
			]);
		},
		chooseWeek() {
			const end = new Date();
			const start = new Date();
			const index = new Date().getDay() - 1;
			start.setTime(end.getTime() - 3600 * 1000 * 24 * index);
			this.$set(this.$data, "timeRange", [
				moment(start).format("YYYY-MM-DD 00:00:00"),
				moment(end).format("YYYY-MM-DD 23:59:59")
			]);
		},
		chooseMonth() {
			const end = new Date();
			this.$set(this.$data, "timeRange", [
				moment(end).format("YYYY-MM-01 00:00:00"),
				moment(end).format("YYYY-MM-DD 23:59:59")
			]);
		},
		//票联想搜索
		queryTicketAsync(key_word, callback) {
			if (this.queryParams.lid == -1) {
				Message.error("票名称搜索需要先选择产品!");
				return false;
			}
			Service.asyncSearch({
				type: 2,
				key_word: key_word,
				land_id: this.queryParams.lid
			}).then(res => {
				if (res.code == 200 && res.data.length != 0) {
					let list = Object.entries(res.data).map(item => {
						return {
							id: item[0],
							value: item[1]
						};
					});
					callback(list);
				} else {
					// Message.error("无法找到相关票类");
					this.$set(this.$data.queryParams, "tid", "");
					callback([]);
				}
			});
		},
		//选择票
		handleTicketSelect(item) {
			this.$set(this.$data.queryParams, "tid", item.id);
		},
		//分销商联想搜索
		queryDistributorAsync(key_word, callback) {
			Service.asyncSearch({ type: 4, key_word: key_word }).then(res => {
				if (res.code == 200 && res.data.length != 0) {
					let list = Object.entries(res.data).map(item => {
						return {
							id: item[0],
							value: item[1]
						};
					});
					callback(list);
				} else {
					// Message.error("无法找到相关分销商");
					this.$set(this.$data.queryParams, "reseller_id", "");
					callback([]);
				}
			});
		},
		//选择分销商
		handleDistributorSelect(item) {
			this.$set(this.$data.queryParams, "reseller_id", item.id);
		},
		//获取支付类型和操作类型列表
		getSearchConfig() {
			let that = this;
			Service.getSearchConfig().then(res => {
				if (res.code == 200) {
					that.$set(
						that.$data,
						"actionList",
						Object.entries(res.data.action).map(item => {
							return { label: item[1], value: item[0] };
						})
					);
					that.$set(
						that.$data,
						"payWayList",
						Object.entries(res.data.pay_way).map(item => {
							return { label: item[1].name, value: item[0] };
						})
					);
				}
			});
		},

		//使用凭证信息查询
		plantOrderSearch(type = 1, page = "") {
			let that = this;
			this.searchType = type;
			this.$store.dispatch("updatePageLoading", true);
			let params = {
				page: page,
				size: that.PAGE_SIZE,
				key_word: that.key_word,
				search_type: type
			};
			Service.fetchOrderList(params)
				.then(res => {
					if (res.code == 200) {
						that.myOrderData = res.data.list;
						that.total = res.data.total;
					} else {
						that.myOrderData = [];
						that.total = 0;
						Message.alert(res.msg || "操作失败","提示");
					}
					this.$store.dispatch("updatePageLoading", false);
				})
				.catch(err => {
					Message.alert(err || "查询失败","提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		},

		//使用汇总信息分页条件查询
		HuiOrderSearch(type = 4, page = "", begin_time,end_time,operate_id) {
			let that = this;
			this.searchType = type;
			this.$store.dispatch("updatePageLoading", true);
			let params = {
				page: page,
				size: that.PAGE_SIZE,
				search_type: type,
				begin_time:begin_time,
				end_time:end_time,
				operate_id:operate_id
			};
			Service.fetchOrderList(params)
				.then(res => {
					if (res.code == 200) {
						that.myOrderData = res.data.list;
						that.total = res.data.total;
					} else {
						that.myOrderData = [];
						that.total = 0;
						Message.alert(res.msg || "操作失败","提示");
					}
					this.$store.dispatch("updatePageLoading", false);
				})
				.catch(err => {
					Message.alert(err || "查询失败","提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		},
		//汇总查询
		myOrderSearch(page = 1) {
			let that = this;
			this.searchType = 4;

			if (!this.timeRange) {
				Message.alert("请选择时间","提示");
				return false;
			}

			let params = Object.assign(this.queryParams, {
				page: page,
				size: that.PAGE_SIZE,
				begin_time: moment(this.timeRange[0]).format("YYYY-MM-DD 00:00:00"),
				end_time: moment(this.timeRange[1]).format("YYYY-MM-DD 23:59:59"),
				operate_id: this.$store.state.userInfo.member_id,
				search_type: 4
			});
			let newParams = cloneDeep(params);
			for (let i in newParams) {
				newParams[i] == -1 ? (newParams[i] = "") : null;
			}
			//console.log(newParams);
			Service.fetchOrderList(newParams)
				.then(res => {
					if (res.code == 200) {
						// that.plantOrderData = res.data.list;
						that.myOrderData = res.data.list;
						that.total = res.data.total;
					} else {
						// that.plantOrderData = [];
						that.myOrderData = [];
						that.total = 0;
						Message.alert(res.msg || "操作失败","提示");
					}

					this.$store.dispatch("updatePageLoading", false);
				})
				.catch(err => {
					Message.alert(err || "查询失败","提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		},
		//分页器操作
		changePage(page) {
			if (this.searchType == 1 || this.searchType == 2) {
				this.plantOrderSearch(this.searchType, page);
			} else if (this.searchType == 3) {
				this.myOrderSearch(page);
			} else if (this.searchType == 4){
				let begin_time = moment(this.timeRange[0]).format("YYYY-MM-DD 00:00:00");
				let end_time = moment(this.timeRange[1]).format("YYYY-MM-DD 23:59:59");
				let operate_id=  this.$store.state.userInfo.member_id;
				this.HuiOrderSearch(this.search_type,page,begin_time,end_time,operate_id);
				//this.plantOrderSearch(this.searchType, page);
			}
		},
		//导出数据
		csvExport() {
			let that = this;
			let params;
			console.log(this.searchType);


			if (this.searchType == 4) {
				if (!this.timeRange) {
					Message.alert("请选择时间","提示");
					return false;
				}
				// console.log(moment(this.timeRange[1]).unix());
				// console.log(moment(this.timeRange[0]).unix());
				if (
					moment(this.timeRange[1]).unix() -
					moment(this.timeRange[0]).unix() >
					7 * 24 * 3600
				) {
					Message.alert("导出数据时间请不要超过7天","提示");
					return false;
				}
				params = cloneDeep(
					Object.assign(this.queryParams, {
						size: this.PAGE_SIZE,
						begin_time: this.timeRange
							? this.timeRange[0]
							: moment().format("YYYY-MM-DD 00:00:00"),
						end_time: this.timeRange
							? this.timeRange[1]
							: moment().format("YYYY-MM-DD 23:59:59"),
						operate_id: this.$store.state.userInfo.member_id,
						search_type: 4
					})
				);
				for (let i in params) {
					params[i] == -1 ? (params[i] = "") : null;
				}
			} else {
				params = {
					size: this.PAGE_SIZE,
					key_word: this.key_word,
					search_type: this.searchType
				};
			}
			let timeRange = `${
				this.timeRange
					? moment().format("YYYYMMDD")
					: moment(this.timeRange[0]).format("YYYYMMDD") +
					  "至" +
					  moment(this.timeRange[1]).format("YYYYMMDD")
			}`;
			let productName = this.scenicList.find(
				item => item.id == this.queryParams.lid
			).title;

			let fileName =
				this.searchType == 3
					? `订单汇总-${timeRange}-${productName}.csv`
					: `订单查询-${this.key_word}.csv`;
			Service.exportOrderList(params)
				.then(res => {
					if (res.code == 0) {
						Message.alert(res.msg,"提示");
						return false;
					}
					let table = res.split("\n");
					if (table.length > 1 && table[1]) {
						let blob = new Blob(table.map(item => (item += "\n")), {
							type: "text/plain;charset=utf-8"
						});
						FileSaver.saveAs(blob, fileName);
					} else {
						Message.alert("导出失败，没有可以导出的数据","提示");
					}
				})
				.catch(err => {
					console.log(err);
					Message.alert("导出失败，服务器错误","提示");
				});
		}
	}
};
