<template>
  <div>
    <div class="el-form el-form--inline">
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-input size="small" @keyup.enter.native="submitForm()" :maxlength=20 v-model="ruleForm2.account" placeholder="请输入手机号/身份证/姓名"></el-input>
        </div>
      </div>
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-button size="small" type="primary" @click="ruleForm2.account=''">重置</el-button>
          <el-button size="small" type="primary" @click="submitForm()">搜索</el-button>
        </div>
      </div>
    </div>
    <el-table  class="admin-table" border   max-height="400" :data="tableData">
      <el-table-column align="center"  label="申请时间">
        <template slot-scope="scope">
          {{scope.row.createTime | dateFormat(2)}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="mobile" label="申请账号"></el-table-column>
      <el-table-column align="center" prop="name" label="申请人"></el-table-column>
      <el-table-column align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(131)" @click="handleClick(scope.row)" type="text" size="mini">立即审核</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage1"
      :page-size="pageSize"
      layout="prev,total, pager, next,jumper"
      :total="pageTotal*1">
    </el-pagination>
    <el-dialog title="申请详情" width="700px" :visible.sync="dialogFormVisible">
      <el-dialog
        width="350px"
        title="审核通过"
        :visible.sync="innerVisible"
        @close="resetForm"
        append-to-body>
        <el-form  size="mini"  :inline="true" :model.sync="ruleForm" :rules="rules" ref="ruleForm" status-icon>
          <el-form-item prop="way"  label="授信方式：" >
            <el-select v-model="ruleForm.way" style="width: 140px">
              <el-option v-for="(item) in moneyWay" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="money" label="授信额度：">
            <el-input :maxlength=13 v-model="ruleForm.money" placeholder="请输入授信额度">
              <template slot="suffix">元</template>
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="submitForm2(3)">确认</el-button>
        </div>
      </el-dialog>
      <h4>一、申请人基本信息</h4>
      <p class="admin-span">
        <span> 姓名：{{applyInfo.name}}</span>
        <span>身份证号：{{applyInfo.idCard}}</span>
        <span>联系电话：{{applyInfo.bankMobile}}</span>
        <span>登录账号：{{applyInfo.mobile}}</span>
      </p>
      <h4>二、提现账号</h4>
      <p class="admin-span">
        <span>开户行：{{applyInfo.bankName}}</span>
        <span>开户账户：{{applyInfo.bankAccount}}</span>
        <span>户名：{{applyInfo.bankUsername}}</span>
      </p>
      <h4>三、申请时间</h4>
      <p class="admin-span"><span>申请时间：{{applyInfo.createTime|dateFormat(2)}}</span></p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitForm2(2)">拒绝受理</el-button>
        <el-button type="primary" @click="submitForm2(1)">审核通过</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'store-apply',
  data () {
    return {
      applyInfo: '',
      ruleForm2: {
        account: ''
      },
      ruleForm: {
        way: '',
        money: ''
      },
      rules: {
        way: [
          {required: true, message: '请选择授信方式'}
        ],
        money: [
          {required: true, message: '请输入授信额度'},
          {validator: this.$common.numTo2}
        ]
      },
      dialogFormVisible: false,
      innerVisible: false,
      tableData: [],
      currentPage1: 1,
      moneyWay: [
        {name: '虚拟授信', id: 0},
        {name: '信用贷款', id: 1},
        {name: '现金打款', id: 2}
      ],
      pageSize: 20,
      pageTotal: 0
    }
  },
  created () {
    this.pageData()
  },
  methods: {
    resetForm () {
      this.ruleForm = {
        way: '',
        money: ''
      }
      this.$refs['ruleForm'].clearValidate()
    },
    pageData () {
      var that = this
      this.$axios({
        method: 'post',
        url: 'shop/getSearchUser.action',
        data: {
          page: that.currentPage1,
          rows: that.pageSize,
          queryString: that.ruleForm2.account
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    submitForm () {
      this.currentPage1 = 1
      this.pageData()
    },
    submitForm2 (type) {
      var that = this
      if (type === 2) {
        this.$prompt('内容：', '拒绝理由', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入拒绝理由',
          inputValidator: function (value) {
            if (!value) {
              return '请输入内容'
            }
            return true
          }
        }).then(({ value }) => {
          that.$axios({
            method: 'post',
            url: 'shop/shopRefused.action',
            data: {
              userApplyId: that.applyInfo.userApplyId,
              reason: value
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.dialogFormVisible = false
            that.pageData()
          })
        }).catch(() => {

        })
      } else if (type === 1) {
        this.innerVisible = true
      } else {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            that.$axios({
              method: 'post',
              url: 'shop/shopApproved.action',
              data: {
                userApplyId: that.applyInfo.userApplyId,
                creditReal: that.ruleForm.way,
                loan: that.ruleForm.money
              }
            }).then(function (res) {
              that.$message.success('操作成功')
              that.dialogFormVisible = false
              that.innerVisible = false
              that.pageData()
            })
          }
        })
      }
    },
    handleClick (data) {
      var that = this
      this.$axios({
        method: 'post',
        url: 'shop/getShopApply.action',
        data: {
          userApplyId: data.userApplyId
        }
      }).then(function (res) {
        that.dialogFormVisible = true
        that.applyInfo = res
        that.applyInfo.userApplyId = data.userApplyId
      })
    },
    handleCurrentChange () {
      this.pageData()
    }
  }
}
</script>

<style scoped>

</style>
