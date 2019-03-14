<template>
<div>
  <el-radio-group v-model="activeName" @change="pageData('set')" style="margin-bottom: 10px">
    <el-radio-button v-for="(item) in orderList" :key="item.name" :label="item.name">{{item.label}}</el-radio-button>
  </el-radio-group>
  <template v-if="activeType>2">
    <div class="el-form el-form--inline">
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-input size="small" @keyup.enter.native="pageData()" v-model="ruleForm2.name" placeholder="请输入商品名称"></el-input>
        </div>
      </div>
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-button size="small" type="primary" @click="pageData()">搜索</el-button>
        </div>
      </div>
    </div>
    <div style="float: right;margin-bottom: 10px">
        <el-button style="float: right" v-if="activeName==='credit3'&&$common.havePower(182)" @click="openGoods()" type="primary" size="small">新增商品</el-button>
        <el-button style="float: right" v-if="activeName==='credit4'&&$common.havePower(187)" @click="openGoods()" type="primary" size="small">新增商品</el-button>
        <el-button style="float: right" v-if="activeName==='credit5'&&$common.havePower(192)" @click="openGoods()" type="primary" size="small">新增商品</el-button>
        <el-button style="float: right" v-if="activeName==='credit6'&&$common.havePower(197)" @click="openGoods()" type="primary" size="small">新增商品</el-button>
    </div>
  </template>
  <template v-if="activeName==='credit1'">
    <p v-if="activeName==='credit1'&&$common.havePower(223)" style="text-align: right;margin-bottom: 10px">
      <el-button @click="addHome()"  size="small"   type="primary">新建首页分类</el-button>
    </p>
    <div>
      <div v-for="(item,index) in tableData" :key="index" class="list-head">
      <span class="font-size12">
              <label style="color: #f56c6c">*</label>
              分类名称：
              <el-input v-model="item.homepageCategoryName" style="width: 130px" size="mini" :maxlength=20
                        placeholder="请输入推荐位名称"></el-input>
    </span>
        <span class="font-size12"> <label style="color: #f56c6c">*</label>图标：
        <el-upload
          style="display: inline-block;vertical-align: top"
          action="admin/pic/upload.action"
          :file-list="item.homepageCategoryImg?[{name:'图标',url:item.homepageCategoryImg}]:[]"
          name="uploadFile"
          :before-upload="$common.beforeImg"
          :limit="1"
          :on-exceed="$common.imgLimit"
          :on-remove="handleRemove(2,'arr',index)"
          :before-remove="handleRemove(1,'arr',index)"
          :on-error="$common.imgError"
          list-type="picture"
          :on-success="imgOK('arr',index)">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>

      </span>
        <p style="float: right;">
          <template v-if="index*1!==0">
            <el-button v-if="$common.havePower(174)" @click="controlClick(1,index)" type="text" size="mini">上移</el-button>
          </template>
          <el-button v-if="$common.havePower(173)&&index!==tableData.length-1" @click="controlClick(2,index)" type="text" size="mini">下移</el-button>
          <el-button v-if="$common.havePower(175)" @click="controlClick(3,index)" type="text" size="mini">删除</el-button>
          <el-button v-if="$common.havePower(223)" type="text" @click="controlClick(4,index)" size="mini">添加</el-button>
          <el-button v-if="$common.havePower(176)" type="text" @click="controlClick(5,index)" size="mini">保存</el-button>
        </p>
        <el-table class="admin-table" border :data="item.goodsList" style="margin-top: 10px">
          <el-table-column align="center" prop="goodsName" label="商品名称"></el-table-column>
          <el-table-column align="center" prop="minPrice" label="上架单价（元）">
            <template slot-scope="scope">
              {{(scope.row.minPrice/100).toFixed(2)}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="stock" label="库存量（件）"></el-table-column>
          <el-table-column align="center" prop="category" label="商品性质">
            <template slot-scope="scope">
              {{+scope.row.category===1?'非买断商品':'买断商品' }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <template v-if="scope.$index*1!==0">
                <el-button v-if="$common.havePower(224)" @click="homeGoodsClick(1,scope.row,index)" type="text" size="mini">置顶</el-button>
                <el-button v-if="$common.havePower(174)" @click="homeGoodsClick(2,scope.row,index)" type="text" size="mini">上移</el-button>
              </template>
              <el-button v-if="$common.havePower(173)&&scope.$index!==item.goodsList.length-1" @click="homeGoodsClick(3,scope.row,index)" type="text" size="mini">下移</el-button>
              <el-button v-if="$common.havePower(175)" @click="homeGoodsClick(4,scope.row,index)" type="text" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </template>
  <template v-else>
    <el-table class="admin-table" border max-height="400" :data="tableData">
      <template v-for="(item,index) in tableHead[activeName]">
        <el-table-column :key="index" :formatter="item.formatter" align="center" :prop="item.name" :label="item.value">
        </el-table-column>
      </template>
      <el-table-column v-if="activeName==='credit2'" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(222)" @click="classifyClick(scope.row)" type="text" size="mini">修改
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-else-if="activeName==='credit3'" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(185)&&scope.$index!==0" @click="otherClick(scope.row,0)" type="text" size="mini">置顶</el-button>
          <el-button v-if="$common.havePower(183)&&scope.$index!==0" @click="otherClick(scope.row,1)" type="text" size="mini">上移</el-button>
          <el-button v-if="$common.havePower(184)&&scope.$index!==tableData.length-1" @click="otherClick(scope.row,2)" type="text" size="mini">下移</el-button>
          <el-button v-if="$common.havePower(186)" @click="otherClick(scope.row,4)" type="text" size="mini">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column v-else-if="activeName==='credit4'" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(190)&&scope.$index!==0" @click="otherClick(scope.row,0)" type="text" size="mini">置顶</el-button>
          <el-button v-if="$common.havePower(188)&&scope.$index!==0" @click="otherClick(scope.row,1)" type="text" size="mini">上移</el-button>
          <el-button v-if="$common.havePower(189)&&scope.$index!==tableData.length-1" @click="otherClick(scope.row,2)" type="text" size="mini">下移</el-button>
          <el-button v-if="$common.havePower(191)" @click="otherClick(scope.row,4)" type="text" size="mini">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column v-else-if="activeName==='credit5'" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(195)&&scope.$index!==0" @click="otherClick(scope.row,0)" type="text" size="mini">置顶</el-button>
          <el-button v-if="$common.havePower(193)&&scope.$index!==0" @click="otherClick(scope.row,1)" type="text" size="mini">上移</el-button>
          <el-button v-if="$common.havePower(194)&&scope.$index!==tableData.length-1" @click="otherClick(scope.row,2)" type="text" size="mini">下移</el-button>
          <el-button v-if="$common.havePower(196)" @click="otherClick(scope.row,4)" type="text" size="mini">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column v-else-if="activeName==='credit6'" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(200)&&scope.$index!==0" @click="otherClick(scope.row,0)" type="text" size="mini">置顶</el-button>
          <el-button v-if="$common.havePower(198)&&scope.$index!==0" @click="otherClick(scope.row,1)" type="text" size="mini">上移</el-button>
          <el-button v-if="$common.havePower(199)&&scope.$index!==tableData.length-1" @click="otherClick(scope.row,2)" type="text" size="mini">下移</el-button>
          <el-button v-if="$common.havePower(201)" @click="otherClick(scope.row,4)" type="text" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </template>
  <el-dialog  width="800px" :title="recommendTitle.title" :visible.sync="dialogFormVisible1" @close="resetForm('advertForm')">
    <template v-if="activeName==='credit1'">
      <el-form label-position="right"  size="mini" :inline="true" :model.sync="advertForm" :rules="advertRule" ref="advertForm" status-icon>
        <el-form-item prop="name" label="分类名称：">
          <el-input placeholder="请输入分类名称"  :maxlength=4 v-model="advertForm.name" >
          </el-input>
        </el-form-item>
        <br>
        <el-form-item prop="changeFile" label="分类图标：">
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
      </el-form>
    </template>
    <template v-else>
      <div>
        <div style="margin-bottom: 10px">
          <el-input style="width: 300px"  @keyup.enter.native="classifyClick(recommendTitle)"  size="small" v-model="goods.name" placeholder="请输入商品名称"></el-input>
          <el-button size="small" type="primary" @click="goods.name=''">重置</el-button>
          <el-button size="small" type="primary" @click="classifyClick(recommendTitle)">搜索</el-button>
        </div>
        <el-table class="admin-table" border max-height="400" :data="tableGoods">
          <el-table-column align="center" prop="name" label="商品名称"></el-table-column>
          <el-table-column align="center" prop="price" label="上架单价（元）"></el-table-column>
          <el-table-column align="center" prop="stockCount" label="库存量（件）"></el-table-column>
          <el-table-column align="center" prop="goodsProperty" label="商品性质"></el-table-column>
          <el-table-column align="center" prop="owner" label="商品所属"></el-table-column>
          <el-table-column align="center" prop="sort" label="当前排序"></el-table-column>
          <el-table-column align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="+scope.row.sort!==1" @click="classifySet(scope,0)" type="text" size="mini">置顶</el-button>
              <el-button v-if="+scope.row.sort!==1" @click="classifySet(scope,1)" type="text" size="mini">上移</el-button>
              <el-button v-if="scope.row.sort!==recommendTitle.count" @click="classifySet(scope,2)" type="text" size="mini">下移</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="recommendTitle.btn" size="small" @click="submitAdvert('advertForm')" type="primary">{{recommendTitle.btn}}</el-button>
    </div>
  </el-dialog>
  <el-dialog title="添加商品" width="400px" :visible.sync="dialogFormVisible2" @close="resetForm('goodsForm')">
    <el-form :inline="true" size="mini" :model.sync="goodsForm" :rules="goodsRules" ref="goodsForm" label-width="120px">
      <el-form-item v-if="this.activeType<5" prop="type" label="商品性质：" >
        <el-select  v-model="goodsForm.type">
          <el-option v-for="(item,index) in goods.nature"  :key="index" :label="item" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="name" label="商品名称：" >
        <el-select  v-model="goodsForm.name" multiple filterable>
          <el-option v-for="(item,index) in selectGoods('goodsForm')"  :key="index" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button  type="primary" @click="addGoodsClassify('goodsForm')">添加</el-button>
    </div>
  </el-dialog>
  <el-dialog title="添加商品" width="400px" :visible.sync="dialogHomeVisible" @close="resetForm('goodsHomeForm')">
    <el-form :inline="true" size="mini" :model.sync="goodsHomeForm" :rules="goodsHomeFormRules" ref="goodsHomeForm" label-width="120px">
      <el-form-item prop="type" label="商品性质：" >
        <el-select  v-model="goodsHomeForm.type">
          <el-option v-for="(item,index) in goods.nature"  :key="index" :label="item" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="status" label="类型：" >
        <el-select  v-model="goodsHomeForm.status">
          <el-option v-for="(item,index) in goods.status"  :key="index" :label="item" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <template v-if="+goodsHomeForm.type===0&&+goodsHomeForm.status===1">
        <el-form-item prop="classify" label="商品分类：" >
          <el-select  v-model="goodsHomeForm.classify" filterable multiple>
            <el-option v-for="(item,index) in goods.classify"  :key="index" :label="item.name" :value="item.categoryId">
            </el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item v-if="!$common.isNull(goodsHomeForm.status)&&+goodsHomeForm.status===0"  prop="name" label="商品名称：" >
        <el-select  v-model="goodsHomeForm.name" filterable multiple>
          <el-option v-for="(item,index) in selectGoods('goodsHomeForm')"  :key="index" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button  type="primary" @click="addGoodsClassify('goodsHomeForm')">添加</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
export default {
  name: 'homeClassify',
  data () {
    return {
      orderList: [],
      advertForm: {
        changeFile: [],
        name: ''
      },
      ruleForm2: {
        name: ''
      },
      goodsForm: {
        type: '',
        name: []
      },
      goodsRules: {
        type: {required: true, message: '请选择商品性质'},
        name: {required: true, type: 'array', message: '请选择商品名字'}
      },
      goodsHomeForm: {
        type: '',
        status: '',
        name: [],
        classify: []
      },
      goodsHomeFormRules: {
        type: {required: true, message: '请选择商品性质'},
        status: {required: true, message: '请选择类型'},
        name: {required: true, type: 'array', message: '请选择商品名字'},
        classify: {required: true, type: 'array', message: '请选择商品分类'}
      },
      goods: {
        ordinaryGoods: [],
        classify: [],
        buyOffGoods: [],
        status: ['单品', '分类'],
        nature: ['非买断商品', '买断商品'],
        name: ''
      },
      advertRule: {
        changeFile: [
          {required: true, message: '请上传图片'}
        ],
        name: [
          {required: true, message: '请输入分类名称'}
        ]
      },
      activeName: 'credit1',
      dialogFormVisible1: false,
      dialogFormVisible2: false,
      dialogHomeVisible: false,
      recommendTitle: {
        title: '新建首页分类',
        btn: '新建'
      },
      tableData: [],
      tableGoods: [],
      tableHead: {
        credit2: [
          {name: 'name', value: '分类名称'},
          {name: 'count', value: '商品总数量（件）'}
        ],
        credit3: [
          {name: 'name', value: '商品名称'},
          {name: 'price', value: '上架单价（元）'},
          {name: 'url',
            value: '商品性质',
            formatter: function (row) {
              return row.url && row.url.indexOf('goodsDetail') >= 0 ? '非买断商品' : '买断商品'
            }}
        ],
        credit4: [
          {name: 'name', value: '商品名称'},
          {name: 'price', value: '上架单价（元）'},
          {name: 'url',
            value: '商品性质',
            formatter: function (row) {
              return row.url && row.url.indexOf('goodsDetail') >= 0 ? '非买断商品' : '买断商品'
            }}
        ],
        credit5: [
          {name: 'name', value: '商品名称'},
          {name: 'price', value: '上架单价（元）'},
          {name: 'url',
            value: '商品性质',
            formatter: function (row) {
              return '非买断商品'
            }}
        ],
        credit6: [
          {name: 'name', value: '商品名称'},
          {name: 'price', value: '上架单价（元）'},
          {name: 'url',
            value: '商品性质',
            formatter: function (row) {
              return '买断商品'
            }}
        ]
      }
    }
  },
  computed: {
    activeType () {
      return +this.activeName.replace('credit', '')
    }
  },
  created () {
    var that = this
    var list = [
      {
        label: '首页分类商品',
        id: 177,
        name: 'credit1'
      },
      {
        label: '分类商品排序',
        id: 221,
        name: 'credit2'
      },
      {
        label: '精选商品',
        id: 178,
        name: 'credit3'
      },
      {
        label: '推荐商品',
        id: 179,
        name: 'credit4'
      },
      {
        label: '店铺分享商品',
        id: 180,
        name: 'credit5'
      },
      {
        label: '店铺买断商品',
        id: 181,
        name: 'credit6'
      }
    ]
    var currentList = this.$common.powerFilter(list)
    this.activeName = currentList[0].name
    this.orderList = currentList
    this.pageData()
    this.getGoods()
    this.$axios({
      method: 'get',
      url: 'item/getCatList.action'
    }).then(function (res) {
      that.goods.classify = res
    })
  },
  methods: {
    selectGoods (formName) {
      if (this.$common.isNull(this[formName].type)) {
        return []
      }
      return +this[formName].type === 0 ? this.goods.ordinaryGoods : this.goods.buyOffGoods
    },
    openGoods () {
      if (this.activeType >= 5) {
        this.goodsForm.type = this.activeType === 5 ? 0 : 1
      }
      this.dialogFormVisible2 = true
    },
    getGoods () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'system/getGoodsAll.action'
      }).then(function (res) {
        if (res.length) {
          that.goods.ordinaryGoods = res.map(item => { return {id: item.id, name: item.name} })
        }
      })
      this.$axios({
        method: 'get',
        url: 'system/getGoodsOverstockAll.action'
      }).then(function (res) {
        if (res.length) {
          that.goods.buyOffGoods = res.map(item => { return {id: item.id, name: item.name} })
        }
      })
    },
    pageData (type) {
      var that = this
      var url = 'system/getGoodsHomeAll.action'
      var searchType = this.activeType
      if (searchType === 2) {
        url = 'getHomeCategoryGoodsList.action'
      } else if (searchType >= 3) {
        url = 'system/getGoodsQualityList.action'
      }
      if (type && !this.$common.isNull(this.ruleForm2.name)) {
        this.ruleForm2.name = ''
      }
      this.$axios({
        method: 'get',
        url: url,
        params: {
          imgType: searchType,
          keyword: that.ruleForm2.name
        }
      }).then(function (res) {
        that.tableData = res.rows || res
      }).catch(() => {
        that.tableData = []
      })
    },
    handleRemove (type, data, index) {
      var that = this
      var isHome = this.$common.isNull(index)
      if (type === 1) {
        return (file, fileList) => {
          if (isHome && !that.advertForm[data].length) {
            return true
          }
          return this.$confirm(`确定移除此图片吗？`)
        }
      } else {
        return (file, fileList) => {
          if (isHome) {
            that.advertForm[data] = []
          } else {
            var currentVal = this.tableData[index]
            currentVal.homepageCategoryImg = null
            this.tableData.splice(index, 1, currentVal)
          }
        }
      }
    },
    imgOK (a, currentIndex) {
      return (response, file, fileList) => {
        if (!this.$common.imgRes(response)) {
          fileList.pop()
          return
        }
        if (!this.$common.isNull(currentIndex)) {
          var currentVal = this.tableData[currentIndex]
          currentVal.homepageCategoryImg = response.data.url
          this.tableData.splice(currentIndex, 1, currentVal)
          return
        }
        var index = this.advertForm[a].length
        this.advertForm[a].push(
          {
            name: '第' + (index + 1) + '张',
            url: response.data.url
          }
        )
      }
    },
    submitAdvert (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios({
            method: 'post',
            url: 'system/addGoodsHomepageCategory.action',
            data: {
              name: that.advertForm.name,
              img: that.advertForm.changeFile[0].url
            }
          }).then(function () {
            that.$message.success('操作成功')
            that.dialogFormVisible1 = false
            that.pageData()
          })
        }
      })
    },
    addHome () {
      if (this.tableData.length >= 8) {
        this.$message.warning('最多添加8个首页分类')
        return
      }
      this.dialogFormVisible1 = true
    },
    homeGoodsClick (type, data, index) {
      var that = this
      if (type <= 3) {
        var seatUrl = ['system/setGoodsHomeTop.action', 'system/setGoodsHomeUp.action', 'system/setGoodsHomeDown.action']
        this.$axios({
          method: 'post',
          url: seatUrl[type - 1],
          data: {
            goodsHomepageCategoryId: that.tableData[index].goodsHomepageCategoryId,
            goodsId: data.goodsHomeId,
            category: data.category
          }
        }).then(function () {
          that.$message.success('操作成功')
          that.pageData()
        })
      } else {
        this.$confirm('是否确认删除此商品', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'system/delGoodsHome.action',
            data: {
              goodsHomepageCategoryId: that.tableData[index].goodsHomepageCategoryId,
              goodsId: data.goodsHomeId,
              category: data.category
            }
          }).then(function () {
            that.$message.success('操作成功')
            that.pageData()
          })
        }).catch(() => {
        })
      }
    },
    otherClick (data, type) {
      var that = this
      var searchType = this.activeType
      if (type < 3) {
        var seatUrl = ['system/setGoodsQualityTop.action', 'system/setGoodsQualityUp.action', 'system/setGoodsQualityDown.action']
        this.$axios({
          method: 'post',
          url: seatUrl[type],
          data: {
            id: data.id,
            imgType: searchType
          }
        }).then(function () {
          that.$message.success('操作成功')
          that.pageData()
        })
      } else {
        this.$confirm('是否确认删除此商品', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'system/delGoodsQuality.action',
            data: {
              id: data.id,
              imgType: searchType
            }
          }).then(function () {
            that.$message.success('操作成功')
            that.pageData()
          })
        }).catch(() => {
        })
      }
    },
    controlClick (type, index) {
      var that = this
      if (type < 3) {
        var seatUrl = ['system/setHomePageCategoryUp.action', 'system/setHomePageCategoryDown.action']
        this.$axios({
          method: 'post',
          url: seatUrl[type - 1],
          data: {homepageCategoryId: that.tableData[index].goodsHomepageCategoryId}
        }).then(function () {
          that.$message.success('操作成功')
          that.pageData()
        })
      } else {
        if (type === 3) {
          this.$confirm('是否确认删除此分类位', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            that.$axios({
              method: 'post',
              url: 'system/delHomePageCategoryById.action',
              data: {homepageCategoryId: that.tableData[index].goodsHomepageCategoryId}
            }).then(function () {
              that.$message.success('操作成功')
              that.pageData()
            })
          }).catch(() => {
          })
        } else if (type === 5) {
          that.$axios({
            method: 'post',
            url: 'system/addGoodsHomepageCategory.action',
            data: {
              goodsHomepageCategoryId: that.tableData[index].goodsHomepageCategoryId,
              name: that.tableData[index].homepageCategoryName,
              img: that.tableData[index].homepageCategoryImg
            }
          }).then(function (res) {
            that.$message.success('操作成功')
          })
        } else {
          that.dialogHomeVisible = true
          that.goodsHomeForm.id = that.tableData[index].goodsHomepageCategoryId
        }
      }
    },
    classifyClick (data) {
      var that = this
      if (+data.count <= 0) {
        that.$message.warning('此分类暂无商品')
        return
      }
      this.$axios({
        method: 'post',
        url: 'getHomeCategoryGoodsOrderList.action',
        data: {
          id: data.id,
          keywords: that.goods.name
        }
      }).then(function (res) {
        that.tableGoods = res
        that.recommendTitle = {
          title: '分类页商品排序(总排序' + data.count + ')',
          count: +data.count,
          id: data.id
        }
        that.dialogFormVisible1 = true
      })
    },
    setCurrentRow (i) {
      this.$refs.table.setCurrentRow(this.tableData3[i - 1])
      const targetTop = this.$refs.table.$el.querySelectorAll('.el-table__body tr')[i - 1].getBoundingClientRect().top
      const containerTop = this.$refs.table.$el.querySelector('.el-table__body').getBoundingClientRect().top
      const scrollParent = this.$refs.table.$el.querySelector('.el-table__body-wrapper')
      scrollParent.scrollTop = targetTop - containerTop
    },
    /* classifyPosition (type, index) {
      switch (type) {
        case 0:
          var top = this.tableGoods.splice(index, 1)
          this.tableGoods.unshift(top[0])
          break
        case 1:
          var prev = this.tableGoods[index * 1 - 1]
          this.tableGoods[index - 1] = this.tableGoods[index]
          this.tableGoods.splice(index, 1, prev)
          break
        case 2:
          var next = this.tableGoods[index * 1 + 1]
          this.tableGoods[index + 1] = this.tableGoods[index]
          this.tableGoods.splice(index, 1, next)
          break
      }
    }, */
    classifySet (data, type) {
      var that = this
      var seatUrl = ['categoryGoodsTop.action', 'categoryGoodsUp.action', 'categoryGoodsDown.action']
      this.$axios({
        method: 'get',
        url: seatUrl[type],
        params: {
          categoryId: that.recommendTitle.id,
          goodsId: data.row.id
        }
      }).then(function () {
        that.$message.success('操作成功')
        that.classifyClick({id: that.recommendTitle.id, count: that.recommendTitle.count})
      })
    },
    resetForm (formName) {
      if (formName === 'goodsForm') {
        this.goodsForm = {
          type: '',
          name: []
        }
        this.$refs[formName].resetFields()
        return
      }
      if (formName === 'goodsHomeForm') {
        this.goodsHomeForm = {
          type: '',
          status: '',
          name: [],
          classify: []
        }
        this.$refs[formName].resetFields()
        return
      }
      if (this.activeName === 'credit1') {
        this.advertForm = {
          changeFile: [],
          name: ''
        }
        this.$refs[formName].resetFields()
      }
      this.goods.name = ''
      this.recommendTitle = {
        title: '新建首页分类',
        btn: '新建'
      }
    },
    addGoodsClassify (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (formName === 'goodsForm') {
            that.$axios({
              method: 'post',
              url: 'system/addGoodsQuality.action',
              data: {
                ids: that.goodsForm.name,
                imgType: that.activeType,
                type: that.goodsForm.type
              }
            }).then(function () {
              that.$message.success('操作成功')
              that.dialogFormVisible2 = false
              that.pageData()
            })
          } else {
            that.$axios({
              method: 'post',
              url: 'system/addGoodsHome.action',
              data: {
                goodsHomepageCategoryId: that.goodsHomeForm.id,
                goodsIds: +that.goodsHomeForm.status === 0 ? that.goodsHomeForm.name : that.goodsHomeForm.classify,
                category: +that.goodsHomeForm.type + 1,
                type: that.goodsHomeForm.status
              }
            }).then(function () {
              that.$message.success('操作成功')
              that.dialogHomeVisible = false
              that.pageData()
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
