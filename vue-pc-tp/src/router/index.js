import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
// menuHidden是否出现在导航栏
const routes = [
  {
    path: "/",
    redirect: "/admin",
    menuHidden: true
  },
  {
    path: "/admin",
    component: () => import( "@/views/admin"),
    menuHidden: true
  },
  {
    path: "/admin/fanManage",
    component: () => import( "@/views/admin"),
    children: [
      {
        path: "",
        component: () => import( "@/views/fanManage"),
        meta: {title: "风机管理"}
      }
    ]
  },
  {
    path: "/admin/userManage",
    component: () => import( "@/views/admin"),
    children: [
      {
        path: "",
        component: () => import( "@/views/userManage"),
        meta: {title: "用户管理"}
      }
    ]
  },
  {
    path: "/admin/systemManage",
    meta: {title: "系统配置"},
    component: () => import( "@/views/admin"),
    children: [
      {
        path: "dictType",
        component: () => import( "@/views/systemManage/dictType"),
        meta: {title: "字典类型"}
      },
      {
        path: "dict",
        component: () => import( "@/views/systemManage/dict"),
        meta: {title: "字典"}
      }
    ]
  },
  {
    path: "/admin/warningManage",
    component: () => import( "@/views/admin"),
    children: [
      {
        path: "",
        component: () => import( "@/views/warningManage"),
        meta: {title: "报警管理"}
      }
    ]
  },
  {
    path: "/admin/reportFormManage",
    component: () => import( "@/views/admin"),
    meta: {title: "报表管理"},
    children: [
      {
        path: "fanMonth",
        component: () => import( "@/views/reportFormManage/fanMonth"),
        meta: {title: "风机日报表"}
      },
      {
        path: "fanDay",
        component: () => import( "@/views/reportFormManage/fanDay"),
        meta: {title: "风机月报表"}
      }
    ]
  },
  {
    path: "/admin/logManage",
    component: () => import( "@/views/admin"),
    meta: {title: "日志管理"},
    children: [
      {
        path: "loginLog",
        component: () => import( "@/views/logManage/loginLog"),
        meta: {title: "登录日志"}
      },
      {
        path: "operationLog",
        component: () => import( "@/views/logManage/operationLog"),
        meta: {title: "操作日志"}
      }
    ]
  },
  {
    path: "/login",
    component: () => import( "@/views/login"),
    menuHidden: true
  }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default router;
