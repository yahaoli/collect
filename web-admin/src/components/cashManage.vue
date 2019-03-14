<template>
  <div>
    <div>
      <div class="el-form el-form--inline">
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-input size="small" @keyup.enter.native="formSearch()" :maxlength=20 v-model="ruleForm2.name" placeholder="请输入店铺负责人/手机号"></el-input>
          </div>
        </div>
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-button size="small"  type="primary" @click="ruleForm2.name=''">重置</el-button>
            <el-button size="small"  type="primary" @click="formSearch()">搜索</el-button>
          </div>
        </div>
      </div>
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item) in orderList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        >

        </el-tab-pane>
        <p v-if="activeName==='credit1'&&$common.havePower(78)" v-show="activeName==='credit1'" style="text-align: right;margin-bottom: 10px">
          <el-button @click="downloadExcel(2)" size="small" type="primary">导出excel</el-button>
        </p>
        <p v-if="activeName==='credit4'&&$common.havePower(171)" v-show="activeName==='credit1'" style="text-align: right;margin-bottom: 10px">
          <el-button @click="downloadExcel(4)" size="small" type="primary">导出excel</el-button>
        </p>
      </el-tabs>
      <div>
        <el-table class="admin-table" border max-height="400" :data="tableData">
          <template v-for="item in tableHead[activeName]">
            <el-table-column v-if="item.name==='account'" :key="item.name" :formatter="item.formatter" align="center"
                             :prop="item.name" :label="item.value">
              <template slot-scope="scope">
                开户行：{{scope.row.bankName}}
                户名：{{scope.row.userName}}
                账号：{{scope.row.account}}
              </template>
            </el-table-column>
            <el-table-column v-else :key="item.name" :formatter="item.formatter" align="center" :prop="item.name"
                             :label="item.value">
            </el-table-column>
          </template>

          <el-table-column v-if="activeName==='credit1'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(77)" @click="controlClick(scope.row)" type="text" size="mini">查看
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-if="activeName==='credit2'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(80)" @click="controlClick(scope.row)" type="text" size="mini">查看
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-if="activeName==='credit3'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(162)" @click="controlClick(scope.row)" type="text" size="mini">查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            background
            @current-change="handleCurrentChange()"
            :current-page.sync="currentPage1"
            :page-size="pageSize"
            layout="slot,prev,total, pager, next,jumper"
            :total="pageTotal">
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog title="提现信息" width="500px" :visible.sync="credit1dialog">
      <p>
        <span>店铺负责人：{{cashInfo.name}}</span>
        <span>手机号：{{cashInfo.mobile}}</span>
        <span>开户行：{{cashInfo.bankName}}</span>
        <span>户名：{{cashInfo.userName}}</span>
      </p>
      <p>
        <span>账号：{{cashInfo.account}}</span>
        <span>提现金额：{{cashInfo.money}}</span>
        <span>申请时间：{{cashInfo.createTime | dateFormat(1)}}</span>
      </p>
      <el-form size="mini" :inline="true" :model.sync="creditForm" :rules="creditRule" ref="creditForm" status-icon>
        <el-form-item prop="way" label="提现状态：">
          <el-select v-model="creditForm.way" style="width: 140px">
            <el-option v-for="(item,index) in goods.way" v-if="index>0" :key="index" :label="item.name"
                       :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitCredit('creditForm')">保存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提现明细" width="800px" :visible.sync="credit2dialog">
      <p>
        <span>店铺负责人：{{cashInfo.name}}</span>
        <span>手机号：{{cashInfo.mobile}}</span>
        <span>账户余额：{{(cashInfo.money/100).toFixed(2)}}</span>
        <span>提现次数：{{cashInfo.num}}</span>
        <span>提现总额：{{(cashInfo.accumulativeMoney/100).toFixed(2)}}</span>
      </p>
      <el-table class="admin-table" border max-height="200" :data="cashTable">
        <el-table-column align="center" prop="createTime" label="提现时间"></el-table-column>
        <el-table-column align="center" prop="money" label="提现金额（元）"></el-table-column>
        <el-table-column align="center" prop="accountMoney" label="账户余额（元）"></el-table-column>
        <el-table-column align="center" prop="account" label="收款账号"></el-table-column>
        <el-table-column align="center" prop="status" label="提现状态">
          <template slot-scope="scope">
            {{goods.way[scope.row.status].name}}
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-pagination
          background
          @current-change="handleCurrentChange(2)"
          :current-page.sync="currentPage2"
          :page-size="pageSize2"
          layout="slot,prev,total, pager, next,jumper"
          :total="pageTotal2">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'cash-manage',
  components: {adminAddress},
  data () {
    var that = this
    return {
      cashInfo: '',
      orderList: [],
      credit1dialog: false,
      credit2dialog: false,
      activeName: 'credit1',
      creditForm: {
        way: ''
      },
      creditRule: {
        way: [
          {required: true, message: '请选择提现状态'}
        ]
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      currentPage2: 1,
      pageSize2: 20,
      pageTotal2: 0,
      tableHead: {
        credit1: [
          {name: 'name', value: '店铺负责人'},
          {name: 'mobile', value: '手机号'},
          {name: 'money',
            value: '提现金额（元）',
            formatter: function (row) {
              return (row.money / 100).toFixed(2)
            }
          },
          {name: 'account', value: '提现账号'},
          {name: 'createTime',
            value: '申请时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.createTime, 1)
            }
          }
        ],
        credit2: [
          {name: 'name', value: '店铺负责人'},
          {name: 'mobile', value: '手机号'},
          {name: 'money', value: '账户余额'},
          {name: 'num', value: '提现次数'},
          {name: 'sum',
            value: '提现金额（元）',
            formatter: function (row) {
              return (row.money / 100).toFixed(2)
            }
          },
          {name: 'lastTime',
            value: '最近一次提现时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.lastTime, 1)
            }
          }
        ],
        credit3: [
          {name: 'name', value: '店铺负责人'},
          {name: 'mobile', value: '手机号'},
          {name: 'money',
            value: '提现金额（元）',
            formatter: function (row) {
              return (row.money / 100).toFixed(2)
            }
          },
          {name: 'account', value: '提现账号'},
          {name: 'createTime',
            value: '申请时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.createTime, 1)
            }
          }
        ]
      },
      cashTable: [],
      tableData: [],
      goods: {
        way: [
          {name: '申请中', id: 0},
          {name: '已打款', id: 1},
          {name: '打款失败', id: 2}
        ]
      },
      ruleForm2: {
        name: ''
      }
    }
  },
  created () {
    var list = [
      {
        label: '提现申请',
        id: 76,
        name: 'credit1'
      },
      {
        label: '历史提现',
        id: 79,
        name: 'credit2'
      },
      {
        label: '车商提现',
        id: 161,
        name: 'credit3'
      }
    ]
    var currentList = this.$common.powerFilter(list)
    this.activeName = currentList[0].name
    this.orderList = currentList
    this.pageData()
  },
  methods: {
    formSearch () {
      this.currentPage1 = 1
      this.pageData()
    },
    pageData () {
      var that = this
      var url = 'withdrawals/getUserWithdrawalsList.action'
      var option = {
        pages: that.currentPage1,
        rows: that.pageSize,
        queryString: that.ruleForm2.name
      }
      if (this.activeName === 'credit2') {
        url = 'withdrawals/getHistoryUserWithdrawalsList.action'
      } else {
        option.category = this.activeName === 'credit1' ? 0 : 1
      }
      this.tableData = []
      this.$axios({
        method: 'get',
        url: url,
        params: option
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    submitForm () {
      console.log()
    },
    handleCurrentChange (type) {
      if (type === 2) {
        this.cashHistory()
        return
      }
      this.pageData()
    },
    cashHistory () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'withdrawals/getHistoryUserWithdrawalsDetail.action',
        params: {
          pages: that.currentPage2,
          userId: that.cashInfo.userId,
          rows: that.pageSize2
        }
      }).then(function (res) {
        that.cashTable = res.rows
        that.pageTotal2 = res.total
        that.credit2dialog = true
      })
    },
    tabClick () {
      this.pageData()
    },
    submitCredit (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.$axios({
            method: 'post',
            url: 'withdrawals/updateUserWithdrawalsByStatus.action',
            data: {
              id: that.cashInfo.id,
              status: that.creditForm.way
            }
          }).then(function () {
            that.resetForm('creditForm')
            that.$message.success('操作成功！')
            that.credit1dialog = false
            that.pageData()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.creditForm.way = ''
      this.$refs[formName].resetFields()
    },
    controlClick (data) {
      if (this.activeName === 'credit1' || this.activeName === 'credit3') {
        this.cashInfo = data
        this.credit1dialog = true
      } else {
        this.cashInfo = data
        this.cashHistory()
      }
    },
    downloadExcel (type) {
      window.location.href = '/admin/export.action?type=' + type
    }
  }
}
</script>

<style scoped>
</style>
