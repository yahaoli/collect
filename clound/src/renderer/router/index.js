import Vue from "vue";
import Router from "vue-router";
import App from "../page/App";
/*import Booking from "../page/booking";
import Picking from "../page/picking&refund";
import Refund from "../page/picking&refund";
import Summary from "../page/summary";
import SummarySales from '../page/summary/salesSummary';
import MyOrder from '../page/summary/myOrder';
import SummaryLog from '../page/summary/log/';
import Login from "../page/login";*/
// import SummaryPlatform from '../page/summary/platformOrder';

const Booking = () => import( "../page/booking");
const Picking = () => import( "../page/picking&refund");
const Refund = () => import( "../page/picking&refund");
const Summary = () => import( "../page/summary");
const SummarySales = () => import( '../page/summary/salesSummary');
const MyOrder = () => import( '../page/summary/myOrder');
const SummaryLog = () => import( '../page/summary/log/');
const Login = () => import( "../page/login");
const Banjie = () => import( "../page/banjie");
const ReceipttemplateConfig = () => import( "../page/templateConfig/receipt");
const InvoicetemplateConfig = () => import( "../page/templateConfig/invoice");
//在线选座功能
const Show = () => import("../page/show-seat");
const ShowOnline = () => import("../page/show-seat/online");
const ShowPreset = () => import("../page/show-seat/preset");
const ShowOrder = () => import("../page/show-seat/order");
const Invoice = () => import("../page/invoice");

import {checkLogin} from "@/auth";

Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: "/",
			component: App,
			children: [
				{
					path: "/login",
					name: 'Login',
					component: Login,
				},
				{
					path: "/booking",
					name: 'Booking',
					component: Booking,
					meta: {
						title: "booking",
						keepAlive: true,
						requireAuth: true
					}
				},
				{
					path: "/picking",
					component: Picking,
					meta: {
						title: "picking",
						requireAuth: true
					}
				},
				{
					path: "/refund",
					component: Refund,
					meta: {
						title: "refund",
						requireAuth: true
					}
				},
				{
					path: "/banjie",
					component: Banjie,
					meta: {
						title: "banjie",
						requireAuth: true
					}
				},
				{
					path: "/receiptTemplateConfig",
					component: ReceipttemplateConfig,
					meta: {
						title: "receiptTemplateConfig",
						requireAuth: true
					}
				},
				{
					path: "/invoiceTemplateConfig",
					component: InvoicetemplateConfig,
					meta: {
						title: "invoiceTemplateConfig",
						requireAuth: true
					}
				},
				{
					path: "/summary",
					component: Summary,
					meta: {
						title: "summary",
						requireAuth: true
					},
					children: [
						{
							path: 'myOrder',
							name: 'MyOrder',
							component: MyOrder,
							meta: {
								title: "myOrder",
								requireAuth: true
							},
						},
						{
							path: 'log',
							name: 'SummaryLog',
							component: SummaryLog,
							meta: {
								title: "log",
								requireAuth: true
							},
						},
						{
							path: '',
							name: 'SummarySales',
							component: SummarySales,
							meta: {
								title: "sales",
								requireAuth: true
							},
						},
					]
				},
				{
					path: "",
					name: 'Index',
					redirect: "/booking",
				},
				{
					path: "/seat_selection",
					redirect: "/seat_selection/online",
					name: "SeatSelection",
					component: Show,
					meta: {
						title: "seat_selection",
						requireAuth: true
					},
					children: [
						{
							path: "online",
							name: "ShowOnline",
							component: ShowOnline,
							meta: {
								title: "ShowOnline",
								requireAuth: true
							}
						},
						{
							path: "preset",
							name: "ShowPreset",
							component: ShowPreset,
							meta: {
								title: "ShowPreset",
								requireAuth: true,
								keepAlive: false
							}
						},
						{
							path: "order",
							name: "ShowOrder",
							component: ShowOrder,
							props: (route) => {
								return route.query
							},
							meta: {
								title: "ShowOrder",
								requireAuth: true
							}
						}
					]
				},
				{
					path: "/invoice",
					component: Invoice,
					meta: {
						title: "invoice",
						requireAuth: true
					}
				},
			]
		}
	]
});

router.beforeEach((to, from, next) => {
	if (to.path == "/login") {
		$("html,body").addClass("login");
	} else {
		$("html,body").removeClass("login");
	}
	if (to.matched.some(record => record.meta.requireAuth)) {
		//要求必须先登录才可访问的路由
		if (checkLogin()) {
			next();
		} else {
			//如果登录状态已过期或者还未登录就跳到登录页
			next({path: "/login"});
		}
	} else {
		//不需要登录就可以访问的跟由
		next();
	}
});

export default router;
