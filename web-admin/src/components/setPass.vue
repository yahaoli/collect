<template>
  <div class="login">
    <div class="login-title">重置密码</div>
    <el-form class="login-form" :model="forgetForm" status-icon :rules="rules2" ref="forgetForm">
      <el-form-item  prop="pass">
        <el-input type="password" v-model="forgetForm.pass" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item  prop="pass2">
        <el-input type="password"  v-model="forgetForm.pass2"  placeholder="请再次输入密码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 100%" type="primary" @click="submitForm('forgetForm')">完成</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'set-pass',
  data () {
    return {
      forgetForm: {
        pass: '',
        pass2: ''
      },
      rules2: {
        pass: [
          {required: true, message: '请输入密码'}
        ],
        pass2: [
          {required: true, message: '请再次输入密码'}
        ]
      }
    }
  },
  methods: {
    submitForm (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (that.forgetForm.pass !== that.forgetForm.pass2) {
            that.$message.warning('两次密码不一致')
            return
          }
          that.$axios({
            method: 'post',
            url: 'login/updatePassword.action',
            data: {
              mobile: that.$route.params.mobile,
              password: that.forgetForm.pass,
              token: that.$route.params.token
            }
          }).then(function (res) {
            that.$message.success('密码重置成功，请重新登录')
            that.$router.push({path: '/login'})
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
