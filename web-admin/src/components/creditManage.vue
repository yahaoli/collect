<template>
  <div>
    <div>
      <el-form size="small" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
        <el-form-item prop="goodsWay"  label="授信方式：" >
          <el-select v-model="ruleForm2.goodsWay" style="width: 140px">
            <el-option v-for="(item,index) in goods.way" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="goodsName">
          <el-input @keyup.enter.native="formSearch()" style="width: 350px" :maxlength=20 v-model="ruleForm2.goodsName" placeholder="请输入店铺名称/负责人/手机号/公司名称/法人姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  type="primary" @click="resetForm('ruleForm2')">重置</el-button>
          <el-button  type="primary" @click="formSearch()">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item) in orderList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        >

        </el-tab-pane>
        <p v-if="$common.havePower(70)"  v-show="activeName==='credit1'" style="text-align: right;margin-bottom: 10px">
          <el-button @click="downloadExcel()" size="small"   type="primary">导出excel</el-button>
        </p>
      </el-tabs>
      <div>
        <el-table  class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column  v-for="item in tableHead[activeName]" :formatter="item.formatter" :key="item.name" align="center" :prop="item.name" :label="item.value"></el-table-column>
          <el-table-column v-if="activeName==='credit1'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(69)" @click="creditSet(scope.row)" type="text" size="mini">编辑</el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="activeName==='credit2'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(72)"  @click="creditSet(scope.row)" type="text" size="mini">编辑</el-button>
            </template>
          </el-table-column>
          <el-table-column v-else align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(74)"  @click="creditSet(scope.row)" type="text" size="mini">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            background
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage1"
            :page-size="pageSize"
            layout="slot,prev,total, pager, next,jumper"
            :total="pageTotal">
          </el-pagination>
        </div>
      </div>
    </div>
      <el-dialog :title="title"  top="5vh" width="940px" :visible.sync="dialogFormVisible">
        <div v-if="creditInfo&&activeName!=='credit2'">
          <div>
            <h4>一、申请人基本信息</h4>
            <span>姓名：{{creditInfo.name}}</span>
            <span>身份证号：{{creditInfo.idCard}}</span>
            <span>联系电话：{{creditInfo.mobile}}</span>
            <span>登录账号：{{creditInfo.mobile}}</span>
          </div>
          <div>
            <h4>二、提现账号</h4>
            <span>开户行：{{creditInfo.bank[0].bankName}}</span>
            <span>开户账号：{{creditInfo.bank[0].account}}</span>
            <span>户名：{{creditInfo.bank[0].userName}}</span>
          </div>
          <div>
            <h4>三、申请时间</h4>
            <span>申请时间：{{creditInfo.applyTime|dateFormat(1)}}</span>
          </div>
          <div>
            <h4>四、授信信息</h4>
            <el-form size="mini" :inline="true" :model.sync="creditForm" :rules="creditRule" ref="creditForm" status-icon>
                <el-form-item prop="way" label="授信方式：">
                  <el-select v-model="creditForm.way" style="width: 140px">
                    <el-option v-for="(item,index) in goods.way" v-if="index>0"  :key="index" :label="item.name" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item  v-if="activeName==='credit1'" prop="money" label="授信金额：">
                  <el-input :maxlength=15 v-model="creditForm.money" placeholder="请输入授信金额"></el-input>
                </el-form-item>
                <el-form-item  v-else prop="applyMoney" label="申请金额：">
                  <el-input :maxlength=15 v-model="creditForm.applyMoney" placeholder="请输入申请金额"></el-input>
                </el-form-item>
                <el-form-item v-if="+creditForm.way===1" prop="time" label="还款截止时间：">
                <el-date-picker
                  v-model="creditForm.time"
                  format="yyyy/MM/dd"
                  value-format="timestamp"
                  :picker-options="pickerOptions1"
                  type="date"
                  :editable="false"
                  placeholder="选择日期"
                  :clearable="false">
                </el-date-picker>
              </el-form-item>
            </el-form>
            <p>
              授信总额：{{creditInfo.totalMoney}}
            </p>
          </div>
          <div>
            <h4>五、授信使用情况</h4>
            <span>上架商品数量：{{creditInfo.onsaleGoods}}</span>
            <span>认筹商品数量：{{creditInfo.subscription}}</span>
            <span>认筹金额：{{creditInfo.useMoney}}</span>
          </div>
        </div>
        <div v-if="activeName==='credit2'">
          <el-form size="mini" :inline="true" :model.sync="creditForm" :rules="creditRule" ref="creditForm" status-icon>
              <el-form-item prop="pledgeMoney" label="质押金：">
                <el-input :maxlength=15 v-model="creditForm.pledgeMoney" placeholder="请输入质押金额"></el-input>
              </el-form-item>
              <el-form-item prop="money" label="贷款金额：">
                <el-input :maxlength=15 v-model="creditForm.money" placeholder="请输入贷款金额"></el-input>
              </el-form-item>
              <el-form-item prop="time" label="还款截止时间：">
                <el-date-picker
                  v-model="creditForm.time"
                  format="yyyy/MM/dd"
                  value-format="timestamp"
                  :picker-options="pickerOptions1"
                  type="date"
                  :editable="false"
                  placeholder="选择日期"
                  :clearable="false">
                </el-date-picker>
              </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="submitCredit('creditForm')">保存</el-button>
          <el-button v-if="activeName==='credit3'" @click="submitRefuse">拒绝</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'credit-manage',
  components: {adminAddress},
  data () {
    var that = this
    var option = {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      dialogFormVisible: false,
      creditInfo: '',
      title: '店铺授信',
      orderList: [],
      activeName: 'credit1',
      creditForm: {
        way: '',
        money: '',
        applyMoney: '',
        pledgeMoney: '',
        time: ''
      },
      creditRule: {
        way: [
          {required: true, message: '请选择授信方式'}
        ],
        money: [
          {required: true, message: '请输入授信金额'},
          {validator: that.$common.numTo2}
        ],
        applyMoney: [
          {required: true, message: '请输入申请金额'},
          {validator: that.$common.numTo2}
        ],
        pledgeMoney: [
          {required: true, message: '请输入质押金额'},
          {validator: that.$common.numTo2}
        ],
        time: [
          {required: true, message: '请选择还款截止时间'}
        ],
        phone: [
          {required: true, message: '请输入手机号'},
          {validator: that.$common.phone}
        ]
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      tableHead: {
        credit1: [
          {name: 'account', value: '登录账号'},
          {name: 'name', value: '店铺负责人'},
          {name: 'creditType', value: '授信方式'},
          {name: 'leaveMoney',
            value: '授信金额（元）',
            formatter: function (row) {
              return (row.leaveMoney / 100).toFixed(2)
            }},
          {name: 'totalMoney',
            value: '授信总额（元）',
            formatter: function (row) {
              return (row.totalMoney / 100).toFixed(2)
            }},
          {name: 'useMoney',
            value: '已用额度（元）',
            formatter: function (row) {
              return (row.useMoney / 100).toFixed(2)
            }},
          {name: 'time',
            value: '还款截止时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.time, 1)
            }
          }
        ],
        credit2: [
          {name: 'company', value: '公司名称'},
          {name: 'name', value: '法人姓名'},
          {name: 'account', value: '登录账号'},
          {name: 'zhiyaMoney',
            value: '质押金（元）',
            formatter: function (row) {
              return (row.zhiyaMoney / 100).toFixed(2)
            }},
          {name: 'daikuanMoney',
            value: '贷款金额（元）',
            formatter: function (row) {
              return (row.daikuanMoney / 100).toFixed(2)
            }},
          {name: 'totalMoney',
            value: '授信总额（元）',
            formatter: function (row) {
              return (row.totalMoney / 100).toFixed(2)
            }},
          {name: 'zhiyaGoodsMoney',
            value: '抵押商品总价（元）',
            formatter: function (row) {
              return (row.zhiyaGoodsMoney / 100).toFixed(2)
            }},
          {name: 'time',
            value: '还款截止时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.time, 1)
            }}
        ],
        credit3: [
          {name: 'account', value: '登录账号'},
          {name: 'name', value: '店铺负责人'},
          {name: 'creditType',
            value: '授信方式',
            formatter: function (row) {
              var current = option.goods.way.filter(function (item) {
                return item.id === +row.creditType
              })
              return current[0].name || ''
            }
          },
          {name: 'leaveMoney',
            value: '申请金额（元）',
            formatter: function (row) {
              return (row.leaveMoney / 100).toFixed(2)
            }},
          {name: 'totalMoney',
            value: '授信总额（元）',
            formatter: function (row) {
              return (row.totalMoney / 100).toFixed(2)
            }},
          {name: 'useMoney',
            value: '已用额度（元）',
            formatter: function (row) {
              return (row.useMoney / 100).toFixed(2)
            }},
          {name: 'time',
            value: '还款截止时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.time, 1)
            }}
        ]
      },
      tableData: [],
      goods: {
        way: [
          {name: '全部', id: ''},
          {name: '虚拟授信', id: 0},
          {name: '信用贷款', id: 1},
          {name: '现金打款', id: 2}
        ]
      },
      ruleForm2: {
        goodsName: '',
        goodsWay: ''
      }
    }
    return option
  },
  created () {
    var list = [
      {
        label: '店铺授信管理',
        id: 68,
        name: 'credit1'
      },
      {
        label: '公司贷款管理',
        id: 71,
        name: 'credit2'
      },
      {
        label: '申请调额',
        id: 73,
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
      var url = ''
      if (this.activeName === 'credit1') {
        url = 'money/shopCreditList.action'
      } else if (this.activeName === 'credit2') {
        url = 'money/companyCredit.action'
      } else {
        url = 'money/userApplyCreditList.action'
      }
      this.tableData = []
      this.$axios({
        method: 'post',
        url: url,
        data: {
          pages: that.currentPage1,
          rows: that.pageSize,
          type: that.ruleForm2.goodsWay,
          keywords: that.ruleForm2.goodsName
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    creditSet (data) {
      var that = this
      var url = ''
      if (this.activeName === 'credit2') {
        that.creditForm = {
          id: data.id,
          money: (data.daikuanMoney / 100).toFixed(2),
          pledgeMoney: (data.zhiyaMoney / 100).toFixed(2),
          time: data.time
        }
        that.dialogFormVisible = true
        return
      }
      if (this.activeName === 'credit1') {
        url = 'money/shopCreditDetail.action'
      } else {
        url = 'money/userApplyCreditDetail.action'
      }
      this.$axios({
        method: 'post',
        url: url,
        data: {
          id: data.id
        }
      }).then(function (res) {
        that.creditInfo = res
        if (data.totalMoney * 1 >= 0) {
          that.creditInfo.totalMoney = (data.totalMoney / 100).toFixed(2)
        }
        that.creditForm = {
          way: res.creditType,
          id: data.id,
          money: (res.money / 100).toFixed(2),
          applyMoney: (res.applyMoney / 100).toFixed(2),
          pledgeMoney: data.zhiyaMoney ? (data.zhiyaMoney / 100).toFixed(2) : '',
          time: res.time
        }
        that.dialogFormVisible = true
      })
    },
    handleCurrentChange () {
      this.pageData()
    },
    tabClick (tab) {
      this.title = tab.label
      this.pageData()
    },
    submitRefuse: function () {
      var that = this
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
          url: 'money/refuseUserApply.action',
          data: {
            id: that.creditForm.id,
            msg: value
          }
        }).then(function () {
          that.$message.success('操作成功！')
          that.dialogFormVisible = false
          that.pageData()
        })
      }).catch(() => {
      })
    },
    submitCredit (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var url = ''
          var option
          if (that.activeName === 'credit1') {
            url = 'money/updateShopCredit.action'
            option = {
              id: that.creditForm.id,
              type: that.creditForm.way,
              money: Math.round(that.creditForm.money * 100),
              time: that.creditForm.time
            }
          } else if (that.activeName === 'credit2') {
            url = 'money/updateCompanyCredit.action'
            option = {
              id: that.creditForm.id,
              zhiyaMoney: Math.round(that.creditForm.pledgeMoney * 100),
              daikuanMoney: Math.round(that.creditForm.money * 100),
              time: that.creditForm.time
            }
          } else {
            option = {
              id: that.creditForm.id,
              type: that.creditForm.way,
              money: Math.round(that.creditForm.applyMoney * 100),
              time: that.creditForm.time
            }
            url = 'money/updateUserApply.action'
          }
          that.$axios({
            method: 'post',
            url: url,
            data: option
          }).then(function () {
            that.$message.success('操作成功！')
            that.dialogFormVisible = false
            that.pageData()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      if (formName === 'ruleForm2') {
        this.ruleForm2 = {
          goodsName: '',
          goodsWay: ''
        }
      } else {
        this.creditInfo = ''
        this.creditForm = {
          way: '',
          money: '',
          applyMoney: '',
          pledgeMoney: '',
          time: ''
        }
      }
      this.$refs[formName].resetFields()
    },
    downloadExcel () {
      window.location.href = '/admin/export.action?type=1'
    }
  }
}
</script>

<style scoped>
</style>
