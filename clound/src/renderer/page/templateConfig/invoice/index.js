import "./index.scss";
import editTool from "../module/edit"
import * as Service from "../service"
import Message from "@/util/message";

export default {
	template: require("./index.xtpl"),

	components: {
		editTool
	},

	data () {
		return {
			toolList: [
				{
					title: '常规选项：',
					data: [
						// { title: '商户名', type: 'default', qrcode: 0, name: 'businessName', disabled: true, },
						{ title: '订单号', type: 'default', qrcode: 0, name: 'ordernum', disabled: true, },
						{ title: '产品名称', type: 'default', qrcode: 0, name: 'pName', disabled: true, },
						{ title: '当前时间', type: 'default', qrcode: 0, name: 'timenow', disabled: true, },
						{ title: '发票抬头', type: 'default', qrcode: 0, name: 'invoice', disabled: true, },
						{ title: '联系人', type: 'default', qrcode: 0, name: 'guideName', disabled: true, },
						{ title: '票数', type: 'default', qrcode: 0, name: 'ticketnum', disabled: true, },
						{ title: '单价', type: 'default', qrcode: 0, name: 'ticketfee', disabled: true, },
						{ title: '金额大写', type: 'default', qrcode: 0, name: 'captotalfee', disabled: true, },
						{ title: '金额小写', type: 'default', qrcode: 0, name: 'lowtotalfee', disabled: true, },
						{ title: '员工名称', type: 'default', qrcode: 0, name: 'employeeName' },
					]
				}, {
					title: '特殊选项：',
					data: [
						{ title: '虚线', type: 'dashed', qrcode: 4, name: 'dashed' },
					]
				}, {
					title: '自定义组件：',
					data: [
						{ title: '签字', type: 'text', qrcode: 0, name: 'text' },
						{ title: '说明', type: 'text', qrcode: 0, name: 'text' },
					]
				}

			],
			planList: [],
			initCurrentUsePlan: '',
			type: 2
		};
	},


	mounted () {
		let that = this;
		this.$store.dispatch("updatePageLoading", true);
		Service.fetchPlanList({ sid: this.$store.state.userInfo.parent_member_id, type: this.type }).then(res => {
			if (res.code == 200) {
				that.planList = res.data;
				return Service.fetchCurrentUsePlan({ fid: this.$store.state.userInfo.member_id, type: this.type })
			} else {
				Message.error(res.msg || '获取方案列表失败')
			}
		}).then(res => {
			this.$store.dispatch("updatePageLoading", false);
			if (res.code == 200) {
				that.initCurrentUsePlan = that.planList.findIndex(item => item.id == res.data.id)
			} else {
				Message.error(res.msg || '获取方案列表失败')
			}
		}).catch(err => {
			this.$store.dispatch("updatePageLoading", false)
			Message.alert('请求出错', '提示')
		})
	},
	methods: {
		modifyPlanList (val) {
			this.planList = val;
		}
	}

}

