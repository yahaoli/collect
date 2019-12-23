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
						{ title: '订单日期', type: 'default', qrcode: 0, name: 'UUordertime', disabled: true, },
						{ title: '订单号', type: 'default', qrcode: 0, name: 'UUordernum', disabled: true, },
						{ title: '地接社', type: 'default', qrcode: 0, name: 'UUdname', disabled: true, },
						{ title: '凭证号', type: 'default', qrcode: 0, name: 'UUcode', disabled: true, },
						{ title: '导游', type: 'default', qrcode: 0, name: 'UUctel', disabled: true, },
						{ title: '客源地', type: 'default', qrcode: 0, name: 'TouristSource', disabled: true, },
						{ title: '售票员', type: 'default', qrcode: 0, name: 'Conductor' },
						{ title: '支付方式', type: 'default', qrcode: 0, name: 'UUpaywayName', disabled: true, },
						{ title: '演出信息', type: 'text', qrcode: 0, name: 'Sceniclist', disabled: true, },	
					]
				}, {
					title: '特殊选项：',
					data: [
						{ title: '售票表单', type: 'table', qrcode: 0, name: 'table' },
						{ title: '二维码', type: 'qrcode', qrcode: 2, name: 'UUcode' },
						{ title: '条形码', type: 'barcode', qrcode: 1, name: 'UUcode' },
						{ title: '虚线', type: 'dashed', qrcode: 4, name: 'dashed' },
					]
				}, {
					title: '自定义组件：',
					data: [
						{ title: '表头', placeholder: '地接社/组团社/导游购票回执单', type: 'text', name: 'text', qrcode: 0, printseat: 0, font_type: 2 },
						{ title: '签字', type: 'text', qrcode: 0, name: 'text' },
						{ title: '说明', type: 'text', qrcode: 0, name: 'text' },
						{ title: '制表人', type: 'default', qrcode: 0, name: 'Watchmaker'},
						{ title: '打印日期', type: 'default', qrcode: 0, name: 'UUptime', disabled: true, placeholder: '<--跟随打印时间-->' },
					]
				}

			],
			planList: [],
			initCurrentUsePlan: '',
			type: 1
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
			console.log(err)
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

