<template>
  <div>
    <div v-if="!showDetail" key="showDetail1">
      <el-form size="small" ref="ruleForm2" :inline="true" :model.sync="ruleForm2" :rules="ruleForm2Rules">
        <el-form-item prop="goodsType" label="商品类型：" >
          <el-select v-model="ruleForm2.goodsType" style="width: 140px">
            <el-option v-for="(item,index) in goods.type" :key="index" :label="item.name" :value="item.categoryId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="storeStart" label="库存量：">
          <el-input :maxlength=13 style="width: 100px" v-model="ruleForm2.storeStart" ></el-input>
        </el-form-item>
        <el-form-item prop="storeEnd" label="-">
          <el-input :maxlength=13 style="width: 100px" v-model="ruleForm2.storeEnd" ></el-input>
        </el-form-item>
        <el-form-item prop="storeWay" label="商品性质：" >
          <el-select v-model="ruleForm2.goodsNature" style="width: 140px">
            <el-option v-for="(item,index) in goods.nature" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item prop="storeWay" label="仓储方式：" >
          <el-select v-model="ruleForm2.storeWay" style="width: 140px">
            <el-option v-for="(item,index) in goods.storage" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="goodsName">
          <el-input :maxlength=20 v-model="ruleForm2.goodsName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  type="primary" @click="resetForm('ruleForm2')">重置</el-button>
          <el-button  type="primary" @click="submitForm('ruleForm2')">搜索</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-table class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column align="center" prop="goodsName" label="商品名称"></el-table-column>
          <el-table-column align="center"  label="申请时间">
            <template slot-scope="scope">
              {{scope.row.createTime | dateFormat(1)}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="categoryName" label="商品分类"></el-table-column>
          <el-table-column align="center" prop="goodsType" label="商品性质"></el-table-column>
          <el-table-column align="center" prop="goodsWarehouseType" label="仓储方式"></el-table-column>
          <el-table-column align="center" prop="status" label="申请内容"></el-table-column>
          <el-table-column align="center" label="申请人">
            <template slot-scope="scope">
              {{scope.row.userName}}（{{scope.row.mobile}}）
            </template>
          </el-table-column>
          <el-table-column align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row,1)" type="text" size="mini">立即处理</el-button>
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
    </div>
    <div v-else key="showDetail2">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click.native="resetForm('ruleForm','showDetail')">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>{{controlType.title}}</el-breadcrumb-item>
      </el-breadcrumb>
      <div>
        <el-form :disabled="!controlType.btn" size="mini"  :inline="true" :model.sync="ruleForm" :rules="rules" ref="ruleForm" status-icon>
          <p>一、商品基本信息</p>
          <el-form-item prop="goodsName" label="商品名称：">
            <el-input  v-model="ruleForm.goodsName" placeholder="请输入商品名称"></el-input>
          </el-form-item>
          <el-form-item prop="goodsType" label="商品分类：" >
            <el-select @change="addGoods" v-model="ruleForm.goodsType" style="width: 140px">
              <el-option v-for="(item,index) in goods.type" v-if="index>0" :key="index" :label="item.name" :value="item.categoryId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="ruleForm.type*1===2||ruleForm.type*1===3" prop="goodsNature" label="商品性质：" >
            <el-select v-model="ruleForm.goodsNature" style="width: 140px">
              <el-option v-for="(item,index) in goods.pledgeType"  :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="goodsBrand"  label="品牌：" >
            <el-select v-model="ruleForm.goodsBrand" style="width: 140px">
              <el-option v-for="(item,index) in goods.brand" :key="index" :label="item.brandName" :value="item.brandId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="checkDeposit" label="是否需要定金:">
            <el-checkbox v-model="ruleForm.checkDeposit"></el-checkbox>
          </el-form-item>
          <el-form-item v-if="ruleForm.checkDeposit" prop="goodsDeposit">
            <el-input  :maxlength=7  v-model="ruleForm.goodsDeposit" placeholder="请输入定金"></el-input>
          </el-form-item>
          <el-form-item prop="goodsGiveMoney" label="分红金额：">
            <el-input  :maxlength=13  v-model="ruleForm.goodsGiveMoney" placeholder=""></el-input>
          </el-form-item>
          <el-form-item prop="goodsReward" label="奖励金额：">
            <el-input  :maxlength=13  v-model="ruleForm.goodsReward" placeholder=""></el-input>
          </el-form-item>
          <br>
          <el-table v-if="goodsFormatData.length" style="margin-top: 10px"     border   max-height="400"   :data="goodsFormatData">
            <el-table-column v-for="(item,index) in goodsFormatForm"  :key="index" align="center" :prop="index" :label="index"></el-table-column>
          </el-table>
          <p>二、商品宣传信息</p>
          <el-form-item prop="propagateFile" inline-message label="商品宣传图片：(最多上传5张,点击图片列表可更改)" >
            <div style="width: 200px"></div>
          </el-form-item>
          <br>
          <el-upload
            action="https://jsonplaceholder.typicode.com/posts/"
            :file-list="ruleForm.propagateFile"
            :before-upload="$common.beforeImg"
            :limit="5"
            :on-exceed="$common.imgLimit"
            :on-error="$common.imgError"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <br>
          <el-form-item :label-position="'top'" prop="goodsDetailFile" label="商品详情图片：（最多上传10张）" >
            <div style="width: 200px"></div>
          </el-form-item>
          <el-upload
            action="https://jsonplaceholder.typicode.com/posts/"
            name="uploadFile"
            :file-list="ruleForm.goodsDetailFile"
            :before-upload="$common.beforeImg"
            :limit="10"
            :on-exceed="$common.imgLimit"
            :on-error="$common.imgError"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
            <p>三、商品参数</p>
            <el-table v-if="goodsParametersData.length"  ref="goodsParametersTable"   border   max-height="400"   :data="goodsParametersData">
              <el-table-column align="center" prop="title" label="商品参数标题"></el-table-column>
              <el-table-column align="center" prop="detail" label="参数详情"></el-table-column>
            </el-table>
            <p>四、商品服务项</p>
            <div v-if="goods.server.length">
            <el-checkbox :indeterminate="serverList.isIndeterminate" v-model="serverList.checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <div style="margin: 15px 0;"></div>
            <el-checkbox-group v-model="serverList.checkedServer" @change="handleCheckedServerChange">
              <el-checkbox v-for="item in goods.server" :label="item.id.toString()" :key="item.id">{{item.name}}</el-checkbox>
            </el-checkbox-group>
          </div>
            <p>五、支付/运输方式选择</p>
          <el-form-item prop="paymentMethod" label="支付方式选择：">
            <el-radio v-model="ruleForm.paymentMethod" :label="0">在线支付</el-radio>
          </el-form-item>
          <br>
          <el-form-item prop="delivery" label="配送方式：">
            <el-radio v-for="item in goods.way"  :key="item.id" v-model="ruleForm.delivery" :label="item.id">{{item.name}}</el-radio>
          </el-form-item>
          <template v-if="ruleForm.delivery!==0">
            <p v-if="ruleForm.selfAddressAll.province">
              <span>已添加自取地址：</span>
              <el-tag :closable="controlType.btn?true:false" @close="ruleForm.selfAddressAll={}">
                地址:
                {{ruleForm.selfAddressAll.province+ruleForm.selfAddressAll.city+ruleForm.selfAddressAll.area+ruleForm.selfAddressAll.address}}
                联系人：
                {{ruleForm.selfAddressAll.name}}
                联系方式：
                {{ruleForm.selfAddressAll.mobile}}
              </el-tag>
            </p>
          </template>
          <p>六、仓储方式</p>
          <el-form-item prop="storageMethod"  label="仓储方式：" >
            <el-select v-model="ruleForm.storageMethod" style="width: 140px">
              <el-option v-for="(item,index) in goods.storage" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <br>
          <el-form-item  prop="storageAddressAll"  label="仓储地址：" >
            <p  v-if="ruleForm.storageAddressAll.province">
              <el-tag style="vertical-align: middle" :closable="controlType.btn?true:false" @close="ruleForm.storageAddressAll={}">
                地址:
                {{ruleForm.storageAddressAll.province+ruleForm.storageAddressAll.city+ruleForm.storageAddressAll.area+ruleForm.storageAddressAll.address}}
                联系人：
                {{ruleForm.storageAddressAll.name}}
                联系方式：
                {{ruleForm.storageAddressAll.mobile}}
              </el-tag>
            </p>
          </el-form-item>
        </el-form>
        <p style="text-align: right">
          <el-button @click="addGoodsOk(1)" size="small"  type="primary">驳回申请</el-button>
          <el-button @click="addGoodsOk(2)" size="small"  type="primary">确认下架</el-button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'goods-off',
  components: {adminAddress},
  data () {
    var that = this
    return {
      controlType: {
        title: '商品下架申请',
        btn: ''
      },
      goodsFormatForm: {},
      goodsFormatData: [],
      serverList: {
        checkAll: false,
        checkedServer: [],
        isIndeterminate: false
      },
      ruleForm2Rules: {
        storeStart: [
          {validator: that.$common.integer}
        ],
        storeEnd: [
          {
            validator: function (rule, value, callback) {
              if (value && !that.$common.integer(1, value)) {
                return callback(new Error('请输入整数'))
              }
              if (value && (value * 1 <= that.ruleForm2.storeStart * 1)) {
                return callback(new Error('应大于库存起始值'))
              }
              callback()
            }
          }
        ]
      },
      rules: {
        paymentMethod: [
          {required: true, message: ''}
        ],
        delivery: [
          {required: true, message: ''}
        ],
        goodsDeposit: [
          {required: true, message: '请输入定金'},
          {validator: that.$common.integer}
        ],
        goodsBrand: [
          {required: true, message: '请选择商品品牌'}
        ],
        goodsName: [
          {required: true, message: '请输入商品名称'}
        ],
        goodsType: [
          {required: true, message: '请选择商品类型'}
        ],
        propagateFile: [
          {required: true, message: '请上传商品宣传图片'}
        ],
        goodsDetailFile: [
          {required: true, message: '请上传商品详情图片'}
        ],
        storageMethod: [
          {required: true, message: ''}
        ],
        goodsGiveMoney: [
          {required: true, message: ''}
        ],
        goodsReward: [
          {required: true, message: ''}
        ]
      },
      showDetail: false,
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      goodsParametersData: [],
      tableData: [],
      goods: {
        server: [],
        brand: [],
        type: [
          {name: '全部', categoryId: ''}
        ],
        pledgeType: [
          {name: '虚拟质押', id: 3},
          {name: '商品质押', id: 2}
        ],
        way: [
          {name: '全部', id: 2},
          {name: '快递', id: 0},
          {name: '自取', id: 1}
        ],
        nature: [
          {name: '全部', id: ''},
          {name: '虚拟质押', id: 3},
          {name: '商品质押', id: 2},
          {name: '自营商品', id: 0},
          {name: '常规商品', id: 1}
        ],
        storage: [
          {name: '全部', id: ''},
          {name: '平台仓储', id: 0},
          {name: '货源自主仓储', id: 1}
        ]
      },
      ruleForm2: {
        goodsName: '',
        goodsType: '',
        storeStart: '',
        storeEnd: '',
        goodsNature: '',
        storeWay: ''
      },
      ruleForm: {
        goodsName: '',
        goodsNature: '',
        goodsOnPrice: '',
        goodsGiveMoney: '',
        goodsReward: '',
        storageMethod: '',
        storageAddressAll: {},
        selfAddressAll: {},
        checkDeposit: '',
        goodsDeposit: '',
        goodsType: '',
        goodsBrand: '',
        paymentMethod: 0,
        delivery: 0,
        propagateFile: [],
        goodsDetailFile: []
      }
    }
  },
  created () {
    var that = this
    this.$axios({
      method: 'get',
      url: 'item/getCatList.action'
    }).then(function (res) {
      that.goods.type = that.goods.type.concat(res)
    })
    that.$axios({
      method: 'get',
      url: 'supply/getServiceAll.action'
    }).then(function (res) {
      that.goods.server = res
    })
    that.pageData()
  },
  methods: {
    addGoods () {
      var that = this
      that.$axios({
        method: 'get',
        url: 'item/getBrandList.action',
        params: {
          categoryId: that.ruleForm.goodsType,
          isFenye: 0
        }
      }).then(function (res) {
        that.goods.brand = res
        if (that.ruleForm.goodsBrand) {
          var isHave = that.$common.findElem(that.goods.brand, 'brandId', that.ruleForm.goodsBrand)
          if (isHave === -1) {
            that.ruleForm.goodsBrand = ''
          }
        }
      })
    },
    getSkuKey (fn) {
      var that = this
      if (this.$common.isNull(that.ruleForm.goodsType)) {
        that.$message.warning('请先选择分类')
        return
      }
      that.$axios({
        method: 'get',
        url: '/skuKey.action',
        params: {
          categoryId: that.ruleForm.goodsType
        }
      }).then(function (res) {
        var skuKey = {}
        res.forEach(function (val) {
          skuKey[val.skuKey] = ''
        })
        skuKey['零售价'] = ''
        skuKey['库存量'] = ''
        skuKey['上架单价'] = ''
        that.goodsFormatForm = skuKey
        if (fn) {
          fn()
          return
        }
        that.dialogGoodsFormat = true
      })
    },
    pageData () {
      var that = this
      this.$axios({
        method: 'post',
        url: 'goods/getGoodsAuditList.action',
        data: {
          pages: that.currentPage1,
          startStock: that.ruleForm2.storeStart,
          endStock: that.ruleForm2.storeEnd,
          goodsType: that.ruleForm2.goodsNature,
          rows: that.pageSize,
          goodsName: that.ruleForm2.goodsName,
          categoryId: that.ruleForm2.goodsType,
          goodsWarehouseType: that.ruleForm2.storeWay
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    addGoodsOk (type) {
      var that = this
      if (type === 1) {
        this.$prompt('内容：', '拒绝理由', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入拒绝理由',
          inputValidator: function (value) {
            if (!value) {
              return '请输入内容'
            }
            return true
          }
        }).then(({ value }) => {
          that.$axios({
            method: 'post',
            url: 'goods/goodsCancel.action',
            data: {
              goodsApplyId: that.ruleForm.id,
              reason: value
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.resetForm('ruleForm', 'showDetail')
            that.showDetail = false
            that.pageData()
          })
        }).catch(() => {

        })
      } else {
        this.$confirm(that.ruleForm.goodsName + '，将自动下架，下架后不可恢复', '确认下架', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'goods/goodsShelvest.action',
            data: {
              goodsApplyId: that.ruleForm.id
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.resetForm('ruleForm', 'showDetail')
            that.showDetail = false
            that.pageData()
          })
        }).catch(() => {
        })
      }
    },
    handleCheckAllChange (val) {
      this.serverList.checkedServer = val ? this.goods.server.map(function (item) {
        return item.id.toString()
      }) : []
      this.serverList.isIndeterminate = false
    },
    handleCheckedServerChange (value) {
      let checkedCount = value.length
      this.serverList.checkAll = checkedCount === this.goods.server.length
      this.serverList.isIndeterminate = checkedCount > 0 && checkedCount < this.goods.server.length
    },
    handleCurrentChange () {
      this.pageData()
    },
    submitForm () {
      var that = this
      this.$refs['ruleForm2'].validate((valid) => {
        if (valid) {
          that.currentPage1 = 1
          that.pageData()
        }
      })
    },
    resetForm (formName, data) {
      if (!data) {
        this.ruleForm2 = {
          goodsName: '',
          goodsType: '',
          storeStart: '',
          storeEnd: '',
          goodsNature: '',
          storeWay: ''
        }
      }
      if (data) {
        this.goodsParameters = {
          title: '',
          detail: ''
        }
        this.serverList = {
          checkAll: false,
          checkedServer: [],
          isIndeterminate: false
        }
        this.ruleForm = {
          goodsName: '',
          goodsGiveMoney: '',
          goodsReward: '',
          storageMethod: '',
          storageAddressAll: {},
          selfAddressAll: {},
          checkDeposit: '',
          goodsDeposit: '',
          goodsType: '',
          goodsBrand: '',
          paymentMethod: 0,
          delivery: 0,
          propagateFile: [],
          goodsDetailFile: []
        }
        this[data] = false
        this.goods.brand = []
        this.goodsParametersData = []
        this.goodsFormatData = []
        this.controlType = {
          title: '商品下架申请',
          btn: ''
        }
      }
      this.$refs[formName].resetFields()
    },
    handleClick (data, type) {
      var that = this
      that.$axios({
        method: 'get',
        url: 'supply/searchSubpplyDetail.action',
        params: {
          goodsId: data.goodsId
        }
      }).then(function (res) {
        var currentForm = {
          id: data.goodsApplyId,
          reason: res.reason || '',
          goodsGiveMoney: res.goods.rebate ? (res.goods.rebate / 100).toFixed(2) : '',
          goodsReward: res.goods.reword ? (res.goods.reword / 100).toFixed(2) : '',
          type: res.goods.type,
          goodsName: res.goods.name,
          goodsNature: res.goods.type || '',
          pledgeEndTime: res.goods.limitTime ? that.$options.filters['dateFormat'](res.goods.limitTime, 1) : '',
          goodsType: res.goods.categoryId,
          status: res.goods.status,
          goodsBrand: res.goods.brandId,
          checkDeposit: +res.goods.deposit > 0,
          goodsDeposit: res.goods.deposit > 0 ? Math.round(res.goods.deposit / 100) : '',
          paymentMethod: res.goods.payType,
          delivery: res.goods.getWay,
          storageMethod: res.goodsWarehouse ? res.goodsWarehouse.type : '',
          storageAddressAll: (function () {
            if (res.goodsWarehouse) {
              return {
                province: res.goodsWarehouse.province,
                city: res.goodsWarehouse.city,
                area: res.goodsWarehouse.area,
                address: res.goodsWarehouse.address,
                mobile: res.goodsWarehouse.mobile,
                name: res.goodsWarehouse.name
              }
            } else {
              return {}
            }
          })(),
          selfAddressAll: (function () {
            if (res.goodsAddress) {
              return {
                province: res.goodsAddress.province,
                city: res.goodsAddress.city,
                area: res.goodsAddress.area,
                address: res.goodsAddress.address,
                mobile: res.goodsAddress.mobile,
                name: res.goodsAddress.name
              }
            } else {
              return {}
            }
          })(),
          propagateFile: res.goods.imgs.split(';').map(function (item, index) {
            return {
              name: '第' + (index * 1 + 1) + '张',
              url: item
            }
          }),
          goodsDetailFile: res.goods.detail.split(';').map(function (item, index) {
            return {
              name: '第' + (index * 1 + 1) + '张',
              url: item
            }
          })
        }
        that.ruleForm = currentForm
        if (res.goods.param && res.goods.param !== '{}') {
          var paramArr = []
          var paramJson = JSON.parse(res.goods.param)
          for (var key in paramJson) {
            paramArr.push({title: key, detail: paramJson[key]})
          }
          that.goodsParametersData = paramArr
        }

        if (res.goods.serviceId) {
          that.serverList.checkedServer = res.goods.serviceId.split(';')
          that.handleCheckedServerChange(that.serverList.checkedServer)
        }
        that.getSkuKey(function () {
          if (res.skuList) {
            var skuKey = []
            res.skuList.forEach(function (val) {
              var curKey = JSON.parse(val.sku)
              curKey['零售价'] = (val.pricePurchase / 100).toFixed(2)
              curKey['上架单价'] = val.priceSales ? (val.priceSales / 100).toFixed(2) : ''
              curKey['库存量'] = val.stock
              skuKey.push(curKey)
            })
            that.goodsFormatData = skuKey
          }
        })
        that.addGoods()
        that.showDetail = true
      })
    }
  }
}
</script>

<style scoped>
.from-detail>div:first-child{
  float: left;
  text-align: center;
}
.from-detail>div:last-child{
  width: 100%;
  padding-left: 200px;
}
</style>
