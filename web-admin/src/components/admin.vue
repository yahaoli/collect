<template>
  <div style="height: 100%;box-sizing: border-box">
    <div class="admin-head">
      <img class="admin-align" src="../img/pic2.png" alt="">
      <span>茂茂后台管理系统</span>
      <div v-if="userInfo" class="admin-person">
        <span>{{userInfo.mobile}}</span>
        <!--<span>超级管理员</span>-->
        <span @click="controlClick(1)" class="elePointer">账号信息</span>
        <span @click="controlClick(2)" class="elePointer">修改密码</span>
        <span @click="controlClick(3)" class="elePointer">退出</span>
      </div>
    </div>
    <div class="admin-container">
      <div class="admin-aside" v-if="tabAll.length">
        <el-menu background-color="#393D49"
                 text-color="#fff"
                 @select="menuSelect"
                 active-text-color="#ffd04b"
                 :default-active="$route.path"
                 router>
            <el-submenu v-for="(item) in tabAll" :index="item.title" :key="item.title">
              <template  slot="title"><span>{{item.title}}</span></template>
              <template v-for="(item1) in item.child">
                <el-menu-item v-if="item1.name" :index="item1.route" :key="item1.route">{{item1.name}}</el-menu-item>
                <el-submenu v-else :index="item1.title" :key="item1.title">
                  <template slot="title" >{{item1.title}}</template>
                  <el-menu-item  v-for="(item2) in item1.child" :index="item2.route" :key="item2.route">{{item2.name}}</el-menu-item>
                </el-submenu>
              </template>
            </el-submenu>
        </el-menu>
      </div>
      <div class="admin-main">
        <div style="overflow-y: auto;height: 100%;padding: 20px;box-sizing: border-box">
          <el-tabs v-model="editableTabsValue2"  v-if="editableTabs2.length" type="card" closable @tab-remove="removeTab" @tab-click="clickTab">
            <el-tab-pane
              v-for="(item) in editableTabs2"
              :key="item.name"
              :label="item.name"
              :name="item.route"
            >
            </el-tab-pane>
          </el-tabs>
          <router-view v-if="isRouterAlive" style="" v-on:openImg="PreviewImg"></router-view>
        </div>
      </div>
    </div>
    <el-dialog width="600px"  :title="userTitle.title" :visible.sync="dialogFormVisible1" @close="resetForm('ruleForm2')">
      <div v-if="userTitle.title==='用户信息'">
        <template v-if="userDetail">
          <h4>一、基本信息</h4>
          <p>
            <span>姓名：{{userDetail.name}}</span>
            <span>身份证号：{{userDetail.idCard}}</span>
            <span>手机号：{{userDetail.mobile}}</span>
          </p>
          <p>
            <span>性别：{{userDetail.sex}}</span>
            <span>角色：{{userDetail.role}}</span>
            <span>地址：{{userDetail.address}}</span>
          </p>
          <h4>二、绑定银行卡</h4>
          <p v-if="userDetail.bank">
            <span>打款户名：{{userDetail.bank.accountName}}</span>
            <span>打款账号：{{userDetail.bank.account}}</span>
            <span>打款开户行：{{userDetail.bank.bankName}}</span>
          </p>
        </template>
      </div>
      <template v-else>
        <el-form label-position="left" label-width="135px" size="mini" :inline="true"   :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2">
          <el-form-item  prop="oldPass" label="原密码：">
            <el-input :minlength="6" :maxlength="12"  type="password" v-model="ruleForm2.oldPass" placeholder="请输入密码" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item  prop="newPass" label="新密码：">
            <el-input :minlength="6" :maxlength="12" type="password" v-model="ruleForm2.newPass" placeholder="请输入密码" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item  prop="newPass2" label="再次确认新密码：">
            <el-input :minlength="6" :maxlength="12"  type="password" v-model="ruleForm2.newPass2" placeholder="请输入密码" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible1 = false">取 消</el-button>
          <el-button type="primary" @click="submitForm('ruleForm2')">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog :title="dialogImg.title" :visible.sync="dialogImg.status">
      <el-upload
        action="admin/pic/upload.action"
        name="uploadFile"
        :file-list="changeFile"
        :on-error="$common.imgError"
        :show-file-list="false"
        v-show="dialogImg.set"
        :on-success="imgOK">
        <el-button size="small" type="primary">更换图片</el-button>
      </el-upload>
      <img style="width: 200px;margin-top: 10px" :src="dialogImg.url" alt="">
    </el-dialog>
  </div>
</template>

<style scoped>
  .el-menu{
    border-right: none;
  }
  .admin-person{
    float: right;
  }
  .admin-person>span{
    margin-right: 10px;
  }
  .admin-head {
    background-color: #23262E;
    color: rgba(255,255,255,.7);
    line-height: 60px;
    padding: 0 20px;
    height: 60px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box ;
    z-index: 1;
  }
  .admin-container{
    position: relative;
    height: 100%;
    box-sizing: border-box ;
    padding-top: 60px;
  }
  .el-menu-item-group__title{
    padding: 0;
  }
  .admin-aside{
    float: left;
    box-sizing: border-box ;
    background-color: #393D49;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: 200px;
  }
  .admin-main{
    height: 100%;
    box-sizing: border-box ;
    padding-left:200px;
  }
</style>
<script>
import Vue from 'vue'

import {
  Tabs,
  Tag,
  TabPane,
  Dropdown,
  DatePicker,
  Breadcrumb,
  BreadcrumbItem,
  DropdownMenu,
  DropdownItem,
  Table,
  CheckboxGroup,
  TableColumn,
  Menu,
  Submenu,
  MenuItemGroup,
  Form,
  FormItem,
  Input,
  Button,
  Progress,
  Checkbox,
  Tree,
  Pagination,
  Dialog,
  MenuItem,
  Select,
  Upload,
  Radio,
  RadioButton,
  Autocomplete,
  RadioGroup,
  Carousel,
  CarouselItem,
  Option
} from 'element-ui'
Vue.use(Carousel)
Vue.use(CarouselItem)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Checkbox)
Vue.use(Progress)
Vue.use(DatePicker)
Vue.use(Radio)
Vue.use(CheckboxGroup)
Vue.use(Autocomplete)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Checkbox)
Vue.use(Tag)
Vue.use(Upload)
Vue.use(Select)
Vue.use(Option)
Vue.use(Dialog)
Vue.use(Tabs)
Vue.use(Pagination)
Vue.use(Tree)
Vue.use(TabPane)
Vue.use(Table)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(TableColumn)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
export default {
  name: 'admin',
  data () {
    return {
      changeFile: [],
      isRouterAlive: true,
      ruleForm2: {
        oldPass: '',
        newPass: '',
        newPass2: ''
      },
      rules2: {
        oldPass: [
          {required: true, message: '请输入原登录密码'},
          {min: 6, max: 12, message: '长度在 6 到 12 个字符'}
        ],
        newPass: [
          {required: true, message: '请输入新登录密码'},
          {min: 6, max: 12, message: '长度在 6 到 12 个字符'}
        ],
        newPass2: [
          {required: true, message: '请再次输入新登录密码'},
          {min: 6, max: 12, message: '长度在 6 到 12 个字符'}
        ]
      },
      userTitle: {
        title: '用户信息'
      },
      dialogFormVisible1: false,
      userInfo: '',
      userDetail: '',
      editableTabsValue2: '2',
      dialogImg: {
        status: false,
        title: '',
        set: false,
        url: ''
      },
      editableTabs2: [],
      tabIndex: 2,
      tabAll: this.$common.powerList.navList
    }
  },
  methods: {
    menuSelect (a) {
    },
    controlClick (type) {
      var that = this
      if (type === 1) {
        that.$axios({
          method: 'post',
          url: 'login/getAccountInfo.action',
          data: {
            userId: sessionStorage.getItem('userId')
          }
        }).then(function (res) {
          if (!res) {
            that.$message.warning('无用户信息')
            return
          }
          that.userDetail = res
          that.dialogFormVisible1 = true
        })
      } else if (type === 2) {
        this.userTitle = {
          title: '修改密码'
        }
        this.dialogFormVisible1 = true
      } else {
        that.$axios({
          method: 'post',
          url: 'login/logout.action',
          data: {
            userId: sessionStorage.getItem('userId')
          }
        }).then(function () {
          that.$message.success('操作成功')
          sessionStorage.removeItem('userId')
          var exp = new Date()
          exp.setTime(exp.getTime() - 1)
          document.cookie = 'token' + '=' + 11111 + ';expires=' + exp.toUTCString()
          that.$router.push('/login')
        })
      }
    },
    resetForm (formName) {
      if (this.userTitle.title === '修改密码') {
        this.ruleForm2 = {
          oldPass: '',
          newPass: '',
          newPass2: ''
        }
        this.userTitle = {
          title: '用户信息'
        }
        this.userDetail = ''
        this.$refs[formName].resetFields()
      }
    },
    submitForm (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (that.ruleForm2.newPass !== that.ruleForm2.newPass2) {
            that.$message.warning('两次密码不一致')
          }
          that.$axios({
            method: 'post',
            url: 'login/modifiedPassword.action',
            data: {
              userId: sessionStorage.getItem('userId'),
              oldPassword: that.ruleForm2.oldPass,
              newPassword: that.ruleForm2.newPass2
            }
          }).then(function () {
            that.$message.success('操作成功')
            that.dialogFormVisible1 = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleError (err, file, fileList) {
      console.log(err)
    },
    imgOK (response, file, fileList) {
      if (!this.$common.imgRes(response)) {
        fileList.splice(1, 1)
        return
      }
      this.changeFile = [{name: file.name, url: response.data.url}]
      this.dialogImg.callback(response.data.url)
      this.dialogImg.url = response.data.url
    },
    PreviewImg (url, callback) {
      var set = false
      var func
      if (callback) {
        func = callback
        set = true
      }
      this.dialogImg = {
        status: true,
        url: url,
        title: set ? '修改图片' : '',
        set: set,
        callback: func
      }
    },
    addTab (name, route, state) {
      if (!state) { this.editableTabs2.push({name: name, route: route}) }
      this.editableTabsValue2 = route
    },
    removeTab (targetName) {
      let tabs = this.editableTabs2
      let activeName = this.editableTabsValue2
      if (tabs.length > 1) {
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.route === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.route
              }
            }
          })
        }
        this.editableTabs2 = tabs.filter(tab => tab.route !== targetName)
        this.editableTabsValue2 = activeName
      } else {
        this.editableTabs2 = []
        activeName = '/admin'
      }
      this.$router.push(activeName)
    },
    clickTab (tab) {
      if (tab.name === this.$route.path) {
        this.isRouterAlive = false
        this.$nextTick(() => (this.isRouterAlive = true))
        return
      }
      this.$router.push(tab.name)
    }
  },
  watch: {
    '$route' (to) {
      let flag = false
      if (to.path !== '/admin') {
        for (let option of this.editableTabs2) {
          if (option.name === to.name) {
            flag = true
            break
          }
        }
        this.addTab(to.name, to.path, flag)
      }
    }
  },
  created () {
    var that = this
    that.$axios({
      method: 'get',
      url: 'login/getHomePage.action'
    }).then(function (res) {
      that.userInfo = res
      sessionStorage.setItem('userId', res.userId)
      if (res.city) {
        that.$common.storeData.storageAddress = {
          address: res.address,
          mobile: res.addressMobile,
          name: res.addressName,
          area: res.area,
          city: res.city,
          province: res.province
        }
      }
    })
    var route = this.$route.path.split('/')
    if (route[1] === 'admin' && route[2]) {
      this.addTab(this.$route.name, this.$route.path, false)
    }
  }
}
</script>
