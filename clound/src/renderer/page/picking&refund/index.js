import "./index.scss";
import searchBar from "./components/searchBar";
import ticketItem from "./components/ticketItem";
import {cloneDeep} from "lodash";

import Vuex from "vuex";
import Vue from "vue";

const {mapState, mapActions} = Vuex.createNamespacedHelpers("picking&refund");

export default {
	template: require("./index.xtpl"),

	components: {
		searchBar,
		ticketItem
	},

	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.$store.commit("picking&refund/update_state", {orderList: []});
		})
	},

	mounted() {
		this.pageData(this.$route.path);
	},
	data() {
		return {};
	},
	watch: {
		'$route'(to) {
			console.log(5555)
			this.pageData(to.path);
		},
	},
	computed: {
		...mapState(["orderList", "showEmptyText", "scenicList"]),
		scenicList: function () {
			return [
				{id: "-1", title: "所有产品", salerid: "-1"},
				...this.$store.state.scenicList
			];
		},
		//需要竖向排列成listA，listB两列
		listA: function () {
			return cloneDeep(this.orderList).filter(
				(item, index) => index % 2 != 0
			);
		},
		listB: function () {
			return cloneDeep(this.orderList).filter(
				(item, index) => index % 2 == 0
			);
		}
	},

	methods: {
		pageData:function (path) {
			let sourceType, isSiteFilter;
			if (path === '/picking') {
				sourceType = 2;
				isSiteFilter = 1;
			} else {
				sourceType = 3;
				isSiteFilter = 0;
			}

			this.getScenicList({sourceType, isSiteFilter});
		},
		...mapActions([
			"orderQuery",
			"getScenicList"
			// "ticketFetch"
		]),
		// updateQueryParam(queryWord) {
		// 	this.$store.commit("picking&refund/update_queryParam", queryWord);
		// }

	}
};
