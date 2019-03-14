<template>
  <div>
    <div>
      <el-form size="mini" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
        <el-form-item prop="time" label="有效期：">
          <el-date-picker
            v-model="ruleForm2.time"
            type="daterange"
            :editable="false"
            :clearable="false"
            :default-time="['00:00:00','23:59:59']"
            range-separator="至"
            value-format="timestamp"
            :picker-options="pickerOptions1"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="goodsName">
          <el-input @keyup.enter.native="submitForm()" :maxlength=20 v-model="ruleForm2.goodsName" style="width: 200px" placeholder="请输入使用范围"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  type="primary" @click="resetForm('ruleForm2')">重置</el-button>
          <el-button  type="primary" @click="submitForm()">搜索</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align: right;margin-bottom: 10px">
        <el-button v-if="$common.havePower(147)" @click="dialogFormVisible = true" type="primary" size="mini">新建优惠券</el-button>
      </div>
      <el-table  class="admin-table" border   max-height="400"   :data="tableData">
        <el-table-column prop="couponName"  align="center" label="名称">
        </el-table-column>
        <el-table-column  align="center" label="使用范围">
          <template slot-scope="scope">
            {{dataList.range[scope.row.type]}}
          </template>
        </el-table-column>
        <el-table-column  align="center" label="优惠力度">
          <template slot-scope="scope">
            <template v-if="isNaN(scope.row.availableMoney)">
              {{scope.row.availableMoney}}
            </template>
            <template v-else>满{{(scope.row.availableMoney/100).toFixed(2)}}元</template>
            减{{(scope.row.discount/100).toFixed(2)}}元
          </template>
        </el-table-column>
        <el-table-column  align="center"  label="有效期">
          <template slot-scope="scope">
            <template v-if="scope.row.validityTerm">{{isNaN(scope.row.validityTerm)?scope.row.validityTerm:'领取后'+scope.row.validityTerm+'天过期'}}</template>
            <template v-else>
              {{scope.row.useStartTime | dateFormat(1)}}至
              {{scope.row.userEndTime | dateFormat(1)}}
            </template>
          </template>
        </el-table-column>
        <el-table-column  align="center" prop="sendStock" label="发放数量（张）"></el-table-column>
        <el-table-column  align="center" prop="stock" label="剩余数量（张）"></el-table-column>
        <el-table-column align="center" prop="handle" label="操作">
          <template slot-scope="scope">
            <el-button  v-if="$common.havePower(148)" @click="controlClick(1,scope.row)" type="text" size="mini">删除</el-button>
            <el-button  v-if="$common.havePower(149)" @click="controlClick(2,scope.row)" type="text" size="mini">查看</el-button>
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
    <el-dialog :title="title" width="940px" :visible.sync="dialogFormVisible" @close="resetForm('creditForm')">
      <el-form :disabled="title==='查看优惠券'" label-position="top" size="mini" :inline="true" :model.sync="creditForm" :rules="creditRule" ref="creditForm">
        <el-form-item prop="range" label="一、名称及使用范围">
          <el-input :maxlength=10 style="width: 200px" v-model="creditForm.range.name" placeholder="请输入名称">
          </el-input>
          <el-radio v-model="creditForm.range.check" :label="0">新用户注册</el-radio>
          <el-radio v-model="creditForm.range.check" :label="1">新用户邀请</el-radio>
          <el-radio v-model="creditForm.range.check" :label="2">开店奖励</el-radio>
          <el-radio v-model="creditForm.range.check" :label="3">通用</el-radio>
        </el-form-item>
        <el-form-item prop="coupon" label="二、优惠力度">
          <el-radio v-model="creditForm.coupon.check" :label="1">消费满</el-radio>
          <el-input :maxlength=7 style="width: 200px" v-model="creditForm.coupon.text2Start">
            <span slot="suffix">元</span>
          </el-input>
          优惠
          <el-input :maxlength=7 style="width: 200px" v-model="creditForm.coupon.text2End" >
            <span slot="suffix">元</span>
          </el-input>
        </el-form-item>
        <el-form-item prop="time" label="三、有效期">
          <el-radio v-model="creditForm.time.check" :label="1">永久</el-radio>
          <el-radio v-model="creditForm.time.check" :label="2">有效期限</el-radio>
          <el-date-picker
            v-model="creditForm.time.text"
            type="daterange"
            :disabled="+creditForm.time.check!==2"
            :editable="false"
            :clearable="false"
            value-format="timestamp"
            :default-time="['00:00:00','23:59:59']"
            range-separator="至"
            :picker-options="pickerOptions1"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-radio v-model="creditForm.time.check" :label="3">领取后</el-radio>
          <el-input style="width: 200px"  :disabled="+creditForm.time.check!==3" v-model="creditForm.time.day" >
            <span slot="suffix">天</span>
          </el-input>
        </el-form-item>
        <el-form-item prop="total" label="四、发放数量">
          <el-radio v-model="creditForm.total.check" :label="1">不限</el-radio>
          <el-radio v-model="creditForm.total.check" :label="2">发送数量</el-radio>
          <el-input  :disabled="+creditForm.total.check!==2" :maxlength=10 style="width: 200px" v-model="creditForm.total.text" >
            <span slot="suffix">张</span>
          </el-input>
          <label>用户单次领取数量</label>
          <el-input :maxlength=10 style="width: 200px" v-model="creditForm.total.text1" >
            <span slot="suffix">张</span>
          </el-input>
        </el-form-item>
        <el-form-item prop="startTime" label="五、发放时间">
          <el-radio v-model="creditForm.startTime.check" :label="1">长期</el-radio>
          <el-radio v-model="creditForm.startTime.check" :label="2">时间</el-radio>
          <el-date-picker
            v-model="creditForm.startTime.text"
            type="daterange"
            :disabled="+creditForm.startTime.check!==2"
            :editable="false"
            :clearable="false"
            value-format="timestamp"
            :default-time="['00:00:00','23:59:59']"
            range-separator="至"
            :picker-options="pickerOptions1"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div v-if="title==='新建优惠券'" slot="footer" class="dialog-footer">
       <el-button size="small" @click="submitCredit('creditForm')"   type="primary">新建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'coupon-manage',
  components: {adminAddress},
  data () {
    var that = this
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      title: '新建优惠券',
      dataList: {
        range: ['注册', '邀请', '开店', '通用']
      },
      dialogFormVisible: false,
      creditForm: {
        range: {
          check: 1,
          name: ''
        },
        coupon: {
          check: 1,
          text2Start: '',
          text2End: ''
        },
        time: {
          check: 1,
          text: '',
          day: ''
        },
        total: {
          check: 1,
          text: '',
          text1: ''
        },
        startTime: {
          check: 1,
          text: ''
        }
      },
      creditRule: {
        range: [
          {type: 'object', required: true},
          {validator (rule, value, callback) {
            if (that.$common.isNull(value.name)) {
              return callback(new Error('请输入优惠券名称'))
            }
            callback()
          }
          }
        ],
        coupon: [
          {type: 'object', required: true},
          {validator (rule, value, callback) {
            if (that.$common.isNull(value.text2Start) || that.$common.isNull(value.text2End)) {
              return callback(new Error('请输入所选金额'))
            }
            if (!that.$common.numTo2(null, value.text2Start) || !that.$common.numTo2(null, value.text2End)) {
              return callback(new Error('最多保留两位小数'))
            }
            callback()
          }}
        ],
        time: [
          {type: 'object', required: true},
          {validator (rule, value, callback) {
            if (value.check === 2) {
              if (!value.text) {
                return callback(new Error('请选择时间'))
              }
            } else if (value.check === 3) {
              if (that.$common.isNull(value.day)) {
                return callback(new Error('请输入天数'))
              }
              if (!that.$common.integer(null, value.day)) {
                return callback(new Error('请输入整数'))
              }
            }
            callback()
          }}
        ],
        total: [
          {type: 'object', required: true},
          {validator (rule, value, callback) {
            if (value.check === 2) {
              if (that.$common.isNull(value.text)) {
                return callback(new Error('请输入数量'))
              }
              if (!that.$common.integer(null, value.text)) {
                return callback(new Error('请输入正整数'))
              }
            }
            if (that.$common.isNull(value.text1)) {
              return callback(new Error('请输入用户单次数量'))
            }
            if (!that.$common.integer(null, value.text1)) {
              return callback(new Error('请输入正整数'))
            }
            callback()
          }}
        ],
        startTime: [
          {type: 'object', required: true},
          {validator (rule, value, callback) {
            if (value.check === 2) {
              if (!value.text) {
                return callback(new Error('请选择时间'))
              }
            }
            callback()
          }
          }
        ]
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      tableData: [],
      ruleForm2: {
        time: '',
        goodsName: ''
      }
    }
  },
  created () {
    this.pageData()
  },
  methods: {
    pageData () {
      var that = this
      var option = {
        pages: that.currentPage1,
        queryString: that.ruleForm2.goodsName,
        rows: that.pageSize
      }
      if (that.ruleForm2.time && that.ruleForm2.time.length > 0) {
        option.startTime = that.ruleForm2.time[0]
        option.endTime = that.ruleForm2.time[1]
      }
      this.$axios({
        method: 'get',
        url: 'coupon/getCouponList.action',
        params: option
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    submitForm () {
      this.currentPage1 = 1
      this.pageData()
    },
    handleCurrentChange () {

    },
    submitCredit (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var option = {
            couponName: that.creditForm.range.name,
            type: that.creditForm.range.check,
            availableMoney: Math.round(that.creditForm.coupon.text2Start * 100),
            discount: Math.round(that.creditForm.coupon.text2End * 100),
            getNum: that.creditForm.total.text1
          }
          if (+that.creditForm.time.check === 2) {
            option.useStartTime = that.creditForm.time.text[0]
            option.useEndTime = that.creditForm.time.text[1]
          } else {
            option.validityTerm = +that.creditForm.time.check === 1 ? 36500 : that.creditForm.time.day
          }
          option.stockTotal = that.creditForm.total.check === 1 ? -1 : that.creditForm.total.text
          if (+that.creditForm.startTime.check === 2) {
            option.startTime = that.creditForm.startTime.text[0]
            option.endTime = that.creditForm.startTime.text[1]
          }
          that.$axios({
            method: 'post',
            url: 'coupon/addCoupon.action',
            data: option
          }).then(function (res) {
            that.$message.success('操作成功')
            that.currentPage1 = 1
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
          time: '',
          goodsName: ''
        }
      } else {
        this.title = '新建优惠券'
        this.creditForm = {
          range: {
            check: 1
          },
          coupon: {
            check: 1,
            text2Start: '',
            text2End: ''
          },
          time: {
            check: 1,
            text: '',
            day: ''
          },
          total: {
            check: 1,
            text: '',
            text1: ''
          },
          startTime: {
            check: 1,
            text: ''
          }
        }
      }
      this.$refs[formName].resetFields()
    },
    controlClick (type, data) {
      var that = this
      if (type === 1) {
        this.$confirm('删除后该优惠券不会继续发放，已发送的优惠券仍可继续使用。', '优惠券删除确定', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'coupon/delCoupon.action',
            data: {
              couponId: data.couponId
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.pageData()
          })
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        that.$axios({
          method: 'get',
          url: 'coupon/getCoupon.action',
          params: {
            couponId: data.couponId
          }
        }).then(function (res) {
          var json = {
            range: {
              check: res.type,
              name: res.name
            },
            coupon: {
              check: 1,
              text2Start: (res.avaiableMoney / 100).toFixed(2),
              text2End: (res.discount / 100).toFixed(2)
            },
            time: {
              check: 1,
              text: '',
              day: ''
            },
            total: {
              check: 1,
              text: '',
              text1: res.getNum
            },
            startTime: {
              check: 1,
              text: ''
            }
          }
          if (res.useStartTime) {
            json.time.check = 2
            json.time.text = [res.useStartTime, res.useStartTime + res.validityTerm * 24 * 60 * 60 * 1000]
          } else {
            if (+res.validityTerm !== 36500) {
              json.time.check = 3
              json.day = res.validityTerm
            }
          }
          if (+res.stockTotal !== -1) {
            json.total.check = 2
            json.total.text = res.stockTotal
          }
          if (res.startTime) {
            json.startTime.check = 2
            json.startTime.text = [res.startTime, res.endTime]
          }
          that.creditForm = json
          that.title = '查看优惠券'
          that.dialogFormVisible = true
        })
      }
    }
  }
}
</script>

<style scoped>
</style>
