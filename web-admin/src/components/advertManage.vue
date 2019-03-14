<template>
  <div>
    <el-radio-group v-model="checkTab" @change="pageData()" style="margin-bottom: 10px">
      <el-radio-button v-for="(item) in goods.advertList" :key="item.value" :label="item.value">{{item.name}}</el-radio-button>
    </el-radio-group>
    <template v-if="checkTab*1===0">
      <el-table   class="admin-table" border   max-height="400"   :data="tableData">
        <el-table-column align="center"  label="广告位名称">
          <template slot-scope="scope">
            <span>启动页</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="href" label="广告链接"></el-table-column>
        <el-table-column align="center"  label="广告图片">
          <template slot-scope="scope">
            <img v-if="scope.row.img" class="imgList" :src="scope.row.img.split(';')[0]" alt="">
            <span v-else>无数据</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="handle" label="操作">
          <template slot-scope="scope">
            <el-button v-if="$common.havePower(95)"  @click="controlClick(scope.row,4)" type="text" size="mini">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-else>
      <el-table   class="admin-table" border   max-height="400"   :data="tableData">
        <el-table-column align="center"  label="广告位名称">
          <template slot-scope="scope">
            <span>{{'广告位'+(scope.$index+1)}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="href" label="广告链接"></el-table-column>
        <el-table-column align="center"  label="广告图片">
          <template slot-scope="scope">
            <img v-if="scope.row.img" class="imgList" :src="scope.row.img.split(';')[0]" alt="">
            <span v-else>无数据</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="handle" label="操作">
          <template slot-scope="scope">
            <template v-if="scope.$index>=1">
              <el-button v-if="$common.havePower(99)" @click="controlClick(scope.row,1)" type="text" size="mini">置顶</el-button>
              <el-button v-if="$common.havePower(100)" @click="controlClick(scope.row,2)" type="text" size="mini">上移</el-button>
            </template>
            <template v-if="scope.$index<8">
              <el-button v-if="$common.havePower(101)" @click="controlClick(scope.row,3)" type="text" size="mini">下移</el-button>
            </template>
            <el-button v-if="$common.havePower(102)" @click="controlClick(scope.row,4)" type="text" size="mini">修改</el-button>
            <el-button v-if="$common.havePower(103)"  @click="controlClick(scope.row,5)" type="text" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <div style="text-align: right;margin-top: 10px">
      <el-button v-if="+checkTab===1&&$common.havePower(104)"  @click="dialogFormVisible=true"  type="primary">新增广告位</el-button>
    </div>
    <el-dialog width="540px" :title="advertTitle.title" :visible.sync="dialogFormVisible"
               @close="resetForm('advertForm')">
      <el-form label-position="right" size="mini" :inline="true" :model.sync="advertForm" :rules="advertRule"
               ref="advertForm" status-icon>
        <el-form-item prop="urlType" label="链接类型：">
          <el-select @change="resetGoods()" v-model="advertForm.urlType">
            <el-option v-for="(item) in goods.urlType" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="+advertForm.urlType===1||+advertForm.urlType===2" prop="goodsType" label="商品类型：">
          <el-select @change="addGoods()" v-model="advertForm.goodsType">
            <el-option v-for="(item,index) in goods.type" :key="index" :label="item.name"
                       :value="item.categoryId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="+advertForm.urlType===2" prop="goodsName" label="商品名称：">
          <el-select v-model="advertForm.goodsName" filterable>
            <el-option v-for="(item,index) in goods.goodsName" :key="index" :label="item.name"
                       :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="+advertForm.urlType===3" prop="url" label="外部链接：">
          <el-input placeholder="请输入外部链接" v-model="advertForm.url">
          </el-input>
        </el-form-item>
        <br>
        <el-form-item prop="changeFile" label="安卓广告图片：">
          <el-upload
            action="admin/pic/upload.action"
            :file-list="advertForm.changeFile"
            name="uploadFile"
            :before-upload="$common.beforeImg"
            :limit="1"
            :on-exceed="$common.imgLimit"
            :on-remove="handleRemove(2,'changeFile')"
            :before-remove="handleRemove(1,'changeFile')"
            :on-error="$common.imgError"
            list-type="picture"
            :on-success="imgOK('changeFile')">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <br>
        <el-form-item prop="changeFile1" label="苹果广告图片：">
          <el-upload
            action="admin/pic/upload.action"
            :file-list="advertForm.changeFile1"
            name="uploadFile"
            :before-upload="$common.beforeImg"
            :limit="1"
            :on-exceed="$common.imgLimit"
            :on-remove="handleRemove(2,'changeFile1')"
            :before-remove="handleRemove(1,'changeFile1')"
            :on-error="$common.imgError"
            list-type="picture"
            :on-success="imgOK('changeFile1')">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="submitAdvert('advertForm')" type="primary">{{advertTitle.btn}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'advert-manage',
  data () {
    var that = this
    return {
      checkTab: 0,
      advertTitle: {
        title: '新建广告位',
        btn: '新建'
      },
      recommendTitle: {
        title: '新增推荐位',
        btn: '新增'
      },
      advertForm: {
        changeFile: [],
        changeFile1: [],
        url: '',
        goodsType: '',
        urlType: 0,
        goodsName: ''
      },
      advertRule: {
        goodsType: [
          {required: true, message: '请选择商品类型'}
        ],
        url: [
          {required: true, message: '请输入外部链接'},
          {validator: that.$common.urlOk}
        ],
        goodsName: [
          {required: true, message: '请选择商品名称'}
        ],
        changeFile: [
          {required: true, message: '请上传图片'}
        ],
        changeFile1: [
          {required: true, message: '请上传图片'}
        ]
      },
      goods: {
        advertList: [],
        goodsName: [],
        urlType: [
          {
            name: '商品分类链接',
            id: 1
          },
          {
            name: '商品链接',
            id: 2
          },
          {
            name: '外部链接',
            id: 3
          },
          {
            name: '无链接',
            id: 0
          }
        ],
        type: []
      },
      dialogFormVisible: false,
      dialogFormVisible1: false,
      tableHead: [
        {name: 'url', value: '广告链接'},
        {name: 'img', value: '广告图片'}
      ],
      tableData: []
    }
  },
  created () {
    var list = [
      {name: '广告位', value: 0, id: 91},
      {name: '分类位', value: 1, id: 98}
    ]
    var currentList = this.$common.powerFilter(list)
    this.checkTab = currentList[0].value
    this.goods.advertList = currentList
    var that = this
    this.pageData()
    this.$axios({
      method: 'get',
      url: 'item/getCatList.action'
    }).then(function (res) {
      that.goods.type = res
    })
  },
  methods: {
    resetGoods () {
      if (!this.$common.isNull(this.advertForm.goodsType)) {
        this.advertForm.goodsType = ''
      }
      if (!this.$common.isNull(this.advertForm.goodsName)) {
        this.advertForm.goodsName = ''
      }
      if (this.goods.goodsName && this.goods.goodsName.length) {
        this.goods.goodsName = []
      }
    },
    addGoods (type) {
      var that = this
      if (+this.advertForm.urlType === 1) {
        return
      }
      that.$axios({
        method: 'post',
        url: 'system/getGoodsList.action',
        data: {
          goodsCategoryId: that.advertForm.goodsType
        }
      }).then(function (res) {
        if (!type && !that.$common.isNull(that.advertForm.goodsName)) {
          that.advertForm.goodsName = ''
        }
        that.goods.goodsName = res
      })
    },
    pageData () {
      var that = this
      var table = 'tableData'
      var url = 'system/getAdManagementList.action'
      this.$axios({
        method: 'get',
        params: {
          type: that.checkTab
        },
        url: url
      }).then(function (res) {
        that[table] = res
      }).catch(() => {
        that[table] = []
      })
    },
    resetForm (formName) {
      this.advertForm = {
        changeFile: [],
        changeFile1: [],
        url: '',
        goodsType: '',
        urlType: 0,
        goodsName: ''
      }
      this.goods.goodsName = []
      this.advertTitle = {
        title: '新建广告位',
        btn: '新建'
      }
      this.$refs[formName].resetFields()
    },
    controlClick (data, type) {
      var that = this
      if (type === 5) {
        this.$confirm('是否确认删除此广告位', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'system/delBanner.action',
            data: {
              bannerId: data.id,
              type: that.checkTab
            }
          }).then(function () {
            that.$message.success('操作成功')
            that.pageData()
          })
        }).catch(() => {
        })
        return
      }
      if (type === 4) {
        this.advertTitle = {
          title: '修改广告位',
          btn: '修改'
        }
        var file = data.img ? data.img.split(';') : []
        var dataForm = {
          id: data.id,
          changeFile: file.length ? [{name: '广告位', url: file[0]}] : [],
          changeFile1: file.length ? [{name: '广告位', url: file[1]}] : [],
          url: ''
        }
        var index
        if (that.$common.urlOk(null, data.href)) {
          dataForm.urlType = 3
          dataForm.url = data.href
        } else if (/goodsId/.test(data.href)) {
          index = data.href.indexOf('goodsId')
          dataForm.urlType = 2
          dataForm.goodsType = +data.categoryId
          dataForm.goodsName = +data.href.slice(index + 8)
        } else if (/categoryId/.test(data.href)) {
          index = data.href.indexOf('categoryId')
          dataForm.goodsType = +data.href.slice(index + 11)
          dataForm.urlType = 1
        } else {
          dataForm.urlType = 0
        }
        that.advertForm = dataForm
        if (!that.$common.isNull(dataForm.goodsType)) {
          that.addGoods(1)
        }
        that.dialogFormVisible = true
        return
      }
      var a = ''
      if (type === 1) {
        a = 'system/setAdManagementTop.action'
      } else if (type === 2) {
        a = 'system/setAdManagementUp.action'
      } else if (type === 3) {
        a = 'system/setAdManagementDown.action'
      }
      this.$axios({
        method: 'post',
        url: a,
        data: {
          bannerId: data.id,
          type: that.checkTab
        }
      }).then(function () {
        that.$message.success('操作成功')
        that.pageData()
      })
    },
    submitAdvert (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (that.checkTab === 0 && that.tableData.length === 9) {
            that.$message.warning('广告位不能超过8个')
            return
          }
          if (that.checkTab === 1 && that.tableData.length === 8) {
            that.$message.warning('广告位不能超过8个')
            return
          }
          var option = {
            AndroidImgURL: that.advertForm.changeFile[0].url,
            IosImgURL: that.advertForm.changeFile[0].url,
            href: that.advertForm.url,
            type: that.checkTab
          }
          if (!that.$common.isNull(that.advertForm.id)) {
            option.bannerId = that.advertForm.id
          }
          switch (that.advertForm.urlType) {
            case 0:
              break
            case 1:
              option.href = 'inapp://goodsDetail?categoryId=' + that.advertForm.goodsType
              break
            case 2:
              option.href = 'inapp://goodsDetail?goodsId=' + that.advertForm.goodsName
              break
            case 3:
              option.href = that.advertForm.url
              break
          }
          this.$axios({
            method: 'post',
            url: 'system/addLink.action',
            data: option
          }).then(function () {
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
    handleRemove (type, data) {
      var formName = 'advertForm'
      var that = this
      if (type === 1) {
        return (file, fileList) => {
          if (!that[formName][data].length) {
            return true
          }
          return this.$confirm(`确定移除此图片吗？`)
        }
      } else {
        return (file, fileList) => {
          this[formName][data] = []
        }
      }
    },
    imgOK (a) {
      var formName = 'advertForm'
      return (response, file, fileList) => {
        if (!this.$common.imgRes(response)) {
          fileList.pop()
          return
        }
        this[formName][a] = [ {
          name: '广告位',
          url: response.data.url
        }]
      }
    }
  }
}
</script>

<style>
  .imgList{
    height: 50px;
  }
</style>
