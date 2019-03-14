<template>
  <div class="login">
    <div class="login-title">登录</div>
    <el-form class="login-form" :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2">
      <el-form-item  prop="phone">
        <el-input :maxlength=11 @keyup.enter.native="submitForm('ruleForm2')" v-model="ruleForm2.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item  prop="pass">
        <el-input  @keyup.enter.native="submitForm('ruleForm2')" type="password" v-model="ruleForm2.pass" placeholder="请输入密码" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="ruleForm2.checkedPass" label="记住密码" name="type"></el-checkbox>
        <router-link style="float: right" to="login/forgetPass">忘记密码？</router-link>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 100%" type="primary" @click="submitForm('ruleForm2')">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'login-to',
  data () {
    var that = this
    return {
      ruleForm2: {
        pass: '',
        phone: '',
        checkedPass: false
      },
      rules2: {
        pass: [
          {required: true, message: '请输入密码'}
        ],
        phone: [
          {required: true, message: '请输入手机号'},
          {validator: that.$common.phone}
        ],
        checkedPass: [{}]
      }
    }
  },
  methods: {
    submitForm (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.$axios({
            method: 'post',
            url: 'login/login.action',
            data: {
              mobile: that.ruleForm2.phone,
              password: that.ruleForm2.pass,
              rember: that.ruleForm2.checkedPass === true ? 1 : 0
            }
          }).then(function (res) {
            sessionStorage.setItem('userId', res.userId)
            var cookieDate
            if (that.ruleForm2.checkedPass) {
              cookieDate = new Date()
              cookieDate.setDate(cookieDate.getDate() + 30)
            }
            document.cookie = 'token' + '=' + res.cookie + (cookieDate ? ';expires=' + cookieDate.toUTCString() : '')
            window.location.href = '/'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style>

</style>
