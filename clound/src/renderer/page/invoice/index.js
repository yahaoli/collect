require("./index.scss");
import moment from "moment";
import * as SynService from "@/service";
import * as Service from "./service";
import {mapState} from "vuex";
import Message from "@/util/message";
import {cloneDeep} from "lodash";

import keywordTable from "./table/keyword-table";

export default {
	template: require("./index.xtpl"),
	data() {
		return {
			timeRange: [
				moment().format("YYYY-MM-DD 00:00:00"),
				moment().format("YYYY-MM-DD 23:59:59"),
			],
			fetchRelationByKeywordLoading: false,
			releationName: "散客",
			InvoiceName: "",
			relationList: [],
			InvoiceStatus: [
				{status: 0, title: '未开票'},
				{status: 2, title: '电子发票'},
				{status: 6, title: '纸质发票'}
			],
			InvoiceData: [],
			total: 0,
			PAGE_SIZE: 10,
			key_word: "",
			queryParams: {
				reseller_id: "",
				lid: "-1",
				tid: "",
				pay_mode: "-1",
				action: "-1"
			},
		}
	},
	mounted() {
		this.FetchRelation();
	},
	components: {
		keywordTable,
	},
	computed: {
		...mapState([
			"userInfo",
		])
	},
	methods: {
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
		async FetchRelation() {
			const {account, member_id, siteId, siteInfo} = this.$store.state.userInfo;
			let window_property = siteInfo.window_property.split(',');
			let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
			const res = await SynService.FetchRelationList({account, siteId, siteType, aid: member_id});
			if (res.code != 200) return false;
			this.relationList = res.data

		},

		async fetchRelationByKeyword(query) {
			this.fetchRelationByKeywordLoading = true;
			const {account, member_id, siteId, siteInfo} = this.$store.state.userInfo;
			let window_property = siteInfo.window_property.split(',');
			let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
			const res = await SynService.FetchRelationList({account, siteId, siteType, aid: member_id, keyword: query});
			this.fetchRelationByKeywordLoading = false;
			if (res.code != 200) return false;
			this.relationList = res.data
		},

		onRelationChange(val) {
			this.releationName = val;
		},

		InvoiceStatusChange(val) {
			this.InvoiceName = val;
		},

		plantInvoiceSearch(type = 1, page = "") {
			let that = this;
			this.searchType = type;
			this.$store.dispatch("updatePageLoading", true);
			let params = {
				page: page,
				size: that.PAGE_SIZE,
				key_word: that.key_word,
				search_type: type
			};
			Service.fetchInvoiceList(params)
				.then(res => {
					if (res.code == 200) {
						that.InvoiceData = res.data.list;
						that.total = res.data.total;
					} else {
						that.InvoiceData = [];
						that.total = 0;
						Message.alert(res.msg || "操作失败", "提示");
					}
					this.$store.dispatch("updatePageLoading", false);
				})
				.catch(err => {
					Message.alert(err || "查询失败", "提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		},
		InvoiceSearch(page = 1) {
			let that = this;
			this.searchType = 4;

			if (!this.timeRange) {
				Message.alert("请选择时间", "提示");
				return false;
			}

			let params = Object.assign(this.queryParams, {
				page: page,
				size: that.PAGE_SIZE,
				begin_time: moment(this.timeRange[0]).format("YYYY-MM-DD 00:00:00"),
				end_time: moment(this.timeRange[1]).format("YYYY-MM-DD 23:59:59"),
				operate_id: this.$store.state.userInfo.member_id,
				search_type: 4,
				invoiceType: this.InvoiceName,
			});
			let newParams = cloneDeep(params);
			for (let i in newParams) {
				newParams[i] == -1 ? (newParams[i] = "") : null;
			}
			Service.fetchInvoiceList(newParams)
				.then(res => {
					if (res.code == 200) {
						// that.plantOrderData = res.data.list;
						that.InvoiceData = res.data.list;
						that.total = res.data.total;
					} else {
						// that.plantOrderData = [];
						that.InvoiceData = [];
						that.total = 0;
						Message.alert(res.msg || "操作失败", "提示");
					}

					this.$store.dispatch("updatePageLoading", false);
				})
				.catch(err => {
					Message.alert(err || "查询失败", "提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		},
		//分页器操作
		changePage(page) {
			if (this.searchType == 1 || this.searchType == 2) {
				this.plantInvoiceSearch(this.searchType, page);
			} else if (this.searchType == 3) {
				this.InvoiceSearch(page);
			} else if (this.searchType == 4) {
				let begin_time = moment(this.timeRange[0]).format("YYYY-MM-DD 00:00:00");
				let end_time = moment(this.timeRange[1]).format("YYYY-MM-DD 23:59:59");
				let operate_id = this.$store.state.userInfo.member_id;
				this.HuiOrderSearch(this.search_type, page, begin_time, end_time, operate_id, this.InvoiceName);
			}
		},
		//使用汇总信息分页条件查询
		HuiOrderSearch(type = 4, page = "", begin_time, end_time, operate_id, invoiceType) {
			let that = this;
			this.searchType = type;
			this.$store.dispatch("updatePageLoading", true);
			let params = {
				page: page,
				size: that.PAGE_SIZE,
				search_type: type,
				begin_time: begin_time,
				end_time: end_time,
				operate_id: operate_id,
				invoiceType: invoiceType,
			};
			Service.fetchInvoiceList(params)
				.then(res => {
					if (res.code == 200) {
						that.InvoiceData = res.data.list;
						that.total = res.data.total;
					} else {
						that.InvoiceData = [];
						that.total = 0;
						Message.alert(res.msg || "操作失败", "提示");
					}
					this.$store.dispatch("updatePageLoading", false);
				})
				.catch(err => {
					Message.alert(err || "查询失败", "提示");
					this.$store.dispatch("updatePageLoading", false);
				});
		},
	}
}
