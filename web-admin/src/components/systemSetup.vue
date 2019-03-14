<template>
<div>
  <el-radio-group v-model="checkTab" @change="pageData()" style="margin-bottom: 10px">
    <el-radio-button v-for="(item) in goods.list" :key="item.value" :label="item.value">{{item.name}}</el-radio-button>
  </el-radio-group>
  <template v-if="checkTab===0">
    <div style="text-align: right;margin-bottom: 10px">
      <el-button v-if="$common.havePower(217)" @click="dialogFormVisible=true" type="primary" size="mini">添加推文</el-button>
    </div>
    <el-table   class="admin-table" border   max-height="400"   :data="tableData">
      <el-table-column align="center" prop="title" label="推文标题"></el-table-column>
      <el-table-column align="center" prop="introduction" label="副标题"></el-table-column>
      <el-table-column align="center" prop="effectiveTime" label="有效期">
        <template slot-scope="scope">
          {{scope.row.effectiveTime | dateFormat(1)}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="url" label="链接"></el-table-column>
      <el-table-column align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(215)" @click="controlClick(1,scope.row)" type="text" size="mini">删除</el-button>
          <el-button v-if="$common.havePower(216)" @click="controlClick(2,scope.row)" type="text" size="mini">修改</el-button>
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
  </template>
  <template v-else>
    <el-form  :inline="true" size="mini" :model.sync="activityForm" :rules="activityRules" ref="activityForm">
      <el-form-item  prop="url" label="链接：" >
        <el-input v-model="activityForm.url" placeholder="请输入链接"></el-input>
      </el-form-item>
      <br>
      <el-form-item  prop="img" label="安卓图片：">
        <el-upload
          action="admin/pic/upload.action"
          :file-list="activityForm.img"
          name="uploadFile"
          :before-upload="$common.beforeImg"
          :limit="1"
          :on-exceed="$common.imgLimit"
          :on-remove="handleRemove(2,'img')"
          :before-remove="handleRemove(1,'img')"
          :on-error="$common.imgError"
          list-type="picture"
          :on-success="imgOK('img')">
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item  prop="iosImg" label="苹果图片：">
        <el-upload
          action="admin/pic/upload.action"
          :file-list="activityForm.iosImg"
          name="uploadFile"
          :before-upload="$common.beforeImg"
          :limit="1"
          :on-exceed="$common.imgLimit"
          :on-remove="handleRemove(2,'iosImg')"
          :before-remove="handleRemove(1,'iosImg')"
          :on-error="$common.imgError"
          list-type="picture"
          :on-success="imgOK('iosImg')">
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-button v-if="$common.havePower(219)" @click="activitySubmit()" type="primary" size="medium">保存</el-button>
  </template>
  <el-dialog :title="controlType.title" width="400px" :visible.sync="dialogFormVisible" @close="resetForm('ruleForm')">
    <el-form  :inline="true" size="mini" :model.sync="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
      <el-form-item  prop="title" label="推文标题：" >
        <el-input  :maxlength=50  v-model="ruleForm.title" placeholder="请输入推文标题"></el-input>
      </el-form-item>
      <el-form-item  prop="subtitle" label="推文副标题：" >
        <el-input  :maxlength=50  v-model="ruleForm.subtitle" placeholder="请输入推文副标题"></el-input>
      </el-form-item>
      <el-form-item  prop="url" label="链接：" >
        <el-input v-model="ruleForm.url" placeholder="请输入链接"></el-input>
      </el-form-item>
      <el-form-item prop="time" label="有效期至：">
        <el-date-picker
          v-model="ruleForm.time"
          type="date"
          :clearable="false"
          :picker-options="pickerOptions1"
          :editable="false"
          value-format="timestamp"
          placeholder="选择日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button  type="primary" @click="submit('ruleForm')">{{controlType.btn}}</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
export default {
  name: 'systemSetup',
  data () {
    var that = this
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      checkTab: 0,
      dialogFormVisible: false,
      controlType: {
        title: '新建推文',
        btn: '新建'
      },
      goods: {
        list: []
      },
      tableData: [],
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      ruleForm: {
        title: '',
        subtitle: '',
        url: '',
        time: ''
      },
      activityForm: {
        url: '',
        img: [],
        iosImg: []
      },
      activityRules: {
        url: [
          {required: true, message: '请输入链接'},
          {validator: that.$common.urlOk}
        ],
        img: [
          {required: true, message: '请上传图片'}
        ],
        iosImg: [
          {required: true, message: '请上传图片'}
        ]
      },
      rules: {
        title: [
          {required: true, message: '请输入推文标题'}
        ],
        subtitle: [
          {required: true, message: '请输入推文副标题'}
        ],
        url: [
          {required: true, message: '请输入链接'},
          {validator: that.$common.urlOk}
        ],
        time: [
          {required: true, message: '请选择时间'}
        ]
      }
    }
  },
  created () {
    var list = [
      {name: '茂茂推文', value: 0, id: 214},
      {name: '活动管理', value: 1, id: 218}
    ]
    var currentList = this.$common.powerFilter(list)
    this.checkTab = currentList[0].value
    this.goods.list = currentList
    this.pageData()
  },
  methods: {
    pageData (page) {
      var that = this
      if (this.checkTab === 0) {
        if (page) { this.currentPage1 = 1 }
        this.$axios({
          method: 'get',
          params: {
            pages: that.currentPage1,
            rows: that.pageSize
          },
          url: 'system/getTweetsList.action'
        }).then(function (res) {
          that.tableData = res.rows
          that.pageTotal = res.total
        })
      } else {
        this.$axios({
          method: 'get',
          url: 'system/getActivity.action'
        }).then(function (res) {
          if (res.href) {
            var img = res.img.split(';')
            that.activityForm = {
              url: res.href,
              img: [{name: '安卓图片', url: img[0]}],
              iosImg: [{name: '苹果图片', url: img[1]}]
            }
          }
        })
      }
    },
    activitySubmit () {
      var that = this
      this.$axios({
        method: 'post',
        url: 'system/addAndUpdateActivity.action',
        data: {
          href: that.activityForm.url,
          androidImgURL: that.activityForm.img[0].url,
          iosImgURL: that.activityForm.iosImg[0].url
        }
      }).then(function (res) {
        that.$message.success('操作成功')
      })
    },
    handleCurrentChange () {
      this.pageData()
    },
    submit (formName) {
      var that = this
      if (formName === 'ruleForm') {
        this.$refs[formName].validate((valid) => {
          var option = {
            title: that.ruleForm.title,
            introduction: that.ruleForm.subtitle,
            url: that.ruleForm.url,
            effectiveTime: that.ruleForm.time
          }
          var setStatus = !that.$common.isNull(that.ruleForm.id)
          if (setStatus) {
            option.categoryHomeArticleId = that.ruleForm.id
          }
          if (valid) {
            that.$axios({
              method: 'post',
              data: option,
              url: 'system/addTweets.action'
            }).then(function (res) {
              that.$message.success('操作成功')
              that.dialogFormVisible = false
              that.pageData(setStatus)
            })
          } else {
            return false
          }
        })
      }
    },
    controlClick (type, data) {
      var that = this
      if (type === 1) {
        this.$confirm('是否删除标题为' + data.title + '推文', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            data: {
              categoryHomeArticleId: data.id,
              status: -1
            },
            url: 'system/delTweets.action'
          }).then(function (res) {
            that.$message.success('操作成功')
            that.pageData()
          })
        }).catch(() => {
        })
      } else {
        this.ruleForm = {
          title: data.title,
          id: data.id,
          subtitle: data.introduction,
          url: data.url,
          time: data.effectiveTime
        }
        that.controlType = {
          title: '修改推文',
          btn: '修改'
        }
        that.dialogFormVisible = true
      }
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.ruleForm = {
        title: '',
        subtitle: '',
        url: '',
        time: ''
      }
      this.controlType = {
        title: '新建推文',
        btn: '新建'
      }
    },
    handleRemove (type, data) {
      var that = this
      if (type === 1) {
        return (file, fileList) => {
          if (!that['activityForm'][data].length) {
            return true
          }
          return this.$confirm(`确定移除此图片吗？`)
        }
      } else {
        return (file, fileList) => {
          this['activityForm'][data] = []
        }
      }
    },
    imgOK (a) {
      return (response, file, fileList) => {
        if (!this.$common.imgRes(response)) {
          fileList.pop()
          return
        }
        this['activityForm'][a] = [ {
          name: '图片',
          url: response.data.url
        }]
      }
    }
  }
}
</script>

<style scoped>

</style>
