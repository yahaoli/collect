/**
 * @author xiaoqiang
 * @date 2018/3/14
 * @Description: 日志页面
 */

import "./index.scss";
import {getLog} from "./service";
import moment from 'moment'
import csvExport from "@/util/csvExport";
import {isArray, isObject} from "lodash";
// import {}

export default {
	template: require("./index.xtpl"),

	components: {},

	data () {
		return {
			searchValue: [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD"),],
			tableData: [],
			centerDialogVisible: false,
			total: 0,
			loading: false,
			pageNum: 1,
			pickerOptions: {
				shortcuts: [
					{
						text: "今天",
						onClick (picker) {
							const end = new Date();
							const start = new Date();
							picker.$emit("pick", [
								moment(start).format("YYYY-MM-DD"),
								moment(end).format("YYYY-MM-DD")
							]);
						}
					},
					{
						text: "昨天",
						onClick (picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24);
							end.setTime(end.getTime() - 3600 * 1000 * 24);
							picker.$emit("pick", [
								moment(start).format("YYYY-MM-DD"),
								moment(end).format("YYYY-MM-DD")
							]);
						}
					},
					{
						text: "最近一周",
						onClick (picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(
								start.getTime() - 3600 * 1000 * 24 * 7
							);
							picker.$emit("pick", [
								moment(start).format("YYYY-MM-DD"),
								moment(end).format("YYYY-MM-DD")
							]);
						}
					},
					{
						text: "最近一个月",
						onClick (picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(
								start.getTime() - 3600 * 1000 * 24 * 30
							);
							picker.$emit("pick", [
								moment(start).format("YYYY-MM-DD"),
								moment(end).format("YYYY-MM-DD")
							]);
						}
					},
					{
						text: "最近三个月",
						onClick (picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(
								start.getTime() - 3600 * 1000 * 24 * 90
							);
							picker.$emit("pick", [
								moment(start).format("YYYY-MM-DD"),
								moment(end).format("YYYY-MM-DD")
							]);
						}
					}
				]
			},
		};
	},

	created () {
		// Date.parse()
		// console.log(dateFomate.format(new Date(),'yyyy-MM-dd'));
		this.init()
	},

	methods: {
		init () {
			this.oprationLog();
		},
		searchTime () {
			/*this.$message({
				showClose: true,
				message: '错了哦，这是一条错误消息',
				type: 'error'
			});*/
			// console.log(this.searchValue);
			if (!this.searchValue) {
				return this.$message({
					showClose: true,
					message: '请输入时间范围',
					type: 'error'
				});
			}
			// console.log(this.searchValue[0], this.searchValue[1],);
			// function({st:this.searchValue[0],et:this.searchValue[1]}).then(res=>{});
			this.oprationLog()
		},
		exportExcel () {
			if (!this.searchValue) {
				return this.$message({
					showClose: true,
					message: '请输入时间范围',
					type: 'error'
				});
			}
			getLog({
				bt: this.searchValue[0],
				et: this.searchValue[1],
				page: 1,
				pageSize: 10000,
				print: true
			}).then(res => {
				console.log(res);
				csvExport(
					[
						"日期",
						"操作类型",
						"操作人",
						"订单号",
						"产品",
						"票",
						// "操作票数"
					],
					[
						"TrTime",
						"OType",
						"TrMan",
						"Orders",
						"ProductName",
						"ticket_title",
						// "tnum"
					],
					res.list,
					`${this.searchValue[0]}~${this.searchValue[1]}日志`
				);
			})

		},
		/*pageChage () {
			console.log(this.pageNum);
		},*/
		oprationLog () {
			if (this.pageLoading) return;
			let obj;
			if (!this.searchValue) {
				obj = {}
			} else
				obj = {
					bt: this.searchValue[0],
					et: this.searchValue[1],
					page: this.pageNum || 1
				};
			this.$store.dispatch("updatePageLoading", true);
			getLog(obj).then(res => {
				if (!res)
					return this.$message({
						showClose: true,
						message: '获取数据失败，请联系客服解决',
						type: 'error'
					});
				this.tableData = res.list || [];
				// 判断当前页数是否最后一页
				if (this.pageNum + '' !== res.pageIndex + '') {
					return this.oprationLog()
				}
				res.total && (this.total = Number(res.total));
			}).catch(err => {
				console.dir(err);
				this.$message({
					showClose: true,
					message: isObject(err) ? `${ err.message}` : err || '请求出错',
					type: 'error'
				});
			}).finally(() => {
				this.$nextTick(() => {
					this.$store.dispatch("updatePageLoading", false);
				})
			})
		},
	},

	computed: {
		pageLoading () {
			return this.$store.state.pageLoading;
		},
	},
	mounted () {
		// this.getPickInfo();
	},
	watch: {
		pageNum: {
			handler (val) {
				// console.log(val);
				// v = 1;
				if (!val) {
					val = 1;
				}
				this.oprationLog();
			},
			// immediate: true
		}
	}
}

