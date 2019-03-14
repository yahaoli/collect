<template>
  <div>
    <div v-show="!showDetail" key="showDetail1">
      <el-form size="small" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
        <el-form-item prop="name" label="处理人：">
          <el-select v-model="ruleForm2.name">
            <el-option v-for="item in dataList.status" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="time" label="反馈时间：">
          <el-date-picker
            v-model="ruleForm2.time"
            type="daterange"
            :editable="false"
            :clearable="false"
            range-separator="至"
            :picker-options="pickerOptions1"
            value-format="timestamp"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="goodsName">
          <el-input @keyup.enter.native="formSearch()" :maxlength=20 v-model="ruleForm2.goodsName" style="width: 200px" placeholder="请输入客户名/手机号/问题描述"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  type="primary" @click="resetForm('ruleForm2')">重置</el-button>
          <el-button  type="primary" @click="formSearch()">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item) in dataList.tabList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        >
        </el-tab-pane>
      </el-tabs>
      <el-table  class="admin-table" border   max-height="400"   :data="tableData">
        <el-table-column v-for="item in tableHead[activeName]" :formatter="item.formatter" :key="item.name" align="center" :prop="item.name" :label="item.value"></el-table-column>
        <el-table-column align="center" prop="handle" label="操作">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row,1)" type="text" size="mini">查看</el-button>
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
    <div v-if="showDetail" key="showDetail2">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click.native="showDetail=false">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>查看详情</el-breadcrumb-item>
      </el-breadcrumb>
      <h4>一、客户信息</h4>
      <p class="admin-p">
        姓名：{{customerInfo.name}}
        手机号：{{customerInfo.mobile}}
        性别：{{customerInfo.sex}}
      </p>
      <h4>二、反馈信息</h4>
      <p class="admin-p">
        反馈时间：{{customerInfo.time | dateFormat(2)}}
        问题描述：{{customerInfo.content}}
      </p>
      <h4>三、客服处理</h4>
      <el-form size="small" :inline="true" :model.sync="creditForm" :rules="creditRule" ref="creditForm" status-icon>
        <el-form-item prop="text">
          <el-input
            :maxlength=200
            style="width: 500px"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6}"
            placeholder="请输入处理结果"
            v-model="creditForm.text">
          </el-input>
        </el-form-item>
      </el-form>
      <template v-if="activeName==='credit2'">
        <h4>四、处理人</h4>
        <p class="admin-p">
          处理人：{{customerInfo.adminName}}
          处理周期：{{customerInfo.resolveTime}}
        </p>
      </template>
      <p v-show="activeName==='credit1'" @click="submitForm()" style="text-align: right;margin-bottom: 10px">  <el-button size="small" @click="submitCredit('creditForm')"   type="primary">确认</el-button></p>
    </div>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'customer',
  components: {adminAddress},
  data () {
    var that = this
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() >= Date.now()
        }
      },
      showDetail: false,
      dataList: {
        tabList: [
          {
            label: '未处理',
            name: 'credit1'
          },
          {
            label: '已处理',
            name: 'credit2'
          }
        ],
        status: []
      },
      activeName: 'credit1',
      customerInfo: '',
      creditForm: {
        text: ''
      },
      creditRule: {
        text: [
          {required: true, message: '请输入处理结果'}
        ]
      },
      tableHead: {
        credit1: [
          {name: 'time',
            value: '反馈时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.time, 2)
            }},
          {name: 'name', value: '姓名'},
          {name: 'sex', value: '性别'},
          {name: 'mobile', value: '手机号'},
          {name: 'content', value: '问题描述'}
        ],
        credit2: [
          {name: 'time',
            value: '反馈时间',
            formatter: function (row) {
              return that.$options.filters['dateFormat'](row.time, 2)
            }},
          {name: 'name', value: '姓名'},
          {name: 'sex', value: '性别'},
          {name: 'mobile', value: '手机号'},
          {name: 'content', value: '问题描述'},
          {name: 'resolveTime', value: '处理周期（小时）'}
        ]
      },
      tableData: [],
      ruleForm2: {
        name: '',
        time: '',
        goodsName: ''
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0
    }
  },
  created () {
    this.pageData()
    var that = this
    this.$axios({
      method: 'get',
      url: 'customer/getFeedbackAdminList.action'
    }).then(function (res) {
      that.dataList.status = res
    })
  },
  methods: {
    formSearch () {
      this.currentPage1 = 1
      this.pageData()
    },
    pageData () {
      var that = this
      that.tableData = []
      var type = that.activeName === 'credit1' ? 0 : 1
      var option = {
        pages: that.currentPage1,
        rows: that.pageSize,
        adminId: that.ruleForm2.name,
        type: type,
        keywords: that.ruleForm2.goodsName
      }
      if (that.ruleForm2.time) {
        option.startTime = that.ruleForm2.time[0]
        option.endTime = that.ruleForm2.time[1]
      }
      this.$axios({
        method: 'post',
        url: 'customer/getFeebackListUnSolved.action',
        data: option
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    submitForm () {
      var that = this
      var type = that.activeName === 'credit1' ? 0 : 1
      this.$axios({
        method: 'post',
        url: 'customer/getFeedbackDetail.action',
        data: {
          id: that.creditForm.id,
          reason: that.creditForm.text,
          adminId: sessionStorage.getItem('userId'),
          type: type
        }
      }).then(function (res) {
        that.showDetail = false
        that.pageData()
      })
    },
    handleClick (data) {
      var that = this
      var type = that.activeName === 'credit1' ? 0 : 1
      this.$axios({
        method: 'post',
        url: 'customer/getFeedbackDetail.action',
        data: {
          id: data.id,
          type: type
        }
      }).then(function (res) {
        that.customerInfo = res
        that.creditForm.text = res.reason || ''
        that.creditForm.id = data.id
        that.showDetail = true
      })
    },
    tabClick (tab) {
      this.pageData()
    },
    handleCurrentChange () {
      this.pageData()
    },
    submitCredit (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      if (formName === 'ruleForm2') {
        this.ruleForm2 = {
          name: '',
          time: '',
          goodsName: ''
        }
        return
      }
      this.$refs[formName].resetFields()
    },
    controlClick () {
      this.showDetail = true
    }
  }
}
</script>

<style scoped>
</style>
