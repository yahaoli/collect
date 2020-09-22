<template>
    <div class="login-con">
        <div class="login-title">登录</div>
        <el-form class="login-form" :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2">
            <el-form-item  prop="phone">
                <el-input :maxlength=11 @keyup.enter.native="submitForm('ruleForm2')" v-model="ruleForm2.phone" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item  prop="pass">
                <el-input  @keyup.enter.native="submitForm('ruleForm2')" type="password" v-model="ruleForm2.pass" placeholder="请输入密码" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button style="width: 100%" type="primary" @click="submitForm('ruleForm2')">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                ruleForm2: {
                    pass: '',
                    phone: ''
                },
                rules2: Object.freeze({
                    pass: [
                        {required: true, message: '请输入密码'}
                    ],
                    phone: [
                        {required: true, message: '请输入账号'}
                    ]
                })
            }
        },
        methods: {
            submitForm (formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        console.log(1111)
                    } else {
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

<style lang="scss">
@import "index";
</style>
