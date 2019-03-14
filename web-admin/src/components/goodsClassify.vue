<template>
  <div>
    <div class="el-form el-form--inline">
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-input size="small" @keyup.enter.native="submitForm2('ruleForm2')" :maxlength=20 v-model="ruleForm2.account" placeholder="请输入商品分类名称"></el-input>
        </div>
      </div>
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-button size="small" type="primary" @click="ruleForm2.account=''">重置</el-button>
          <el-button size="small" type="primary" @click="submitForm2('ruleForm2')">搜索</el-button>
        </div>
      </div>
    </div>
    <el-radio-group v-model="checkTab" @change="pageData()" style="margin-bottom: 10px">
      <el-radio-button v-for="(item) in goods.typeList" :key="item.value" :label="item.value">{{item.name}}</el-radio-button>
    </el-radio-group>
    <p v-if="checkTab===1" style="text-align: right">  <el-button v-if="$common.havePower(28)" size="small" @click="dialogFormVisible=true"  type="primary">新建分类</el-button></p>
    <p v-else style="text-align: right">  <el-button v-if="$common.havePower(165)" size="small" @click="dialogFormVisible=true"  type="primary">新建分类</el-button></p>
    <el-table  class="admin-table" border   max-height="400" :data="tableData">
      <el-table-column align="center" prop="name" label="商品分类"></el-table-column>
      <el-table-column align="center" prop="stock" label="商品总数（件）"></el-table-column>
      <el-table-column align="center" prop="brandcount" label="品牌数量（种）"></el-table-column>
      <el-table-column v-if="checkTab===1" align="center" prop="categorySort" label="前台排序"></el-table-column>
      <el-table-column align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <template v-if="checkTab===1">
            <el-button v-if="$common.havePower(23)"  @click="handleClick(scope,1)" type="text" size="mini">删除</el-button>
            <el-button v-if="$common.havePower(24)"  @click="handleClick(scope,2)" type="text" size="mini">修改</el-button>
            <el-button v-if="scope.row.status*1===1&&$common.havePower(25)" @click="handleClick(scope,3)" type="text" size="mini">停用</el-button>
            <el-button v-if="scope.row.status*1===0&&$common.havePower(122)" @click="handleClick(scope,4)" type="text" size="mini">启用</el-button>
            <el-button v-if="scope.row.categorySort*1>1&&$common.havePower(26)" @click="handleClick(scope,5)" type="text" size="mini">上移</el-button>
            <el-button v-if="scope.row.categorySort*1<pageTotal*1&&$common.havePower(27)" @click="handleClick(scope,6)" type="text" size="mini">下移</el-button>
          </template>
          <template v-else>
            <el-button v-if="$common.havePower(166)"  @click="handleClick(scope,1)" type="text" size="mini">删除</el-button>
            <el-button v-if="$common.havePower(167)"  @click="handleClick(scope,2)" type="text" size="mini">修改</el-button>
            <el-button v-if="scope.row.status*1===1&&$common.havePower(168)" @click="handleClick(scope,3)" type="text" size="mini">停用</el-button>
            <el-button v-if="scope.row.status*1===0&&$common.havePower(170)" @click="handleClick(scope,4)" type="text" size="mini">启用</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage1"
      :page-size="pageSize"
      layout="prev,total, pager, next,jumper"
      :total="pageTotal*1">
    </el-pagination>
    <el-dialog :title="title" width="705px" :visible.sync="dialogFormVisible" @close="resetForm('ruleForm')">
      <div>
        <el-form :inline="true" size="small" :model="ruleForm" :rules="rules" ref="ruleForm">
          <el-form-item prop="goodsClassify" label="商品分类名称：" >
            <el-input :maxlength=4 v-model="ruleForm.goodsClassify" placeholder="请输入商品分类名称"  ></el-input>
          </el-form-item>
          <el-form-item v-if="checkTab===1" prop="categorySort" label="分类页排序：" style="float: right" >
            <el-select v-model="ruleForm.categorySort">
              <template v-for="item in ruleForm.id?pageTotal:pageTotal+1">
                <el-option :key="item" :label="item" :value="item"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item :rules="checkTab===1?[{required: true, message: '请上传分类图标'}]:[]" prop="fileList" label="分类图标：">
            <el-upload
              action="admin/pic/upload.action"
              name="uploadFile"
              :file-list="ruleForm.fileList"
              :before-upload="$common.beforeImg"
              :limit="1"
              :on-exceed="$common.imgLimit"
              :on-remove="handleRemove(2,'fileList')"
              :before-remove="handleRemove(1,'fileList')"
              :on-error="$common.imgError"
              list-type="picture"
              :on-success="imgOK">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item  prop="goodsTitle" label="副标题：" >
            <el-input :maxlength=15  v-model="ruleForm.goodsTitle" placeholder="请输入分类副标题"></el-input>
          </el-form-item>
        </el-form>
        <template v-if="checkTab===1">
          <div  style="margin-bottom: 10px">
            <label style="color: #f56c6c">*</label><span>商品规格(最多五个，点击文字可修改)：</span>
            <el-input size="small" :maxlength=10 v-model="goodsFormat.name" style="width: 200px" placeholder="请输入品牌名称"></el-input>
            <el-button size="small"  type="primary" @click="addBrand(2)">新增</el-button>
          </div>
          <div v-if="goodsFormat.add.length" style="margin-bottom: 10px">
            <label>新增商品规格：</label>
            <span v-for="(tag,index) in goodsFormat.add" :key="index"  class="el-tag el-tag--medium">
            <span @click="goodsFormatSet(1,index)" class="elePointer">{{tag}}</span>
            <i @click="goodsFormatDel(tag,1,index)" class="el-tag__close el-icon-close"></i>
          </span>
          </div>
          <div v-if="goodsFormat.exist.length" style="margin-bottom: 10px">
            <label>已有商品规格：</label>
            <span v-for="(tag,index) in goodsFormat.exist" :key="tag.skuId"  class="el-tag el-tag--medium">
            <span class="elePointer">{{tag.skuKey}}</span>
            <i @click="goodsFormatDel(tag,2,index)" class="el-tag__close el-icon-close"></i>
          </span>
          </div>
        </template>
        <div style="margin-bottom: 10px">
          <label>品牌：</label>
          <el-input size="small" :maxlength=10 v-model="goodsBrand" style="width: 200px" placeholder="请输入品牌名称"></el-input>
          <el-button size="small"  type="primary" @click="addBrand()">新增</el-button>
        </div>
        <div v-if="brandList.add.length" style="margin-bottom: 10px">
          <label>新增品牌：</label>
          <el-tag
            :key="tag"
            size="medium"
            v-for="(tag,index) in brandList.add"
            closable
            @close="removeBrand(tag,1,index)">
            {{tag}}
          </el-tag>
        </div>
        <div v-if="brandList.exist.length" style="margin-bottom: 10px">
          <label>已有品牌：</label>
          <el-tag
            :key="tag.brandId"
            size="medium"
            v-for="(tag,index) in brandList.exist"
            closable
            @close="removeBrand(tag,2,index)">
            {{tag.brandName}}
          </el-tag>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm2('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'goods-classify',
  data () {
    return {
      title: '新建分类',
      goodsFormat: {
        name: '',
        add: [],
        exist: []
      },
      checkTab: 1,
      brandList: {
        add: [],
        exist: []
      },
      ruleForm2: {
        account: ''
      },
      goods: {
        typeList: []
      },
      goodsBrand: '',
      ruleForm: {
        goodsClassify: '',
        fileList: [],
        categorySort: '',
        type: 0,
        id: '',
        goodsTitle: ''
      },
      rules: {
        goodsClassify: [
          {required: true, message: '请输入商品分类名称'}
        ],
        categorySort: [
          {required: true, message: '请选择分类页排序'},
          {validator: this.$common.integer}
        ]
      },
      dialogFormVisible: false,
      tableData: [],
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0
    }
  },
  created () {
    var list = [
      {name: '普通分类', value: 1, id: 169},
      {name: '合卖分类', value: 0, id: 164}
    ]
    var currentList = this.$common.powerFilter(list)
    if (currentList.length) {
      this.checkTab = currentList[0].value
      this.goods.typeList = currentList
      this.pageData()
    } else {
      this.$message.warning('无权限')
    }
  },
  methods: {
    pageData () {
      var that = this
      this.$axios({
        method: 'post',
        url: 'item/itemCat.action',
        data: {
          pages: that.currentPage1,
          rows: that.pageSize,
          isRecommend: that.checkTab,
          keywords: that.ruleForm2.account
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      }).catch(() => {
        that.tableData = []
      })
    },
    goodsFormatDel (tag, type, index) {
      var that = this
      if (type === 1) {
        this.goodsFormat.add.splice(index, 1)
      } else {
        this.$confirm('是否确认删除已有品牌,删除后立即生效', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'get',
            url: '/deleteSkuKey.action',
            params: {
              skuKeyId: tag.skuId
            }
          }).then(function () {
            this.goodsFormat.exist.splice(index, 1)
            that.$message.success('操作成功')
          })
        }).catch(() => {

        })
      }
    },
    goodsFormatSet (type, index) {
      var that = this
      this.$prompt('商品规格：', '修改规格', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入商品规格',
        inputValidator: function (value) {
          if (!value) {
            return '请输入商品规格'
          }
          return true
        }
      }).then(({ value }) => {
        if (type === 1) {
          var index1 = that.$common.findElem(that.goodsFormat.exist, 'brandName', value)
          if (that.goodsFormat.add.indexOf(value) > -1 || index1 > -1) {
            that.$message({
              message: '商品规格名称重复',
              type: 'warning'
            })
            return
          }
          that.goodsFormat.add.splice(index, 1, value)
        } else {

        }
      }).catch(() => {

      })
    },
    handleCurrentChange () {
      this.pageData()
    },
    addBrand (type) {
      if (type === 2) {
        if (!this.goodsFormat.name) {
          this.$message.warning('请输入商品规格')
          return
        }
        if ((this.goodsFormat.exist.length + this.goodsFormat.add.length) >= 5) {
          this.$message.warning('最多只能添加5个商品规格')
          return
        }
        var index1 = this.$common.findElem(this.goodsFormat.exist, 'brandName', this.goodsFormat.name)
        if (this.goodsFormat.add.indexOf(this.goodsFormat.name) > -1 || index1 > -1) {
          this.$message({
            message: '商品规格名称重复',
            type: 'warning'
          })
          return
        }
        this.goodsFormat.add.push(this.goodsFormat.name)
        this.goodsFormat.name = ''
      } else {
        if (!this.goodsBrand) {
          this.$message({
            message: '请输入品牌名称',
            type: 'warning'
          })
          return
        }
        var index = this.$common.findElem(this.brandList.exist, 'brandName', this.goodsBrand)
        if (this.brandList.add.indexOf(this.goodsBrand) > -1 || index > -1) {
          this.$message({
            message: '品牌名称重复',
            type: 'warning'
          })
          return
        }
        this.brandList.add.push(this.goodsBrand)
        this.goodsBrand = ''
      }
    },
    removeBrand (tag, type, index) {
      var that = this
      if (type === 1) {
        this.brandList.add.splice(index, 1)
        return
      }
      this.$confirm('是否确认删除已有品牌' + tag.brandName + ',删除后立即生效', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.$axios({
          method: 'post',
          url: 'item/deleteBrand.action',
          data: {
            brandId: tag.brandId
          }
        }).then(function () {
          that.brandList.exist.splice(index, 1)
          that.$message({
            type: 'success',
            message: '操作成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    submitForm2 (formName) {
      if (formName === 'ruleForm2') {
        this.currentPage1 = 1
        this.pageData()
        return
      }
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (!(that.goodsFormat.exist.length || that.goodsFormat.add.length) && that.checkTab === 1) {
            that.$message.warning('请至少添加一个商品规格')
            return
          }
          if (that.$common.isNull(that.ruleForm.id)) {
            that.$axios({
              method: 'post',
              url: 'item/addCategory.action',
              data: {
                categoryName: that[formName].goodsClassify,
                img: that[formName].fileList.length ? that[formName].fileList[0].url : '',
                categorySort: that[formName].categorySort,
                isRecommend: that.checkTab,
                maxCategorySort: that.pageTotal + 1,
                introduction: that[formName].goodsTitle,
                brand: that.brandList.add.join(';'),
                skuKey: that.goodsFormat.add.join(';')
              }
            }).then(function (res) {
              that.$message({
                type: 'success',
                message: '添加成功!'
              })
              that.dialogFormVisible = false
              that.currentPage1 = 1
              that.pageData()
            })
          } else {
            that.$axios({
              method: 'post',
              url: 'item/editCategory.action',
              data: {
                id: that[formName].id,
                name: that[formName].goodsClassify,
                isRecommend: that.checkTab,
                img: that[formName].fileList.length ? that[formName].fileList[0].url : '',
                categorySort: that[formName].categorySort,
                introduction: that[formName].goodsTitle,
                brand: that.brandList.add.join(';'),
                skuKey: that.goodsFormat.add.join(';')
              }
            }).then(function (res) {
              that.$message({
                type: 'success',
                message: '修改成功!'
              })
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
    resetForm (formName) {
      this.title = '新建分类'
      this.ruleForm = {
        goodsClassify: '',
        fileList: [],
        type: 0,
        id: '',
        goodsTitle: ''
      }
      this.brandList = {add: [], exist: []}
      this.goodsFormat = {add: [], exist: []}
      this.goodsBrand = ''
      this.$refs[formName].resetFields()
    },
    handleRemove (type, data) {
      var that = this
      if (type === 1) {
        return (file, fileList) => {
          if (!that.ruleForm[data].length) {
            return true
          }
          return this.$confirm(`确定移除此图片吗？`)
        }
      } else {
        return (file, fileList) => {
          that.ruleForm[data] = []
        }
      }
    },
    imgOK (response, file, fileList) {
      if (!this.$common.imgRes(response)) {
        fileList.splice(0, 1)
        return
      }
      this.ruleForm.fileList = [
        {name: '分类图标', url: response.data.url}
      ]
    },
    handleClick (data, type) {
      var that = this
      if (type === 1) {
        var str = '是否确认删除' + data.row.name + '，删除后该类商品将全部下架。'
        this.$confirm(str, '删除确认', {
          confirmButtonText: '确定',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'item/delSupplyCat.action',
            data: {
              categoryId: data.row.id
            }
          }).then(function (res) {
            that.$message({
              type: 'success',
              message: '删除成功!'
            })
            that.pageData()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else if (type === 2) {
        window.axios.all([that.$axios({
          method: 'get',
          url: 'item/getBrandList.action',
          params: {
            categoryId: data.row.id,
            isFenye: 0
          }
        }), that.$axios({
          method: 'get',
          url: 'item/getCatDetail.action',
          params: {
            categoryId: data.row.id
          }
        }), that.$axios({
          method: 'get',
          url: '/skuKey.action',
          params: {
            categoryId: data.row.id
          }
        })])
          .then(window.axios.spread(function (res1, res2, res3) {
            if (res1 && res1.length) {
              that.brandList.exist = res1
            }
            if (res3 && res3.length) {
              that.goodsFormat.exist = res3
            }
            that.ruleForm = {
              id: res2.id,
              type: type,
              goodsClassify: res2.name,
              fileList: res2.img ? [{name: '分类图标', url: res2.img}] : [],
              categorySort: res2.categorySort,
              goodsTitle: res2.introduction || ''
            }
            that.dialogFormVisible = true
            that.title = '修改分类'
          }))
      } else if (type === 3) {
        this.$confirm('是否确认停用' + data.row.name + '，停用后该类商品将全部下架。', '停用确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'item/stopItemCat.action',
            data: {
              categoryId: data.row.id
            }
          }).then(function (res) {
            that.$message({
              type: 'success',
              message: '操作成功!'
            })
            that.pageData()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
      } else if (type === 4) {
        this.$confirm('是否确认启用' + data.row.name + '，启用后该类商品将全部上架。', '启用确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'item/startItemCat.action',
            data: {
              categoryId: data.row.id
            }
          }).then(function (res) {
            that.$message({
              type: 'success',
              message: '操作成功!'
            })
            that.pageData()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
      } else if (type === 5) {
        that.$axios({
          method: 'post',
          url: 'item/upItemCat.action',
          data: {
            currentCategoryId: data.row.id
          }
        }).then(function (res) {
          that.$message({
            type: 'success',
            message: '操作成功!'
          })
          that.pageData()
        })
      } else if (type === 6) {
        that.$axios({
          method: 'post',
          url: 'item/backItemCat.action',
          data: {
            categoryId: data.row.id
          }
        }).then(function (res) {
          that.$message({
            type: 'success',
            message: '操作成功!'
          })
          that.pageData()
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
