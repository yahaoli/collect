<template>
  <div>
    <div v-show="!showDetail" key="showDetail1">
      <div class="el-form el-form--inline">
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-input size="small" @keyup.enter.native="formSearch()" :maxlength=20 v-model="ruleForm2.name" placeholder="请输入姓名/手机号/身份证号"></el-input>
          </div>
        </div>
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-button size="small"  type="primary" @click="ruleForm2.name=''">重置</el-button>
            <el-button size="small"  type="primary" @click="formSearch()">搜索</el-button>
          </div>
        </div>
      </div>
      <p v-if="$common.havePower(83)" style="text-align: right;margin-bottom: 10px">  <el-button size="small" @click="downloadExcel()"  type="primary">导出excel</el-button></p>
      <el-table  class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column align="center" prop="mobile" label="手机号"></el-table-column>
          <el-table-column align="center" label="姓名/身份证号">
            <template slot-scope="scope">
              {{scope.row.name}}
              <br>
              {{scope.row.idCard}}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="loanChange"
            label="还款金额（元）"
            :formatter="function (row) {return (row.loanChange / 100).toFixed(2)}" >
          </el-table-column>
          <el-table-column align="center"  label="还款账号">
            <template slot-scope="scope">
              账号：{{scope.row.repaymentBankAccount}}
              <br>
              开户行：{{scope.row.repaymentBankName}}
              <br>
              姓名：{{scope.row.repaymentBankUser}}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="moneyChange"
            label="货款金额（元）"
            :formatter="function (row) {return (row.moneyChange / 100).toFixed(2)}">

          </el-table-column>
          <el-table-column align="center"  label="打款账号">
            <template slot-scope="scope">
              账号：{{scope.row.bankAccount}}
              <br>
              开户行：{{scope.row.bankName}}
              <br>
              姓名：{{scope.row.bankUser}}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(82)" @click="controlClick(scope.row,1)" type="text" size="mini">查看</el-button>
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
    <div v-if="showDetail&&loanInfo" key="showDetail2">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click.native="resetForm()">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>查看详情</el-breadcrumb-item>
      </el-breadcrumb>
      <p class="admin-p">
        姓名：{{loanInfo.name}}
        身份证号：{{loanInfo.idCard}}
        手机号：{{loanInfo.mobile}}
      </p>
      <p class="admin-p">
        货款金额：{{(loanInfo.moneyChange/ 100).toFixed(2)}}元
        打款账号：{{loanInfo.bankAccount}}
        开户行：{{loanInfo.bankName}}
        户名：{{loanInfo.bankUser}}
      </p>
      <p class="admin-p">
        还款金额：{{(loanInfo.loanChange/ 100).toFixed(2)}}元
        还款账号：{{loanInfo.repaymentBankAccount}}
        开户行：{{loanInfo.repaymentBankName}}
        户名：{{loanInfo.repaymentBankUser}}
      </p>
      <h4>历史打款明细</h4>
      <el-table  class="admin-table" border   max-height="400"   :data="tableHistory">
        <el-table-column align="center" prop="mobile" label="手机号"></el-table-column>
        <el-table-column align="center" label="姓名/身份证号">
          <template slot-scope="scope">
            {{scope.row.name}}
            <br>
            {{scope.row.idCard}}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="loanChange"
          label="还款金额（元）"
          :formatter="function (row) {return (row.loanChange / 100).toFixed(2)}" >
        </el-table-column>
        <el-table-column align="center"  label="还款账号">
          <template slot-scope="scope">
            账号：{{scope.row.repaymentBankAccount}}
            <br>
            开户行：{{scope.row.repaymentBankName}}
            <br>
            户名：{{scope.row.repaymentBankUser}}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="moneyChange"
          label="货款金额（元）"
          :formatter="function (row) {return (row.moneyChange / 100).toFixed(2)}" >
        </el-table-column>
        <el-table-column align="center"  label="打款账号">
          <template slot-scope="scope">
            账号：{{scope.row.bankAccount}}
            <br>
            开户行：{{scope.row.bankName}}
            <br>
            户名：{{scope.row.bankUser}}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="time" label="打款时间">
          <template v-if="scope.row.uploadTime" slot-scope="scope">
            {{scope.row.uploadTime | dateFormat(1)}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click="controlClick(scope.row,2)" type="text" size="mini">销售明细</el-button>
            <el-button @click="controlClick(scope.row,3)" type="text" size="mini">打款凭证</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          background
          @current-change="handleCurrentChange(2)"
          :current-page.sync="currentPage2"
          :page-size="pageSize2"
          layout="slot,prev,total, pager, next,jumper"
          :total="pageTotal2">
        </el-pagination>
      </div>
      <div style="text-align: right">
        <el-button size="small" type="primary" @click="credit1dialog=true">上传打款凭证</el-button>
      </div>
    </div>
    <el-dialog title="打款凭证"  width="500px" :visible.sync="credit3dialog">
      <div class="block">
        <el-carousel trigger="click" height="150px">
          <el-carousel-item :label="item.name" v-for="(item,index) in loanImg" :key="index">
            <img :src="item.url" alt="">
          </el-carousel-item>
        </el-carousel>
      </div>
    </el-dialog>
    <el-dialog title="销售明细"  width="500px" :visible.sync="credit2dialog">
      <el-table  class="admin-table" border   max-height="200"   :data="saleInfo.goodsOrders">
        <el-table-column align="center" prop="name" label="商品名称"></el-table-column>
       <!-- <el-table-column align="center" prop="goodsSize" label="规格"></el-table-column>-->
        <el-table-column
          align="center"
          prop="pricePurchase"
          label="零售价"
          :formatter="function (row) {return (row.pricePurchase / 100).toFixed(2)}" >
        </el-table-column>
        <el-table-column align="center" prop="overTime" label="交易时间">
          <template slot-scope="scope">
            {{scope.row.overTime | dateFormat(1)}}
          </template>
        </el-table-column>
        <!--<el-table-column align="center" prop="way" label="货款用途"></el-table-column>-->
      </el-table>
      <div style="height: 40px">

      </div>
    </el-dialog>
    <el-dialog title="上传打款凭证"  width="500px" :visible.sync="credit1dialog" @close="resetForm('creditForm')">
      <el-form size="mini"  :model.sync="creditForm" :rules="creditRule" ref="creditForm" status-icon>
          <el-form-item prop="giveFile" label="还款凭证：">
            <el-upload
              action="admin/pic/upload.action"
              name="uploadFile"
              :file-list="creditForm.giveFile"
              :before-upload="$common.beforeImg"
              :limit="1"
              :on-exceed="$common.imgLimit"
              :on-preview="handlePreview"
              :on-remove="handleRemove(2,'giveFile')"
              :before-remove="handleRemove(1,'giveFile')"
              :on-error="$common.imgError"
              list-type="picture"
              :on-success="imgOK('giveFile')">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        <br>
          <el-form-item prop="goodsFile" label="货款凭证：">
            <el-upload
              action="admin/pic/upload.action"
              name="uploadFile"
              :file-list="creditForm.goodsFile"
              :before-upload="$common.beforeImg"
              :limit="1"
              :on-exceed="$common.imgLimit"
              :on-preview="handlePreview"
              :on-remove="handleRemove(2,'goodsFile')"
              :before-remove="handleRemove(1,'goodsFile')"
              :on-error="$common.imgError"
              list-type="picture"
              :on-success="imgOK('goodsFile')">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        <el-form-item prop="time" label="结算时间：">
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
        <div slot="footer" class="dialog-footer">
          <el-button @click="submitCredit('creditForm')">确认</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'loan-month',
  components: {adminAddress},
  data () {
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      loanImg: [],
      credit1dialog: false,
      credit2dialog: false,
      credit3dialog: false,
      showDetail: false,
      loanInfo: '',
      creditForm: {
        giveFile: [],
        goodsFile: [],
        time: ''
      },
      creditRule: {
        giveFile: [
          {required: true, message: '请上传还款凭证'}
        ],
        goodsFile: [
          {required: true, message: '请上传货款凭证'}
        ],
        time: [
          {required: true, message: '请选择结算时间'}
        ]
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      currentPage2: 1,
      pageSize2: 20,
      pageTotal2: 0,
      tableData: [],
      tableHistory: [],
      saleInfo: '',
      ruleForm2: {
        name: ''
      }
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
    pageData () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'money/getMonthDetailList.action',
        params: {
          pages: that.currentPage1,
          rows: that.pageSize,
          queryString: that.ruleForm2.name
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    submitForm () {
      console.log()
    },
    handleCurrentChange () {

    },
    submitCredit (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.$axios({
            method: 'post',
            url: 'money/updateByUploadImgs.action',
            data: {
              Id: that.loanInfo.id,
              loanImg: that.creditForm.giveFile[0].url,
              moneyImg: that.creditForm.goodsFile[0].url,
              uploadTime: that.creditForm.time
            }
          }).then(function (res) {
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
      if (formName) {
        this.creditForm = {
          giveFile: [],
          goodsFile: [],
          time: ''
        }
        this.$refs[formName].resetFields()
        return
      }
      this.showDetail = false
      this.loanInfo = ''
      this.loanImg = []
      this.currentPage2 = 1
      this.pageTotal2 = 0
    },
    historyList () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'money/getHistoryMonthDetailList.action',
        params: {
          adminId: that.loanInfo.adminId,
          pages: that.currentPage2,
          rows: that.pageSize2
        }
      }).then(function (res) {
        that.tableHistory = res.rows
        that.pageTotal2 = res.total
      })
    },
    controlClick (data, type) {
      var that = this
      if (type === 1) {
        this.$axios({
          method: 'get',
          url: 'money/getMonthDetail.action',
          params: {
            id: data.id
          }
        }).then(function (res) {
          that.loanInfo = res
          that.showDetail = true
          that.historyList()
        })
      } else if (type === 2) {
        this.$axios({
          method: 'get',
          url: 'money/getSalesDetailList.action',
          params: {
            id: data.id
          }
        }).then(function (res) {
          that.saleInfo = res
          that.credit2dialog = true
        })
      } else {
        this.loanImg = [
          {url: data.loanImg, name: '还款凭证'},
          {url: data.moneyImg, name: '贷款凭证'}
        ]
        this.credit3dialog = true
      }
    },
    handlePreview (file, fileList) {
      this.$emit('openImg', file.url)
    },
    handleRemove (type, data) {
      var that = this
      if (type === 1) {
        return (file, fileList) => {
          if (!that.creditForm[data].length) {
            return true
          }
          return this.$confirm(`确定移除此图片吗？`)
        }
      } else {
        return (file, fileList) => {
          that.creditForm[data] = []
        }
      }
    },
    imgOK (a) {
      return (response, file, fileList) => {
        if (!this.$common.imgRes(response)) {
          fileList.pop()
          return
        }
        this.creditForm[a].push(
          {
            name: '凭证',
            url: response.data.url
          }
        )
      }
    },
    downloadExcel () {
      window.location.href = '/admin/export.action?type=3'
    }
  }
}
</script>

<style scoped>
</style>
