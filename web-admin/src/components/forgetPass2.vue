<template>
  <div class="login">
    <div class="login-title">输入验证码</div>
    <el-form class="login-form" :model="forgetForm" status-icon :rules="rules2" ref="forgetForm">
      <el-form-item  prop="phone">
        <el-input :maxlength=11 style="width: 180px" v-model="forgetForm.phone" placeholder="请输入手机号"></el-input>
        <el-button @click="getCode('forgetForm')" >{{time}}</el-button>
      </el-form-item>
      <el-form-item  prop="num">
        <el-input style="width: 180px"  v-model="forgetForm.num"  placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 100%" type="primary" @click="submitForm('forgetForm')">下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'forget-pass2',
  data () {
    var that = this
    return {
      forgetForm: {
        num: '',
        phone: ''
      },
      time: '获取验证码',
      rules2: {
        num: [
          {required: true, message: '请输入验证码'}
        ],
        phone: [
          {required: true, message: '请输入手机号'},
          {validator: that.$common.phone}
        ]
      }
    }
  },
  methods: {
    getCode (formName) {
      var that = this
      if (this.time === '获取验证码') {
        this.$refs[formName].validateField('phone', (valid) => {
          if (!valid) {
            that.$axios({
              method: 'post',
              url: 'login/getSmsCode.action',
              data: {
                mobile: that.forgetForm.phone
              }
            }).then(function (res) {
              that.time = 60
              var a = setInterval(function () {
                if (that.time === 1) {
                  that.time = '获取验证码'
                  clearInterval(a)
                  return
                }
                that.time = that.time - 1
              }, 1000)
            })
          }
        })
      }
    },
    submitForm (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.$axios({
            method: 'post',
            url: 'login/checkSmsCode.action',
            data: {
              mobile: that.forgetForm.phone,
              code: that.forgetForm.num
            }
          }).then(function (res) {
            that.$router.push({path: '/login/setPass/' + res.token + '/' + that.forgetForm.phone})
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
