<template>
  <div>
    <div class="el-form el-form--inline">
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-input size="small" @keyup.enter.native="submitForm()"  :maxlength=20 v-model="ruleForm2.news" placeholder="请输入通知信息"></el-input>
        </div>
      </div>
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-button size="small"  type="primary" @click="ruleForm2.news=''">重置</el-button>
          <el-button size="small"  type="primary" @click="submitForm()">搜索</el-button>
        </div>
      </div>
    </div>
    <div style="text-align: right;margin-bottom: 10px">
      <el-button v-if="$common.havePower(138)" @click="dialogFormVisible = true" type="primary" size="mini">新建通知</el-button>
    </div>
    <el-table  class="admin-table" border   max-height="400"   :data="tableData">
      <el-table-column v-for="item in tableHead" :formatter="item.formatter" :key="item.name" align="center" :prop="item.name" :label="item.value"></el-table-column>
      <el-table-column align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(139)" @click="controlClick(2,scope.row)" type="text" size="mini">查看</el-button>
          <el-button v-if="$common.havePower(140)" @click="controlClick(3,scope.row)" type="text" size="mini">修改</el-button>
          <el-button v-if="$common.havePower(141)" @click="controlClick(1,scope.row)" type="text" size="mini">删除</el-button>
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
    <el-dialog :title="controlType.title" width="540px" :visible.sync="dialogFormVisible" @close="resetForm('newsForm')">
      <el-form :disabled="!controlType.btn" label-position="top" size="mini" :inline="true" :model.sync="newsForm" :rules="newsRule" ref="newsForm" status-icon>
        <el-form-item prop="title" label="一、系统通知标题">
          <el-input placeholder="请输入系统通知标题"  :maxlength=20 v-model="newsForm.title" >
          </el-input>
        </el-form-item>
        <el-form-item prop="content" label="二、系统通知内容">
          <el-input
            :maxlength=200
            style="width: 500px"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6}"
            placeholder="请输入处理结果"
            v-model="newsForm.content">
          </el-input>
        </el-form-item>
        <el-form-item prop="time" label="三、发送时间设置">
          <el-date-picker
            v-model="newsForm.time"
            type="datetime"
            :editable="false"
            :clearable="false"
            :picker-options="pickerOptions1"
            value-format="timestamp"
            placeholder="选择日期"
            >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="controlType.btn" size="small" @click="submitNews('newsForm')" type="primary">{{controlType.btn}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'news-manage',
  data () {
    var that = this
    return {
      controlType: {
        title: '新建通知',
        btn: '确认'
      },
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      ruleForm2: {
        news: ''
      },
      dialogFormVisible: false,
      tableHead: [
        {name: 'name', value: '通知标题'},
        {name: 'model', value: '通知详情'},
        {name: 'sendTime',
          value: '定时发送',
          formatter: function (row) {
            return that.$options.filters['dateFormat'](row.sendTime, 2)
          }}
      ],
      tableData: [],
      newsRule: {
        title: [
          {type: 'string', required: true, message: '请输入系统通知标题'}
        ],
        content: [
          {type: 'string', required: true, message: '请输入系统通知内容'}
        ],
        time: [
          {required: true, message: '请选择发送时间'}
        ]
      },
      newsForm: {
        title: '',
        content: '',
        time: ''
      },
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0
    }
  },
  created () {
    this.pageData()
  },
  methods: {
    pageData () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'notice/getNoticeList.action',
        params: {
          pages: that.currentPage1,
          rows: that.pageSize,
          keywords: that.ruleForm2.news
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
    resetForm (formName) {
      this.newsForm = {
        title: '',
        content: '',
        time: ''
      }
      this.controlType = {
        title: '新建通知',
        btn: '确认'
      }
      this.$refs[formName].resetFields()
    },
    handleCurrentChange () {
      this.pageData()
    },
    submitNews (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (that.controlType.title === '新建通知') {
            that.$axios({
              method: 'post',
              url: 'notice/addNotice.action',
              data: {
                modelName: that.newsForm.title,
                model: that.newsForm.content,
                sendTime: that.newsForm.time
              }
            }).then(function (res) {
              that.$message.success('操作成功')
              that.dialogFormVisible = false
              that.currentPage1 = 1
              that.pageData()
            })
          } else {
            that.$axios({
              method: 'post',
              url: 'notice/updateNotice.action',
              data: {
                modelId: that.newsForm.id,
                modelName: that.newsForm.title,
                model: that.newsForm.content,
                sendTime: that.newsForm.time
              }
            }).then(function (res) {
              that.$message.success('操作成功')
              that.dialogFormVisible = false
              that.pageData()
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    controlClick (type, data) {
      var that = this
      if (type === 1) {
        this.$confirm('是否确认删除通知标题，删除后将不可恢复。', '通知删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'notice/delNotice.action',
            data: {
              modelId: data.id
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.pageData()
          })
        }).catch(() => {
        })
      } else {
        that.$axios({
          method: 'get',
          url: 'notice/getNotice.action',
          params: {
            modelId: data.id
          }
        }).then(function (res) {
          that.newsForm = {
            id: data.id,
            title: res.name,
            content: res.model,
            time: res.sendTime
          }
          if (type === 2) {
            that.controlType = {
              title: '查看通知',
              btn: ''
            }
          } else {
            that.controlType = {
              title: '修改通知',
              btn: '修改'
            }
          }
          that.dialogFormVisible = true
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
