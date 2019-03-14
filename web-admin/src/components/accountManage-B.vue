<template>
  <div>
    <div v-if="!showDetail" key="showDetail1">
      <div class="el-form el-form--inline">
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-input @keyup.enter.native="formSearch()" size="small" :maxlength=20 v-model="ruleForm2.account"
                      placeholder="请输入手机号/身份证/姓名"></el-input>
          </div>
        </div>
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-button size="small" type="primary" @click="ruleForm2.account=''">重置</el-button>
            <el-button size="small" type="primary" @click="formSearch()">搜索</el-button>
          </div>
        </div>
      </div>
      <el-table ref="multipleTable" class="admin-table" border max-height="400" :data="tableData">
        <el-table-column align="center" prop="mobile" label="手机号"></el-table-column>
        <el-table-column align="center" prop="name" label="姓名/身份证">
          <template slot-scope="scope">
            <p>{{scope.row.name}}</p>
            <p>({{scope.row.idCard}})</p>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="creditSurplus" :formatter="function(row) {
              return (row.creditSurplus/100).toFixed(2)
            }" label="当前授信额度（元）"></el-table-column>
        <el-table-column align="center" prop="onSalesNum" label="当前上架数量（件）"></el-table-column>
        <el-table-column align="center" prop="salesMoney" :formatter="function(row) {
              return (row.salesMoney/100).toFixed(2)
            }" label="销售总金额（元）"></el-table-column>
        <el-table-column align="center" prop="refundMoney" :formatter="function(row) {
              return (row.refundMoney/100).toFixed(2)
            }" label="退款总金额（元）"></el-table-column>
        <el-table-column align="center" prop="handle" label="操作">
          <template slot-scope="scope">
            <el-button v-if="$common.havePower(160)" @click="handleClick(scope.row,1)" type="text" size="mini">查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          @current-change="pageData()"
          :current-page.sync="currentPage1"
          :page-size="pageSize"
          layout="slot,prev,total, pager, next,jumper"
          :total="pageTotal">
        </el-pagination>
      </div>
    </div>
    <div v-else key="showDetail2">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click.native="showDetail=false">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>金额明细</el-breadcrumb-item>
      </el-breadcrumb>
      <template v-if="saleDetail">
        <div>
          <h4>一、用户基本信息</h4>
          <span>手机号：{{saleDetail.mobile}}</span>
          <span>姓名：{{saleDetail.name}}</span>
          <span>身份证号：{{saleDetail.idCard}}</span>
          <span>联系电话：{{saleDetail.applyMobile}}</span>
        </div>
        <div>
          <h4>二、当前授信信息</h4>
          <span>当前授信额度：{{(saleDetail.creditSurplus/100).toFixed(2)}}元</span>
          <span>当前已用授信额度：{{(saleDetail.creditUsed/100).toFixed(2)}}元</span>
        </div>
        <div>
          <h4>三、店铺商品信息</h4>
          <span>当前上架商品（总数）：{{saleDetail.onSalesNum}}件</span>
          <span>当前上架商品（合卖）：{{saleDetail.onSalesSubscriptionNum}}件</span>
          <span>当前上架商品（常规）：{{saleDetail.onSalesNormalNum}}件</span>
          <span>参与合卖次数：{{saleDetail.subscriptionNum}}次</span>
          <span>分享成交量：{{saleDetail.shareOrderBuyNum}}笔</span>
          <span>店铺购买量：{{saleDetail.orderBuyNum}}笔</span>
        </div>
        <div>
          <h4>四、销售信息</h4>
          <span>销售总金额：{{(saleDetail.salesMoney/100).toFixed(2)}}元</span>
          <span>近30天销售金额：{{(saleDetail.salesMoneyIn30Day/100).toFixed(2)}}元</span>
          <span>近60天销售金额：{{(saleDetail.salesMoneyIn60Day/100).toFixed(2)}}元</span>
          <span>近90天销售金额：{{(saleDetail.salesMoneyIn90Day/100).toFixed(2)}}元</span>
          <span>30天平均增长率：{{saleDetail.increaseAvg}}%</span>
          <p>
            <el-button @click="getDetail()" size="small" type="primary">查看销售明细</el-button>
          </p>
          <template v-if="saleDetail.goodsOverstockUserCustoms.length">
            <p>买断信息：</p>
            <template>
              <el-table class="admin-table" border max-height="400" :data="saleDetail.goodsOverstockUserCustoms">
                <el-table-column align="center" prop="name" label="商品名称"></el-table-column>
                <el-table-column align="center" prop="stockTotal" label="买断数量"></el-table-column>
                <el-table-column align="center" prop="stock" label="剩余买断数量"></el-table-column>
                <el-table-column align="center" prop="price" :formatter="function(row) {
              return (row.price/100).toFixed(2)
            }" label="买断单价（元）"></el-table-column>
                <el-table-column align="center" prop="priceTotal" :formatter="function(row) {
              return (row.priceTotal/100).toFixed(2)
            }" label="买断合计（元）"></el-table-column>
                <el-table-column align="center" prop="priceUnsales" :formatter="function(row) {
              return (row.priceUnsales/100).toFixed(2)
            }" label="未销售金额（元）"></el-table-column>
                <el-table-column align="center" prop="shareNum" label="分享次数"></el-table-column>
                <el-table-column align="center" prop="handle" label="操作">
                  <template  slot-scope="scope">
                    <el-button v-if="$common.havePower(160)&&+scope.row.status===2" @click="goodsRefund(scope.row)" type="text" size="mini">
                      确认退款{{scope.row.status}}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </template>
        </div>
        <div style="margin-bottom: 10px">
          <h4>五、退款信息</h4>
          <span>退款总金额：{{(saleDetail.refundMoney/100).toFixed(2)}}元</span>
          <span>近30天退款金额：{{(saleDetail.refundMoneyIn30Day/100).toFixed(2)}}元</span>
          <span>近30天退款订单数：{{saleDetail.refundNumIn30Day}}笔</span>
          <span>近60天退款金额：{{(saleDetail.refundMoneyIn60Day/100).toFixed(2)}}元</span>
          <span>近60天退款订单数：{{saleDetail.refundNumIn60Day}}笔</span>
          <span>近90天退款金额：{{(saleDetail.refundMoneyIn90Day/100).toFixed(2)}}元</span>
          <span>近90天退款订单数：{{saleDetail.refundNumIn90Day}}笔</span>
        </div>
        <div style="margin-bottom: 10px">
          <h4>六、提现信息</h4>
          <span>提现总金额：{{(saleDetail.accumulativeMoney/100).toFixed(2)}}元</span>
          <span>提现次数：{{saleDetail.userWithdrawalsNum}}元</span>
          <span>最近提现时间：{{saleDetail.userWithdrawalsLastTime}}元</span>
          <span>最近提现金额：{{(saleDetail.userWithdrawalsLastMoney/100).toFixed(2)}}元</span>
        </div>
      </template>
    </div>
    <el-dialog title="销售明细" width="700px" :visible.sync="dialogFormVisible">
      <el-table class="admin-table" border max-height="400" :data="tableSale">
        <el-table-column align="center" prop="orderNum" label="订单号"></el-table-column>
        <el-table-column align="center" prop="name" label="商品名称"></el-table-column>
        <el-table-column align="center" prop="category" label="商品性质"></el-table-column>
        <el-table-column
          align="center"
          :formatter="function(row) {
              return (row.priceSales/100).toFixed(2)
            }"
          prop="priceSales" label="销售价（元）">
        </el-table-column>
        <el-table-column
          align="center"
          :formatter="function(row) {
              return (row.rebate/100).toFixed(2)
            }"
          prop="rebate"
          label="分红金额（元）"></el-table-column>
        <el-table-column align="center" prop="orderSrc" label="成交方式">
          <template slot-scope="scope">
            {{commonData.orderWay[scope.row.orderSrc]}}
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          @current-change="getDetail()"
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
export default {
  name: 'accountManage-B',
  data () {
    return {
      ruleForm2: {
        account: ''
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      currentPage2: 1,
      commonData: {
        orderWay: ['分享成交', '店铺购买']
      },
      pageSize2: 20,
      pageTotal2: 0,
      showDetail: false,
      dialogFormVisible: false,
      searchAll: '',
      saleDetail: '',
      tableData: [],
      tableSale: []
    }
  },
  created () {
    this.pageData()
  },
  methods: {
    formSearch () {
      this.currentPage1 = 1
      this.pageData()
    },
    goodsRefund (data) {
      var that = this
      this.$axios({
        method: 'post',
        url: 'userShop/updateGoodsOverstockUserByRefund.action',
        data: {
          id: data.id
        }
      }).then(function (res) {
        that.$message.success('操作成功')
        that.handleClick({userId: that.saleDetail.userId})
      })
    },
    pageData () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'userShop/getUserShopList.action',
        params: {
          pages: that.currentPage1,
          rows: that.pageSize,
          queryString: that.ruleForm2.account
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    handleClick (data) {
      var that = this
      this.$axios({
        method: 'get',
        url: 'userShop/getUserShopDetail.action',
        params: {
          userId: data.userId
        }
      }).then(function (res) {
        that.saleDetail = res
        that.showDetail = true
      })
    },
    getDetail () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'userShop/getUserShopDetailOrderList.action',
        params: {
          pages: that.currentPage2,
          rows: that.pageSize2,
          userId: that.saleDetail.userId
        }
      }).then(function (res) {
        that.tableSale = res.rows
        that.pageTotal2 = res.total
        that.dialogFormVisible = true
      })
    }
  }
}
</script>

<style scoped>

</style>
