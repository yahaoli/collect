import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "admin",
        redirect:'/admin'
    },
    {
        path: "/admin",
        name: "admin",
        component: () => import( "@/views/admin"),
        children: [
            {
                name: "admin-goodsManage",
                path: "/admin/goodsManage",
                component: () => import( "@/views/goodsManage"),
                meta:{ title: "商品管理"}
            },
            {
                name: "admin-orderManage",
                path: "/admin/orderManage",
                component: () => import( "@/views/orderManage"),
                meta:{ title: "订单管理"}
            }
        ]
    },
    {
        path: "/login",
        name: "login",
        component: () => import( "@/views/login"),
    }
];

const router = new VueRouter({
    mode: "hash",
    routes
});

export default router;
