import Vue from "vue";
import {InitRouteHooks} from "@/assets/utils/routeHooks.js";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../views/home")
    }
];

const router = new VueRouter({
    mode: "hash",
    routes
});
InitRouteHooks(router);
export default router;
