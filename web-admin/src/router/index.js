const login = () => import('@/components/login')
const loginTo = () => import('@/components/loginTo')
const forgetPass = () => import('@/components/forgetPass')
const forgetPass2 = () => import('@/components/forgetPass2')
const setPass = () => import('@/components/setPass')
const admin = () => import('@/components/admin')
const accountManage = () => import('@/components/accountManage')
const storeApply = () => import('@/components/storeApply')
const goodsClassify = () => import('@/components/goodsClassify')
const selfGoods = () => import('@/components/selfGoods')
const ruleGoods = () => import('@/components/ruleGoods')
const pledgeGoods = () => import('@/components/pledgeGoods')
const fromMange = () => import('@/components/fromMange')
const goodsOverview = () => import('@/components/goodsOverview')
const goodsOff = () => import('@/components/goodsOff')
const orderManage = () => import('@/components/orderManage')
const creditManage = () => import('@/components/creditManage')
const cashManage = () => import('@/components/cashManage')
const loanMonth = () => import('@/components/loanMonth')
const serviceManage = () => import('@/components/serviceManage')
const advertManage = () => import('@/components/advertManage')
const roleManage = () => import('@/components/roleManage')
const saleMoney = () => import('@/components/saleMoney')
const newsManage = () => import('@/components/newsManage')
const customer = () => import('@/components/customer')
const coupon = () => import('@/components/couponManage')
const homeClassify = () => import('@/components/homeClassify')
const accountManageB = () => import('@/components/accountManage-B')
const systemSetup = () => import('@/components/systemSetup')
const buyOff = () => import('@/components/buyOff')
export default{
  routes: [
    {
      path: '/',
      redirect: '/admin'
    },
    {
      path: '/login',
      component: login,
      children: [
        {
          path: '',
          name: 'loginTo',
          component: loginTo
        },
        {
          path: 'forgetPass',
          name: 'forgetPass',
          component: forgetPass
        },
        {
          path: 'forgetPass2',
          name: 'forgetPass2',
          component: forgetPass2
        },
        {
          path: 'setPass/:token/:mobile',
          name: 'setPass',
          component: setPass
        }
      ]
    }
  ],
  addRoutes: {
    path: '/admin',
    name: 'admin',
    component: admin,
    meta: {loginOk: true},
    children: [
      {
        path: 'accountManage',
        name: '账号管理',
        component: accountManage,
        meta: {loginOk: true, id: 2}
      },
      {
        path: 'storeApply',
        name: '开店申请审核',
        component: storeApply,
        meta: {loginOk: true, id: 20}
      },
      {
        path: 'goodsClassify',
        name: '货源分类',
        component: goodsClassify,
        meta: {loginOk: true, id: 22}
      },
      {
        path: 'selfGoods',
        name: '自营商品管理',
        component: selfGoods,
        meta: {loginOk: true, id: 29}
      },
      {
        path: 'ruleGoods',
        name: '常规商品管理',
        component: ruleGoods,
        meta: {loginOk: true, id: 35}
      },
      {
        path: 'pledgeGoods',
        name: '质押商品管理',
        component: pledgeGoods,
        meta: {loginOk: true, id: 41}
      },
      {
        path: 'fromMange',
        name: '认筹管理',
        component: fromMange,
        meta: {loginOk: true, id: 44}
      },
      {
        path: 'goodsOverview',
        name: '货源总览',
        component: goodsOverview,
        meta: {loginOk: true, id: 48}
      },
      {
        path: 'goodsOff',
        name: '商品下架审核',
        component: goodsOff,
        meta: {loginOk: true, id: 52}
      },
      {
        path: 'orderManage',
        name: '订单管理',
        component: orderManage,
        meta: {loginOk: true, id: 54}
      },
      {
        path: 'creditManage',
        name: '授信管理',
        component: creditManage,
        meta: {loginOk: true, id: 67}
      },
      {
        path: 'cashManage',
        name: '提现管理',
        component: cashManage,
        meta: {loginOk: true, id: 75}
      },
      {
        path: 'loanMonth',
        name: '贷款月结',
        component: loanMonth,
        meta: {loginOk: true, id: 81}
      },
      {
        path: 'serviceManage',
        name: '服务管理',
        component: serviceManage,
        meta: {loginOk: true, id: 85}
      },
      {
        path: 'advertManage',
        name: '广告位管理',
        component: advertManage,
        meta: {loginOk: true, id: 90}
      },
      {
        path: 'roleManage',
        name: '权限管理',
        component: roleManage,
        meta: {loginOk: true, id: 15}
      },
      {
        path: 'saleMoney',
        name: '销售金额管理',
        component: saleMoney,
        meta: {loginOk: true, id: 126}
      },
      {
        path: 'newsManage',
        name: '消息管理',
        component: newsManage,
        meta: {loginOk: true, id: 137}
      },
      {
        path: 'customer',
        name: '在线客服',
        component: customer,
        meta: {loginOk: true, id: 144}
      },
      {
        path: 'couponManage',
        name: '优惠券管理',
        component: coupon,
        meta: {loginOk: true, id: 146}
      },
      {
        path: 'homeClassify',
        name: '推荐位商品管理',
        component: homeClassify,
        meta: {loginOk: true, id: 172}
      },
      {
        path: 'accountManageB',
        name: 'B端用户管理',
        component: accountManageB,
        meta: {loginOk: true, id: 159}
      },
      {
        path: 'systemSetup',
        name: '系统设置',
        component: systemSetup,
        meta: {loginOk: true, id: 213}
      },
      {
        path: 'buyOff',
        name: '买断管理',
        component: buyOff,
        meta: {loginOk: true, id: 202}
      }
    ]
  }
}
