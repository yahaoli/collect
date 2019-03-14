<template>
    <div>
      <div v-if="!showDetail" key="showDetail1">
        <el-form size="small" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
          <el-form-item prop="fromTime" label="统计时间：">
            <el-date-picker
              v-model="ruleForm2.fromTime"
              type="daterange"
              :editable="false"
              :clearable="false"
              value-format="timestamp"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button  type="primary" @click="ruleForm2.fromTime=''">重置</el-button>
            <el-button  type="primary" @click="submitForm()">搜索</el-button>
          </el-form-item>
        </el-form>
        <p v-if="$common.havePower(127)" style="text-align: right;margin-bottom: 10px">
          <el-button  @click="downloadExcel()" size="small"   type="primary">导出excel</el-button>
        </p>
        <el-table class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column align="center" prop="time" label="日期">
            <template slot-scope="scope">
              {{scope.row.time | dateFormat(1)}}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :formatter="function(row) {
              return (row.orderPayMoney/100).toFixed(2)
            }"
            prop="orderPayMoney" label="支付金额">
          </el-table-column>
          <el-table-column
            align="center"
            :formatter="function(row) {
              return (row.orderRefundMoney/100).toFixed(2)
            }"
            prop="orderRefundMoney"
            label="退款金额"></el-table-column>
          <el-table-column
            align="center"
            :formatter="function(row) {
              return (row.couponGetMoney/100).toFixed(2)
            }"
            prop="couponGetMoney"
            label="优惠券发放金额">
          </el-table-column>
          <el-table-column
            align="center"
            :formatter="function(row) {
              return (row.couponUseMoney/100).toFixed(2)
            }"
            prop="couponUseMoney"
            label="优惠券使用金额"></el-table-column>
          <el-table-column
            align="center"
            :formatter="function(row) {
              return (row.couponExpireMoney /100).toFixed(2)
            }"
            prop="couponExpireMoney "
            label="优惠券过期金额"></el-table-column>
          <el-table-column align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(128)"   @click="handleClick(scope.row)" type="text" size="mini">查看明细</el-button>
            </template>
          </el-table-column>
        </el-table >
        <div class="block">
          <el-pagination
            background
            @current-change="handleCurrentChange()"
            :current-page.sync="currentPage1"
            :page-size="pageSize"
            layout="prev,total, pager, next,jumper"
            :total="pageTotal*1">
          </el-pagination>
        </div>
        <div>
          <p>
            支付总金额：{{(searchAll.orderPayMoneyTotal/100).toFixed(2)}}（元）；退款总金额：{{(searchAll.orderRefundMoneyTotal/100).toFixed(2)}}（元）；
            优惠券发放总金额：{{(searchAll.couponGetMoneyTotal/100).toFixed(2)}}（元）；优惠券使用总金额：{{(searchAll.couponUseMoneyTotal/100).toFixed(2)}}（元）；
            优惠券过期总金额：{{(searchAll.couponExpireMoneyTotal/100).toFixed(2)}}（元）；
          </p>
        </div>
      </div>
      <div v-else key="showDetail2">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item @click.native="resetForm()">返回上一级</el-breadcrumb-item>
          <el-breadcrumb-item>金额明细</el-breadcrumb-item>
        </el-breadcrumb>
        <template v-if="saleDetail">
          <div >
            <h4>一、支付/退款金额</h4>
            <span>支付订单数：{{saleDetail.orderPayNum}}笔</span>
            <span>支付金额：{{(saleDetail.orderPayMoney/100).toFixed(2)}}元</span>
            <span>退款金额：{{(saleDetail.orderRefundMoney/100).toFixed(2)}}元</span>
          </div>
          <div >
            <h4>二、优惠券金额</h4>
            <span>优惠券发放数量：{{saleDetail.couponGetNum}}张</span>
            <span>优惠券发放金额：{{(saleDetail.couponGetMoney/100).toFixed(2)}}元</span>
            <span>优惠券使用数量：{{saleDetail.couponUseNum}}张</span>
            <span>优惠券使用金额：{{(saleDetail.couponUseMoney/100).toFixed(2)}}元</span>
            <span>优惠券过期数量：{{saleDetail.couponExpireNum }}张</span>
            <span>优惠券过期金额：{{(saleDetail.couponExpireMoney/100).toFixed(2)}}元</span>
          </div>
          <div style="margin-bottom: 10px">
            <h4>三、金额明细表</h4>
            <el-input size="mini" :maxlength=20 v-model="ruleForm2.goodsName" style="width: 300px" placeholder="请输入订单号\商品名称\规格"></el-input>
            <el-button @click="salePage()" type="text" size="mini">搜索</el-button>
          </div>
          <el-table class="admin-table" border   max-height="400"   :data="tableDetail">
            <el-table-column align="center" prop="orderNum" label="订单号">
            </el-table-column>
            <el-table-column align="center" prop="name" label="商品名称">
            </el-table-column>
            <el-table-column align="center" prop="sku" label="规格">
            </el-table-column>
            <el-table-column
              align="center"
              :formatter="function(row) {
              return (row.money/100).toFixed(2)
            }"
              prop="money" label="商品价格">
            </el-table-column>
            <el-table-column
              align="center"
              :formatter="function(row) {
              return (row.couponMoney/100).toFixed(2)
            }"
              prop="couponMoney"
              label="优惠金额"></el-table-column>
            <el-table-column
              align="center"
              :formatter="function(row) {
              return (row.payMoney/100).toFixed(2)
            }"
              prop="payMoney"
              label="实付金额">
            </el-table-column>
            <el-table-column align="center" prop="status" label="状态">
              <template slot-scope="scope">
                {{orderStatus(scope.row.status)}}
              </template>
            </el-table-column>
          </el-table >
          <div class="block">
            <el-pagination
              background
              @current-change="handleCurrentChange(2)"
              :current-page.sync="currentPage2"
              :page-size="pageSize2"
              layout="prev,total, pager, next,jumper"
              :total="pageTotal2*1">
            </el-pagination>
          </div>
        </template>
      </div>
    </div>
</template>

<script>
export default {
  name: 'saleMoney',
  data () {
    return {
      showDetail: false,
      saleDetail: '',
      searchAll: '',
      ruleForm2: {
        fromTime: '',
        goodsName: ''
      },
      tableData: [],
      tableDetail: [],
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      currentPage2: 1,
      pageSize2: 20,
      pageTotal2: 0
    }
  },
  created () {
    this.pageData()
  },
  methods: {
    orderStatus (type) {
      var status = ['未支付', '已支付', '已到账', '已发货', '已完成', '已关闭', '退货/售后', '已退款']
      return +type > 0 ? status[+type] : '删除'
    },
    pageData () {
      var that = this
      var option = {
        pages: that.currentPage1,
        rows: that.pageSize
      }
      if (that.ruleForm2.fromTime) {
        option.startTime = that.ruleForm2.fromTime[0]
        option.endTime = that.ruleForm2.fromTime[1]
      }
      this.$axios({
        method: 'get',
        url: 'daily/getDailyDetailList.action',
        params: option
      }).then(function (res) {
        that.tableData = res.list.rows
        that.searchAll = res
        that.pageTotal = res.list.total
      })
    },
    handleClick (data) {
      var that = this
      this.$axios({
        method: 'get',
        url: 'daily/getDailyDetailDetail.action',
        params: {
          id: data.id
        }
      }).then(function (res) {
        that.saleDetail = res
        that.showDetail = true
        that.salePage()
      })
    },
    salePage () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'daily/getDailyDetailOrderList.action',
        params: {
          pages: that.currentPage2,
          id: that.saleDetail.id,
          queryString: that.ruleForm2.goodsName,
          rows: that.pageSize2
        }
      }).then(function (res) {
        that.tableDetail = res.rows
        that.pageTotal2 = res.total
      })
    },
    handleCurrentChange (type) {
      if (type === 2) {
        this.salePage()
        return
      }
      this.pageData()
    },
    resetForm () {
      this.showDetail = false
      this.currentPage2 = 1
      this.ruleForm2.goodsName = ''
      this.pageTotal2 = 0
    },
    submitForm () {
      this.currentPage1 = 1
      this.pageData()
    },
    downloadExcel () {
      window.location.href = '/admin/export.action?type=5'
    }
  }
}
</script>

<style scoped>

</style>
