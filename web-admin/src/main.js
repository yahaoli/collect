// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Router from 'vue-router'
import App from './App'
import router from './router'
import axios from 'axios'
import qs from 'qs'
import {Message, MessageBox, Loading} from 'element-ui'
// 全局过滤器
// 年月日
Vue.filter('dateFormat', function (value, type) {
  if (value) {
    var date = new Date(value)
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    month = month < 10 ? ('0' + month) : month
    var Day = date.getDate()
    Day = Day < 10 ? ('0' + Day) : Day
    var hour = date.getHours()
    hour = hour < 10 ? ('0' + hour) : hour
    var minute = date.getMinutes()
    var second = date.getSeconds()
    minute = minute < 10 ? ('0' + minute) : minute
    second = second < 10 ? ('0' + second) : second
    return type === 1 ? year + '-' + month + '-' + Day : year + '-' + month + '-' + Day + ' ' + hour + ':' + minute + ':' + second
  }
})
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$common = {
  // 权限变量
  powerList: {
    navList: [],
    have: ''
  },
  // 公共变量
  storeData: {},
  // 过滤权限
  powerFilter (list, key) {
    var havePower = this.powerList.have
    var currentList = []
    var currentKey = key || 'id'
    list.forEach(function (val) {
      if (havePower.indexOf(val[currentKey]) > -1) {
        currentList.push(val)
      }
    })
    return currentList
  },
  // 判断变量是否为空
  isNull (variable1) {
    return variable1 === null || variable1 === undefined || variable1 === ''
  },
  // 获取json的长度
  getLength (object) {
    var count = []
    for (var key in object) {
      count.push(key)
    }
    return count.length
  },
  // 比较规格是否一致
  skuCompare (arr) {
    if (arr.length === 1) {
      return true
    }
    var currentLength = 0
    var currentIndex = 0
    for (var j = 0, len1 = arr.length; j < len1; j++) {
      if (this.getLength(arr[j]) > currentLength) {
        currentLength = this.getLength(arr[j])
        currentIndex = j
      }
    }
    var a = this.copyObj(arr[currentIndex])
    delete a['零售价']
    delete a['库存量']
    !this.isNull(a['id']) && delete a['id']
    !this.isNull(a['上架单价']) && delete a['上架单价']
    !this.isNull(a['虚拟销量']) && delete a['虚拟销量']
    for (var i = 0, len = arr.length; i < len; i++) {
      if (i === currentIndex) {
        continue
      }
      for (var key in a) {
        if (this.isNull(a[key]) !== this.isNull(arr[i][key])) {
          return false
        }
      }
    }
    return true
  },
  // 复制简单的对象
  copyObj (obj, type) {
    var copy = {}
    if (type) {
      for (var key in obj) {
        if (!this.isNull(obj[key])) {
          copy[key] = obj[key]
        }
      }
    } else {
      for (var key1 in obj) {
        copy[key1] = obj[key1]
      }
    }
    return copy
  },
  // 判断一个数组是否包含一个json(顺序一定要一致)
  compareObj (obj1, obj2) {
    var current = JSON.parse(JSON.stringify(obj1))
    var that = this
    current.forEach(function (item) {
      delete item['零售价']
      delete item['库存量']
      !that.isNull(item['id']) && delete item['id']
      !that.isNull(item['上架单价']) && delete item['上架单价']
      !that.isNull(item['虚拟销量']) && delete item['虚拟销量']
    })
    var current2 = this.copyObj(obj2)
    delete current2['零售价']
    delete current2['库存量']
    !that.isNull(current2['id']) && delete current2['id']
    !that.isNull(current2['上架单价']) && delete current2['上架单价']
    !that.isNull(current2['虚拟销量']) && delete current2['虚拟销量']
    return JSON.stringify(current).indexOf(JSON.stringify(current2)) > -1
  },
  // 判断json是否为空
  isEmptyJson (obj) {
    for (var key in obj) {
      return false
    }
    return true
  },
  // 过滤参数
  filterData (data) {
    var getType = Object.prototype.toString
    var current
    var currentVal
    var that = this
    var filterData = {}
    for (var key in data) {
      currentVal = data[key]
      current = getType.call(currentVal)
      if (current === '[object Object]' && !that.isEmptyJson(currentVal)) {
        filterData[key] = data[key]
      } else if (current === '[object Array]' && currentVal.length > 0) {
        filterData[key] = data[key]
      } else if (!that.isNull(data[key])) {
        filterData[key] = data[key]
      }
    }
    return filterData
  },
  // 全局变量
  dataCommon () {
    var data = {
      storage: ['平台仓储', '货源自主仓储'],
      getWay: ['快递', '自取', '全部'],
      payType: ['在线支付', '货到付款']
    }
    return data
  },
  // 数组格式转化
  arrFomat: function (arr) {
    var a = {}
    if (!arr.length) {
      return ''
    }
    arr.forEach(function (item, index) {
      a[item.title] = item.detail
    })
    return JSON.stringify(a)
  },
  // 图片url格式化
  imgUrl: function (arr) {
    var a = arr.map(function (item) {
      return item.url
    })
    return a.join(';')
  },
  // 验证图片上传
  imgRes: function (res) {
    if (res.code * 1 === 200) {
      return true
    } else if (res.code * 1 === 400) {
      Message.error(res.message)
      return false
    } else {
      Message.error(res.message)
      return false
    }
  },
  // 验证整数
  integer: function (rule, value, callback) {
    if (callback) {
      if (value && !/^[0-9]+$/.test(value)) {
        return callback(new Error('请输入整数'))
      }
      callback()
    } else {
      return /^[0-9]+$/.test(value)
    }
  },
  // 验证整数和字母
  integerEn: function (rule, value, callback) {
    if (callback) {
      if (value && !/^[0-9a-zA-Z]+$/.test(value)) {
        return callback(new Error('请输入整数'))
      }
      callback()
    } else {
      return /^[0-9a-zA-Z]+$/.test(value)
    }
  },
  // 验证小数
  numTo2: function (rule, value, callback) {
    if (callback) {
      if (value && !/^\d+(?:\.\d{1,2})?$/.test(value)) {
        return callback(new Error('请输入数字最多两位小数'))
      }
      callback()
    } else {
      return /^\d+(?:\.\d{1,2})?$/.test(value)
    }
  },
  // 验证手机号
  phone: (rule, value, callback) => {
    if (callback) {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        return callback(new Error('手机格式不正确'))
      }
      callback()
    } else {
      return /^1[3-9]\d{9}$/.test(value)
    }
  },
  // 验证身份证
  idCard: function (rule, value, callback) {
    if (callback) {
      if (value && !/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/.test(value)) {
        return callback(new Error('身份证格式不正确'))
      }
      callback()
    } else {
      return /^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/.test(value)
    }
  },
  // 验证链接
  urlOk: function (rule, value, callback) {
    if (callback) {
      if (value && !/^http(s)?:\/\//.test(value)) {
        return callback(new Error('链接格式不正确'))
      }
      callback()
    } else {
      return /^http(s)?:\/\//.test(value)
    }
  },
  // 判断数组是否存某对象元素
  findElem: function (arrayToSearch, attr, val, type) {
    if (arrayToSearch.length === 0) {
      return -1
    }
    for (var i = 0; i < arrayToSearch.length; i++) {
      if (!this.isNull(arrayToSearch[i][attr]) && arrayToSearch[i][attr].toString() === val.toString()) {
        return type ? arrayToSearch[i][type] : i
      }
    }
    return -1
  },
  imgLimit: function (files, fileList) {
    Message.warning('图片数量不能超过限定数量,更换请删除重新上传')
  },
  imgError: function () {
    Message.error('图片上传失败')
  },
  beforeImg: function (file) {
    const isImg = file.type.split('/')[0] === 'image'
    const isLt2M = file.size / 1024 <= 500
    if (!isImg) {
      Message.warning('只能上传图片!')
      return false
    }
    if (!isLt2M) {
      Message.warning('单张图片大小不能超过 500k!')
      return false
    }
    return true
  },
  // 判断权限
  havePower: function (val) {
    if (val === 'no') {
      return true
    }
    if (this.powerList.have.indexOf(val) >= 0) {
      return true
    }
    return false
  }
}
axios.defaults.baseURL = 'admin/'
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'
Vue.config.productionTip = false
window.Promise = Promise
window.axios = axios
// 设置axios(可以通过axios配置,此处只是简单的封装了一下,建议全局配置axios)
Vue.prototype.$axios = function (options, text) {
  var load = Loading.service({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  var that = this
  return new Promise(function (resolve, reject) {
    if (options.params) {
      options.params = that.$common.filterData(options.params)
    }
    if (options.method === 'post') {
      if (!text) {
        options.data = that.$common.filterData(options.data)
        options.data = qs.stringify(options.data, { arrayFormat: 'repeat' })
      }
    }
    axios(options).then(res => {
      if (res.data.code * 1 === 200) {
        resolve(res.data.data)
      } else if (res.data.code * 1 === 400) {
        if (that.$route.path !== '/login') {
          that.$router.push({path: '/login'})
        }
      } else {
        throw new Error(res.data.message)
      }
      load.close()
    }).catch((err) => {
      Message.error(err.message)
      reject(err)
      load.close()
    })
  })
}
/* eslint-disable no-new */
/* router.beforeEach((to, from, next) => {
  if (to.meta.loginOk && document.cookie.length <= 0) {
    next('/login')
    return
  }
  next()
}) */
Vue.use(Router)
var aaa = new Router({routes: router.routes})
new Vue({
  el: '#app',
  router: aaa,
   data: {
    powerList: [
      {title: '账号管理',
        id: 1,
        child: [
          {route: '/admin/accountManage', name: '账号管理', id: 2},
          {route: '/admin/roleManage', name: '权限管理', id: 15},
          {route: '/admin/storeApply', name: '开店申请审核', id: 20},
          {route: '/admin/accountManageB', name: 'B端用户管理', id: 159}
        ]
      },
      {title: '货源管理',
        id: 21,
        child: [
          {route: '/admin/goodsClassify', name: '货源分类', id: 22},
          {route: '/admin/selfGoods', name: '自营商品管理', id: 29},
          {route: '/admin/ruleGoods', name: '常规商品管理', id: 35},
          {route: '/admin/pledgeGoods', name: '质押商品管理', id: 41},
          {route: '/admin/fromMange', name: '认筹管理', id: 44},
          {route: '/admin/buyOff', name: '买断管理', id: 202},
          {route: '/admin/goodsOverview', name: '货源总览', id: 48}
        ]
      },
      {title: '商品下架审核',
        id: 51,
        child: [
          {route: '/admin/goodsOff', name: '商品下架审核', id: 52}
        ]
      },
      {title: '订单管理',
        id: 53,
        child: [
          {route: '/admin/orderManage', name: '订单管理', id: 54}
        ]
      },
      {title: '金额管理',
        id: 66,
        child: [
          {route: '/admin/creditManage', name: '授信管理', id: 67},
          {route: '/admin/cashManage', name: '提现管理', id: 75},
          {route: '/admin/saleMoney', name: '销售金额管理', id: 126},
          {route: '/admin/loanMonth', name: '货款月结', id: 81}
        ]
      },
      {title: '在线客服',
        id: 143,
        child: [
          {route: '/admin/customer', name: '在线客服', id: 144}
        ]
      },
      {title: '系统管理',
        id: 84,
        child: [
          {route: '/admin/couponManage', name: '优惠券管理', id: 146},
          {route: '/admin/newsManage', name: '消息管理', id: 137},
          {route: '/admin/serviceManage', name: '服务管理', id: 85},
          {route: '/admin/advertManage', name: '广告位管理', id: 90},
          {route: '/admin/systemSetup', name: '系统设置', id: 213},
          {route: '/admin/homeClassify', name: '推荐位商品管理', id: 172}
        ]
      }
    ]
  },
  created () {
    var that = this
    // 判断是否含有admin需要获取权限
    var url = window.location.href.split('#')[1].indexOf('admin')
    if (url > -1) {
      this.$axios({
        method: 'post',
        url: 'role/getUserPermissionsAll.action'
      }).then(function (res) {
        if (res && res.list.length) {
          var a = []
          that.powerFilter(that.powerList, res.list, a)
          var allRoutes = router.addRoutes.children
          var currentRoutes = []
          for (var i = 0, len = allRoutes.length; i < len; i++) {
            if (res.list.indexOf(allRoutes[i].meta.id) >= 0) {
              currentRoutes.push(allRoutes[i])
            }
          }
          router.addRoutes.children = currentRoutes
          that.$common.powerList.have = res.list
          that.$router.addRoutes([router.addRoutes])
          that.$common.powerList.navList = a
          that.$common.powerList.type = res.type
        } else {
          that.$router.addRoutes([
            {
              path: '/admin',
              name: 'admin',
              component: router.addRoutes.component,
              meta: {loginOk: true},
              children: []
            }
          ])
        }
      })
    }
  },
  methods: {
    powerFilter (data, res, a) {
      for (var i = 0, len = data.length; i < len; i++) {
        if (res.indexOf(data[i].id) >= 0) {
          data[i].child ? a.push({title: data[i].title, child: []}) : a.push(data[i])
          data[i].child && this.powerFilter(data[i].child, res, a[a.length - 1].child)
        }
      }
    }
  },
  components: { App },
  template: '<App/>'
})
