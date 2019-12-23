// require("./store");
import "./index.scss";

// import Vuex from "vuex";
// import SummaryPlatform from "./platformOrder";

export default {
	template: require("./index.xtpl"),

	components: {},

	data () {
		return {
			navList: [
				{
					navName: '销售汇总',
					router: {
						name: 'SummarySales',
					},
					link: 'summary_sales'
				},
				{
					navName: '订单查询',
					router: {
						name: 'MyOrder',
					},
					link: 'my_order',
				},
				{
					navName: '操作日志',
					router: {
						name: 'SummaryLog',
					},
					link: 'summary_log',
				},
			]
		};
	},

	mounted () {
		// this.getPickInfo();
	},
}


