<template>
  <div>
    <div style="text-align: right;margin-bottom: 10px">
      <el-button v-if="$common.havePower(89)" @click="dialogFormVisible = true" type="primary" size="mini">新建服务项</el-button>
    </div>
    <el-table  class="admin-table" border   max-height="400"   :data="tableData">
      <el-table-column v-for="item in tableHead" :key="item.name" align="center" :prop="item.name" :label="item.value"></el-table-column>
      <el-table-column align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status*1===0&&$common.havePower(125)" @click="controlClick(1,scope.row)"  type="text" size="mini">启用</el-button>
          <el-button v-if="scope.row.status*1===1&&$common.havePower(86)" @click="controlClick(2,scope.row)"  type="text" size="mini">禁用</el-button>
          <el-button v-if="$common.havePower(87)" @click="controlClick(3,scope.row)"  type="text" size="mini">修改</el-button>
          <el-button v-if="$common.havePower(88)" @click="controlClick(4,scope.row)"  type="text" size="mini">删除</el-button>
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
      <el-form  size="mini" :inline="true" :model.sync="newsForm" :rules="newsRule" ref="newsForm" status-icon>
        <el-form-item prop="title" label="服务名称：">
          <el-input placeholder="请输入服务名称"  :maxlength=20 v-model="newsForm.title" >
          </el-input>
        </el-form-item>
        <el-form-item prop="content" label="服务内容：">
          <el-input
            :maxlength=50
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入服务内容"
            v-model="newsForm.content">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="submitNews('newsForm')" type="primary">{{controlType.btn}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'service-manage',
  data () {
    return {
      controlType: {
        title: '新建服务项',
        btn: '新增'
      },
      dialogFormVisible: false,
      tableHead: [
        {name: 'name', value: '服务名称'},
        {name: 'detail', value: '服务内容'}
      ],
      tableData: [],
      newsRule: {
        title: [
          {type: 'string', required: true, message: '请输入服务名称'}
        ],
        content: [
          {type: 'string', required: true, message: '请输入服务内容'}
        ]
      },
      newsForm: {
        title: '',
        content: ''
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
        url: 'system/getServicManagementList.action',
        params: {
          pages: that.currentPage1,
          rows: that.pageSize
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    submitForm (formName) {
    },
    resetForm (formName) {
      this.newsForm = {
        title: '',
        content: ''
      }
      this.controlType = {
        title: '新建服务项',
        btn: '新增'
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
          var url = 'system/addServicManagement.action'
          var dataPost = {
            name: that.newsForm.title,
            detail: that.newsForm.content
          }
          if (that.controlType.btn === '修改') {
            dataPost.goodsServiceId = that.newsForm.id
            url = 'system/updateServicManagement.action'
          }
          that.$axios({
            method: 'post',
            url: url,
            data: dataPost
          }).then(function (res) {
            if (that.controlType.btn === '新增') {
              that.currentPage1 = 1
            }
            that.$message.success('操作成功')
            that.dialogFormVisible = false
            that.pageData()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    controlClick (type, data) {
      var that = this
      if (type === 3) {
        this.newsForm = {
          title: data.name,
          content: data.detail,
          id: data.id
        }
        this.dialogFormVisible = true
        this.controlType = {
          title: '修改服务项',
          btn: '修改'
        }
        return
      }
      var confirmCon = {
        title: '删除确认',
        url: 'system/delServicManagement.action',
        content: '是否确定删除' + data.name + '，删除后商品项将不可进行选择。'
      }
      if (type === 1) {
        confirmCon = {
          title: '启用确认',
          url: 'system/startServicManagement.action',
          content: '是否确定启用' + data.name
        }
      } else if (type === 2) {
        confirmCon = {
          title: '禁用确认',
          url: 'system/stopServicManagement.action',
          content: '是否确定禁用' + data.name + '，禁用后商品项将不可进行选择。'
        }
      }
      this.$confirm(confirmCon.content, confirmCon.title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.$axios({
          method: 'post',
          url: confirmCon.url,
          data: {
            goodsServiceId: data.id
          }
        }).then(function (res) {
          that.$message.success('操作成功')
          that.pageData()
        })
      }).catch(() => {
      })
    }
  }
}
</script>

<style scoped>

</style>
