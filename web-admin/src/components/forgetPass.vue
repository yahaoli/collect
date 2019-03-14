<template>
  <div class="login">
    <div class="login-title">忘记密码</div>
    <el-form class="login-form" :model="forgetForm" status-icon :rules="rules2" ref="forgetForm">
      <el-form-item  prop="phone">
        <el-input :maxlength=11  v-model="forgetForm.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item  prop="num">
        <el-input style="width: 200px;vertical-align: middle"  v-model="forgetForm.num"  placeholder="请输入验证码"></el-input>
        <img @click="imgUrl='admin/login/randomIMG.action?a='+new Date().getTime()"  style="vertical-align: middle;cursor: pointer" :src=imgUrl alt="">
      </el-form-item>
      <el-form-item>
        <el-button style="width: 100%" type="primary" @click="submitForm('forgetForm')">下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'forget-pass',
  data () {
    var that = this
    return {
      imgUrl: 'admin/login/randomIMG.action',
      forgetForm: {
        num: '',
        phone: ''
      },
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
  created () {
  },
  methods: {
    submitForm (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios({
            method: 'post',
            url: 'login/chekcIMG.action',
            data: {
              code: that.forgetForm.num
            }
          }).then(function (res) {
            that.$router.push({path: '/login/forgetPass2', query: {phone: that.forgetForm.phone}})
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
