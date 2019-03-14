<template>
  <div class="login-bg">
    <div class="login-icon">
      <img class="admin-align" src="../img/pic2.png" alt="">
      <span class="admin-align" >茂茂后台管理系统</span>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import Vue from 'vue'
import {Form, FormItem, Input, Button, Checkbox} from 'element-ui'
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.use(Checkbox)
export default {
  name: 'login'
}
</script>

<style>
.login-bg{
  position: absolute;
  background: url("../img/pic.jpg") no-repeat;
  background-size: cover;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;
  }
.login-icon{
  margin-top: 20px;
  padding-left: 20px;
}
.login{
  width: 327px;
  position: absolute;
  height: 370px;
  top: 50%;
  margin-top: -195px;
  border-radius: 5px;
  right: 10%;
  background-color: rgba(255, 255, 255, 1);
  box-sizing: border-box;
  border: solid 1px rgba(121, 121, 121, 1);
}
.login-form{
  margin-top: 40px;
  padding: 0 10px;
}
.login-title{
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-bottom: solid 1px rgba(121, 121, 121, 1);
  font-weight: 700;
  font-size: 16px ;
}
</style>
