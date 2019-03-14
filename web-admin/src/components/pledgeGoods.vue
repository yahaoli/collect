<template>
  <div>
    <div v-if="!showDetail" key="showDetail1">
      <el-form size="small" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
        <el-form-item prop="goodsType" label="商品类型：" >
          <el-select v-model="ruleForm2.goodsType" style="width: 140px">
            <el-option v-for="(item,index) in goods.type" :key="index" :label="item.name" :value="item.categoryId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="goodsStatus"  label="商品状态：" >
          <el-select v-model="ruleForm2.goodsStatus" style="width: 140px">
            <el-option v-for="(item,index) in goods.status" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="takeWay" label="取货方式：" >
          <el-select v-model="ruleForm2.takeWay" style="width: 140px">
            <el-option v-for="(item,index) in goods.way" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="storeWay" label="仓储方式：" >
          <el-select v-model="ruleForm2.storeWay" style="width: 140px">
            <el-option v-for="(item,index) in goods.storage" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="storeWay" label="商品性质：" >
          <el-select v-model="ruleForm2.goodsNature" style="width: 140px">
            <el-option v-for="(item,index) in goods.nature" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="goodsName">
          <el-input @keyup.enter.native="submitForm()" :maxlength=20 v-model="ruleForm2.goodsName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  type="primary" @click="resetForm('ruleForm2')">重置</el-button>
          <el-button  type="primary" @click="submitForm()">搜索</el-button>
        </el-form-item>
      </el-form>
      <div>
        <div style="margin-bottom: 10px">
          <span>授信总金额：{{(goodsTotal.totalMortgage/100).toFixed(2)}}元   质押商品总库存：{{goodsTotal.totalStock}}件   质押总商品总价：{{(goodsTotal.totalPrice/100).toFixed(2)}}元</span>
          <el-button v-if="$common.havePower(43)" style="float: right" @click="showDetail = true" type="primary" size="mini">新增质押商品</el-button>
        </div>
        <el-table  ref="multipleTable" class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column align="center" prop="goodsName" label="商品名称"></el-table-column>
          <el-table-column align="center" prop="category" label="商品分类"></el-table-column>
          <el-table-column
            align="center"
            prop="price"
            label="零售价（元）">
          </el-table-column>
          <el-table-column align="center" prop="stock" label="库存量（件）"></el-table-column>
          <el-table-column align="center" prop="statusName" label="商品状态"></el-table-column>
          <el-table-column align="center" prop="property" label="商品性质"></el-table-column>
          <el-table-column align="center" prop="limitTime" label="质押截止日期">
            <template slot-scope="scope">
              {{scope.row.limitTime | dateFormat(1)}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(42)" @click="handleClick(scope.row,1)" type="text" size="mini">查看</el-button>
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
      <p v-if="ruleForm.reason">
        <i class="el-icon-warning" style="color: red"></i>
        <span>驳回申请理由：{{ruleForm.reason}}</span>
      </p>
      <div>
        <el-form :disabled="!controlType.btn" size="mini"  :inline="true" :model.sync="ruleForm" :rules="rules" ref="ruleForm" status-icon>
          <p>一、商品基本信息</p>
          <el-form-item prop="goodsName" label="商品名称：">
            <el-input  v-model="ruleForm.goodsName" placeholder="请输入商品名称"></el-input>
          </el-form-item>
          <el-form-item  prop="goodsType" label="商品分类：" >
            <el-select @change="addGoods" v-model="ruleForm.goodsType" style="width: 140px">
              <el-option v-for="(item,index) in goods.type" v-if="index>0" :key="index" :label="item.name" :value="item.categoryId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="goodsNature" label="商品性质：" >
            <el-select v-model="ruleForm.goodsNature" style="width: 140px">
              <el-option v-for="(item,index) in goods.nature" v-if="index>0" :key="index" :label="item.name" :value="item.id"></el-option>
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
            <el-input  :maxlength=7  v-model="ruleForm.goodsDeposit" placeholder="请输入定金">
              <template slot="suffix">元</template>
            </el-input>
          </el-form-item>
          <br>
          <el-button :disabled="!controlType.btn" @click="getSkuKey()" size="small" type="primary">添加商品规格</el-button>
          <span>(最少添加一个规格)</span>
          <el-table v-if="goodsFormatData.length" style="margin-top: 10px"     border   max-height="400"   :data="goodsFormatData">
            <el-table-column v-for="(item,index) in goodsFormatForm"  v-if="index!=='id'" :key="index" align="center" :prop="index" :label="index === '零售价' ? '零售价（元）' : index"></el-table-column>
            <el-table-column align="center" prop="handle" label="操作">
              <template slot-scope="scope">
                <el-button @click="goodsFormatClick(scope,1)" type="text" :disabled="!controlType.btn" size="mini">修改</el-button>
                <el-button @click="goodsFormatClick(scope,2)" type="text" :disabled="!controlType.btn" size="mini">删除</el-button>
                <span class="admin-btn-set" v-if="+ruleForm.status===2&&$common.havePower(212)"  @click="goodsFormatClick(scope,3)">修改库存</span>
              </template>
            </el-table-column>
          </el-table>
          <p>二、商品宣传信息</p>
          <el-form-item prop="propagateFile" inline-message label="商品宣传图片：(最多上传5张,点击图片列表可更改)" >
            <div style="width: 200px"></div>
          </el-form-item>
          <br>
          <admin-upload
            :limit="5"
            :disabled="!controlType.btn"
            name="uploadFile"
            current="propagateFile"
            :fileList="ruleForm.propagateFile"
            :on-preview="handlePreview('propagateFile')"
            :on-remove="handleRemove"
            :on-position="imgPosition"
            :on-success="imgOK"
            action="pic/upload.action">
          </admin-upload>
          <br>
          <el-form-item :label-position="'top'" prop="goodsDetailFile" label="商品详情图片：（最多上传10张）" >
            <div style="width: 200px"></div>
          </el-form-item>
          <admin-upload
            :limit="10"
            name="uploadFile"
            :disabled="!controlType.btn"
            current="goodsDetailFile"
            :fileList="ruleForm.goodsDetailFile"
            :on-preview="handlePreview('goodsDetailFile')"
            :on-remove="handleRemove"
            :on-position="imgPosition"
            :on-success="imgOK"
            action="pic/upload.action">
          </admin-upload>
            <p>三、商品参数</p>
            <div style="margin-bottom: 10px">
              <span>商品参数标题：</span>
              <el-input size="mini" style="width: 200px"  :maxlength=10  v-model="goodsParameters.title" placeholder="请输入商品参数标题"></el-input>
              <span>参数详情：</span>
              <el-input size="mini" style="width: 300px"  :maxlength=50  v-model="goodsParameters.detail" placeholder="请输入参数详情"></el-input>
              <el-button :disabled="!controlType.btn" @click="addGoodsParameters" size="mini" type="primary">保存</el-button>
            </div>
            <el-table v-if="goodsParametersData.length"  ref="goodsParametersTable"   border   max-height="400"   :data="goodsParametersData">
              <el-table-column align="center" prop="title" label="商品参数标题"></el-table-column>
              <el-table-column align="center" prop="detail" label="参数详情"></el-table-column>
              <el-table-column align="center" prop="handle" label="操作">
                <template slot-scope="scope">
                  <el-button :disabled="!controlType.btn" @click="handleClick2(scope,1)" type="text" size="mini">修改</el-button>
                  <el-button :disabled="!controlType.btn" v-if="scope.$index!==0" @click="handleClick2(scope,2)" type="text" size="mini">上移</el-button>
                  <el-button :disabled="!controlType.btn" v-if="scope.$index!==(goodsParametersData.length-1)" @click="handleClick2(scope,3)" type="text" size="mini">下移</el-button>
                  <el-button :disabled="!controlType.btn" @click="handleClick2(scope,4)" type="text" size="mini">删除</el-button>
                </template>
              </el-table-column>
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
            <br>
            <el-form-item>
              <label style="color: #f56c6c">*</label><span>自取地址：</span>
              <adminAddress v-model="selfAddressList.storageAddress" @change="handleSelfCity" selectGrade="3"></adminAddress>
            </el-form-item>
            <el-form-item >
              <el-input  :maxlength=20  v-model="selfAddressList.storageAddressInfo" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input  :maxlength=20  v-model="selfAddressList.storageAddressName" placeholder="请输入联系人姓名"></el-input>
            </el-form-item>
            <el-form-item >
              <el-input  :maxlength=15  v-model="selfAddressList.storageAddressPhone" placeholder="请输入联系方式"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button :disabled="!controlType.btn" type="text" @click="addAddress('selfAddressList','selfAddressAll')" size="mini">添加</el-button>
            </el-form-item>
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
              <el-option v-for="(item,index) in goods.storage" v-if="index>0" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <br>
          <el-form-item>
            <label style="color: #f56c6c">*</label><span>仓储地址：</span>
            <adminAddress v-model="addressList.storageAddress" @change="handleCity" selectGrade="3" ></adminAddress>
          </el-form-item>
          <el-form-item >
            <el-input  :maxlength=20  v-model="addressList.storageAddressInfo" placeholder="请输入详细地址"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input  :maxlength=20  v-model="addressList.storageAddressName" placeholder="请输入联系人姓名"></el-input>
          </el-form-item>
          <el-form-item >
            <el-input  :maxlength=15  v-model="addressList.storageAddressPhone" placeholder="请输入联系方式"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="!controlType.btn" type="text" @click="addAddress('addressList','storageAddressAll')" size="mini">添加</el-button>
          </el-form-item>
          <p v-if="ruleForm.storageAddressAll.province">
            <span>已添加地址：</span>
            <el-tag :closable="controlType.btn?true:false" @close="ruleForm.storageAddressAll={}">
              地址:
              {{ruleForm.storageAddressAll.province+ruleForm.storageAddressAll.city+ruleForm.storageAddressAll.area+ruleForm.storageAddressAll.address}}
              联系人：
              {{ruleForm.storageAddressAll.name}}
              联系方式：
              {{ruleForm.storageAddressAll.mobile}}
            </el-tag>
          </p>
          <p>七、质押截止日期</p>
          <el-form-item prop="pledgeEndTime" label="商品销售截止日期：">
            <el-date-picker
              v-model="ruleForm.pledgeEndTime"
              type="date"
              :clearable="false"
              :picker-options="pickerOptions1"
              :editable="false"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <p v-if="controlType.btn" style="text-align: right">
          <el-button @click="addGoodsOk('ruleForm')" size="small"  type="primary">{{controlType.btn}}</el-button>
        </p>
      </div>
    </div>
    <el-dialog :title="goodsFormat.title" width="360px" :visible.sync="dialogGoodsFormat"  @close='resetGoodsFormat()'>
      <el-form  :inline="true" size="mini" :model.sync="goodsFormatForm" :rules="goodsFormatRules" ref="goodsFormatForm">
        <el-form-item v-for="(item,index) in goodsFormatForm"  v-if="index!=='id'" :key="index" :prop="index" :label="index+'：'" >
          <el-input :maxlength=30  v-model="goodsFormatForm[index]" :placeholder="'请输入'+index"  ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="goodsFormatSet('goodsFormatForm')">{{goodsFormat.btn}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改商品参数" width="360px" :visible.sync="dialogFormVisible">
      <el-form :inline="true" size="mini" :model.sync="goodsForm" :rules="goodsRules" ref="goodsForm" label-width="120px">
        <el-form-item prop="title" label="商品参数标题：" >
          <el-input :maxlength=10  v-model="goodsForm.title" placeholder="请输入商品参数标题"  ></el-input>
        </el-form-item>
        <el-form-item prop="detail" label="参数详情：" >
          <el-input :maxlength=50   v-model="goodsForm.detail"  placeholder="请输入参数详情"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="goodsSet('goodsForm')">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
import adminUpload from './common/admin-upload'
export default {
  name: 'pledge-goods',
  components: {adminAddress, adminUpload},
  data () {
    var that = this
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      dialogFormVisible: false,
      goodsFormatRules: {
        '零售价': [
          {required: true, message: '请输入零售价'},
          {validator: that.$common.numTo2}
        ],
        '库存量': [
          {required: true, message: '请输入库存量'},
          {validator: that.$common.integer}
        ]
      },
      goodsTotal: '',
      dialogGoodsFormat: false,
      goodsFormatForm: {},
      goodsFormatData: [],
      goodsFormat: {
        title: '新增商品规格',
        btn: '新增'
      },
      controlType: {
        title: '新建质押商品',
        btn: '新增质押'
      },
      addressList: {
        storageAddress: [],
        storageAddressInfo: '',
        storageAddressName: '',
        storageAddressPhone: ''
      },
      selfAddressList: {
        storageAddress: [],
        storageAddressInfo: '',
        storageAddressName: '',
        storageAddressPhone: ''
      },
      serverList: {
        checkAll: false,
        checkedServer: [],
        isIndeterminate: false
      },
      goodsForm: {
        title: '',
        detail: ''
      },
      goodsRules: {
        title: [
          {required: true, message: '请输入商品参数标题'}
        ],
        detail: [
          {required: true, message: '请输入参数详情'}
        ]
      },
      rules: {
        storageMethod: [
          {required: true, message: '请选择仓储方式'}
        ],
        goodsBrand: [
          {required: true, message: '请选择商品品牌'}
        ],
        goodsNature: [
          {required: true, message: '请选择商品性质'}
        ],
        goodsName: [
          {required: true, message: '请输入商品名称'}
        ],
        goodsType: [
          {required: true, message: '请选择商品类型'}
        ],
        goodsDeposit: [
          {required: true, message: '请输入定金'},
          {validator: that.$common.integer}
        ],
        goodsTotal: [
          {required: true, message: '请输入库存量'},
          {validator: that.$common.integer}
        ],
        propagateFile: [
          {required: true, message: '请上传商品宣传图片'}
        ],
        goodsDetailFile: [
          {required: true, message: '请上传商品详情图片'}
        ],
        pledgeEndTime: [
          {required: true, message: '请选择质押截止日期'}
        ]
      },
      multipleSelection: [],
      showDetail: false,
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      goodsParametersData: [],
      goodsParameters: {
        title: '',
        detail: ''
      },
      tableData: [],
      goods: {
        server: [],
        type: [
          {name: '全部', categoryId: ''}
        ],
        status: [
          {name: '全部', id: ''},
          {name: '未上架', id: 0},
          {name: '审核中', id: 3},
          {name: '已上架', id: 2},
          {name: '申请驳回', id: 4},
          {name: '已售罄', id: 5}
        ],
        way: [
          {name: '全部', id: 2},
          {name: '快递', id: 0},
          {name: '自取', id: 1}
        ],
        brand: [],
        storage: [
          {name: '全部', id: ''},
          {name: '平台仓储', id: 0},
          {name: '货源自主仓储', id: 1}
        ],
        nature: [
          {name: '全部', id: ''},
          {name: '虚拟质押', id: 3},
          {name: '商品质押', id: 2}
        ]
      },
      ruleForm2: {
        goodsName: '',
        goodsType: '',
        goodsStatus: '',
        storeWay: '',
        goodsNature: '',
        takeWay: ''
      },
      currentImg: {
        key: '',
        index: ''
      },
      ruleForm: {
        goodsName: '',
        pledgeEndTime: '',
        goodsNature: '',
        goodsType: '',
        goodsBrand: '',
        checkDeposit: '',
        goodsDeposit: '',
        paymentMethod: 0,
        delivery: 0,
        storageMethod: '',
        storageAddressAll: that.$common.storeData.storageAddress || {},
        selfAddressAll: {},
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
    this.$axios({
      method: 'get',
      url: 'supply/getMortgageTotal.action'
    }).then(function (res) {
      that.goodsTotal = res
    })
    that.$axios({
      method: 'get',
      url: 'supply/getServiceAll.action'
    }).then(function (res) {
      that.goods.server = res
    })
    this.pageData()
  },
  methods: {
    resetGoodsFormat () {
      this.$refs['goodsFormatForm'].resetFields()
      this.goodsFormat = {
        title: '新增商品规格',
        btn: '新增'
      }
      var current = this.goodsFormatForm
      for (var key in this.goodsFormatForm) {
        current[key] = ''
      }
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
        url: 'supply/getSelfItemList.action',
        data: {
          pages: that.currentPage1,
          warehouseType: that.ruleForm2.storeWay,
          categoryId: that.ruleForm2.goodsType,
          rows: that.pageSize,
          type: that.ruleForm2.goodsNature || 4,
          status: that.ruleForm2.goodsStatus,
          getWay: that.ruleForm2.takeWay,
          name: that.ruleForm2.goodsName
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    addAddress: function (dataName, formName) {
      if (this.ruleForm[formName].province) {
        this.$message({
          message: '请删除地址再添加新地址',
          type: 'warning'
        })
        return
      }
      var currentVal = this[dataName]
      if (currentVal.storageAddress.length && currentVal.storageAddressInfo && currentVal.storageAddressName && currentVal.storageAddressPhone) {
        if (!/^[0-9]+$/.test(currentVal.storageAddressPhone) && !/-/g.test(currentVal.storageAddressPhone)) {
          this.$message({
            message: '联系方式只能输入数字和-',
            type: 'warning'
          })
          return
        }
        this.ruleForm[formName] = {
          province: currentVal.storageAddress[0],
          city: currentVal.storageAddress[1],
          area: currentVal.storageAddress[2],
          address: currentVal.storageAddressInfo,
          mobile: currentVal.storageAddressPhone,
          name: currentVal.storageAddressName
        }
        return
      }
      this.$message({
        message: '请输入全部地址信息',
        type: 'warning'
      })
    },
    addGoodsOk (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var currentVal = that.ruleForm
          if (!currentVal.storageAddressAll.province) {
            that.$message.warning('请添加仓储地址')
            return
          }
          if (currentVal.delivery !== 0 && !currentVal.selfAddressAll.province) {
            that.$message.warning('请添加自取地址')
            return
          }
          if (that.goodsFormatData.length === 0) {
            that.$message.warning('请添加商品规格')
            return
          }
          if (!that.$common.skuCompare(that.goodsFormatData)) {
            that.$message.warning('商品规格不一致，请调整')
            return
          }
          var option = {
            name: currentVal.goodsName,
            limitTime: currentVal.pledgeEndTime,
            typeZhiya: currentVal.goodsNature,
            detail: that.$common.imgUrl(currentVal.goodsDetailFile),
            categoryId: currentVal.goodsType,
            imgs: that.$common.imgUrl(currentVal.propagateFile),
            brandId: currentVal.goodsBrand,
            param: that.$common.arrFomat(that.goodsParametersData),
            payType: 0,
            type: 2,
            getWay: currentVal.delivery,
            deposit: currentVal.goodsDeposit ? Math.round(currentVal.goodsDeposit * 100) : '',
            serviceId: that.serverList.checkedServer.join(';'),
            addressType: currentVal.storageMethod,
            mobile: currentVal.storageAddressAll.mobile,
            addressName: currentVal.storageAddressAll.name,
            province: currentVal.storageAddressAll.province,
            city: currentVal.storageAddressAll.city,
            area: currentVal.storageAddressAll.area,
            address: currentVal.storageAddressAll.address,
            diyMobile: currentVal.selfAddressAll.mobile,
            diyAddressName: currentVal.selfAddressAll.name,
            diyProvince: currentVal.selfAddressAll.province,
            diyCity: currentVal.selfAddressAll.city,
            diyArea: currentVal.selfAddressAll.area,
            diyAddress: currentVal.selfAddressAll.address
          }
          var goodsSku = []
          that.goodsFormatData.forEach(function (val) {
            var a = {
              sku: {}
            }
            for (var key in val) {
              if (key === '零售价') {
                a.pricePurchase = Math.round(val[key] * 100)
              } else if (key === '库存量') {
                a.stock = Math.round(val[key])
              } else if (key === 'id') {
                a.id = val.id
              } else {
                a.sku[key] = val[key]
              }
            }
            a.sku = JSON.stringify(a.sku)
            goodsSku.push(a)
          })
          option.goodsSku = JSON.stringify(goodsSku)
          currentVal.id ? option.id = currentVal.id : option.adminId = sessionStorage.getItem('userId')
          that.$axios({
            method: 'post',
            url: 'supply/saveItem.action',
            data: option
          }).then(function (res) {
            that.resetForm('ruleForm', 'showDetail')
            that.showDetail = false
            if (that.$common.isNull(currentVal.id)) {
              that.currentPage1 = 1
            }
            that.pageData()
          })
        } else {
          that.$message.warning('请填写完整')
          console.log('error submit!!')
          return false
        }
      })
    },
    changeImg (url) {
      this.ruleForm[this.currentImg.key].splice(this.currentImg.index, 1, {name: '第' + (this.currentImg.index + 1) + '张', url: url})
    },
    handleCity (value) {
      this.addressList.storageAddress = value
    },
    handleSelfCity (value) {
      this.selfAddressList.storageAddress = value
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
    goodsFormatClick (data, type) {
      var that = this
      if (type === 1) {
        this.getSkuKey(function () {
          for (var key in that.goodsFormatForm) {
            that.goodsFormatForm[key] = data.row[key] || ''
          }
          if (!that.$common.isNull(data.row.id)) {
            that.goodsFormatForm['id'] = data.row.id
          }
          that.goodsFormat = {
            title: '修改商品规格',
            index: data.$index,
            btn: '修改'
          }
          that.dialogGoodsFormat = true
        })
      } else if (type === 3) {
        this.$prompt('库存：', '修改库存', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入库存数',
          inputValidator: function (value) {
            if (!value) {
              return '请输入库存数'
            }
            if (!that.$common.integer(null, value)) {
              return '请输入整数'
            }
            return true
          }
        }).then(({value}) => {
          that.$axios({
            method: 'post',
            url: 'supply/updateGoodsShelvesStock.action',
            data: {
              skuId: data.row.id,
              stock: value
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            var current = that.goodsFormatData[data.$index]
            current['库存量'] = value
            that.goodsFormatData.splice(data.$index, 1, current)
          })
        }).catch(() => {
        })
      } else {
        if (!that.$common.isNull(data.row.id)) {
          this.$confirm('是否删除此规格，删除后将立即生效', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            that.$axios({
              method: 'get',
              url: '/deleteGoodsSku.action',
              params: {
                skuId: data.row.id
              }
            }).then(function (res) {
              that.$message.success('删除成功!')
              that.goodsFormatData.splice(data.$index, 1)
            })
          }).catch(() => {
          })
          return
        }
        that.goodsFormatData.splice(data.$index, 1)
      }
    },
    goodsFormatSet (formName, type) {
      var that = this
      this.$refs[formName].validate((valid) => {
        var flag = false
        if (valid) {
          for (var key in that.goodsFormatForm) {
            if (that.goodsFormatForm[key] && key !== '零售价' && key !== '库存量') {
              flag = true
              break
            }
          }
          if (!flag) {
            that.$message.warning('至少输入一个规格参数')
            return
          }
          if (that.goodsFormat.btn === '新增') {
            if (that.goodsFormatData.length > 0 && that.$common.compareObj(that.goodsFormatData, that.goodsFormatForm)) {
              that.$message.warning('规格参数不能重复')
              return
            }
            var copy = that.$common.copyObj(that.goodsFormatForm, true)
            that.goodsFormatData.push(copy)
          } else {
            var copyArr = [].concat(that.goodsFormatData)
            var indexArr = this.goodsFormat.index
            copyArr.splice(indexArr, 1)
            if (that.$common.compareObj(copyArr, that.goodsFormatForm)) {
              that.$message.warning('规格参数不能与其他重复')
              return
            }
            that.goodsFormatData.splice(indexArr, 1, that.$common.copyObj(that.goodsFormatForm, true))
          }
          this.dialogGoodsFormat = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    goodsSet (formName) {
      var that = this
      var arr = [].concat(this.goodsParametersData)
      arr.splice(this.goodsForm.index, 1)
      this.$refs[formName].validate((valid) => {
        if (valid) {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].title === this.goodsForm.title) {
              that.$message({
                message: '参数标题不能与其他参数标题重复',
                type: 'warning'
              })
              return
            }
          }
          this.goodsParametersData.splice(this.goodsForm.index, 1, {
            title: this.goodsForm.title,
            detail: this.goodsForm.detail
          })
          this.dialogFormVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    addGoodsParameters () {
      if (!this.goodsParameters.title || !this.goodsParameters.detail) {
        this.$message({
          message: '请输入参数标题与参数详情',
          type: 'warning'
        })
        return
      }
      var arr = this.goodsParametersData
      var title = this.goodsParameters.title
      var that = this
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].title === title) {
          that.$message({
            message: '参数标题不能重复',
            type: 'warning'
          })
          return
        }
      }
      this.goodsParametersData.push(
        {title: this.goodsParameters.title, detail: this.goodsParameters.detail}
      )
      this.goodsParameters = {
        title: '',
        detail: ''
      }
    },
    handleCurrentChange () {
      this.pageData()
    },
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
    handlePreview (data) {
      var that = this
      if (!this.controlType.btn) {
        return
      }
      return (index, url) => {
        if (data) {
          that.currentImg.key = data
          that.currentImg.index = index
          that.$emit('openImg', url, that.changeImg)
        }
      }
    },
    imgPosition (key, type, index) {
      var current = this.ruleForm[key][index]
      if (type === 1) {
        this.ruleForm[key][index] = this.ruleForm[key][index - 1]
        this.ruleForm[key].splice(index - 1, 1, current)
      } else {
        this.ruleForm[key][index] = this.ruleForm[key][index + 1]
        this.ruleForm[key].splice(index + 1, 1, current)
      }
    },
    handleRemove (key, index) {
      var that = this
      this.$confirm('是否删除此图片', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ruleForm[key].splice(index, 1)
      }).catch(() => {
      })
    },
    imgOK (key, data) {
      this.ruleForm[key] = this.ruleForm[key].concat(data)
    },
    submitForm () {
      this.currentPage1 = 1
      this.pageData()
    },
    resetForm (formName, data) {
      if (!data) {
        this.ruleForm2 = {
          goodsName: '',
          goodsType: '',
          goodsStatus: '',
          storeWay: '',
          goodsNature: '',
          takeWay: ''
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
          pledgeEndTime: '',
          goodsNature: '',
          goodsType: '',
          goodsBrand: '',
          checkDeposit: '',
          goodsDeposit: '',
          paymentMethod: 0,
          delivery: 0,
          storageMethod: '',
          storageAddressAll: this.$common.storeData.storageAddress || {},
          selfAddressAll: {},
          propagateFile: [],
          goodsDetailFile: []
        }
        this[data] = false
        this.goods.brand = []
        this.goodsFormatData = []
        this.goodsParametersData = []
        this.goodsParameters = {
          title: '',
          detail: ''
        }
        this.controlType = {
          title: '新建质押商品',
          btn: '新增质押'
        }
        this.addressList = {
          storageAddress: [],
          storageAddressInfo: '',
          storageAddressName: '',
          storageAddressPhone: ''
        }
        this.selfAddressList = {
          storageAddress: [],
          storageAddressInfo: '',
          storageAddressName: '',
          storageAddressPhone: ''
        }
      }
      this.$refs[formName].resetFields()
    },
    handleClick (data, type) {
      var that = this
      that.$axios({
        method: 'get',
        url: 'supply/getItemById.action',
        params: {
          goodsId: data.goodsId
        }
      }).then(function (res) {
        that.ruleForm = {
          id: res.goods.id,
          status: res.goods.status,
          reason: res.reason || '',
          goodsNature: res.goods.property,
          goodsName: res.goods.name,
          pledgeEndTime: that.$options.filters['dateFormat'](res.goods.limitTime, 1),
          goodsType: res.goods.categoryId,
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
        that.getSkuKey(function () {
          if (res.skuList) {
            var skuKey = []
            res.skuList.forEach(function (val) {
              var curKey = JSON.parse(val.sku)
              curKey['零售价'] = (val.pricePurchase / 100).toFixed(2)
              curKey['库存量'] = val.stock
              curKey.id = val.id
              skuKey.push(curKey)
            })
            that.goodsFormatData = skuKey
          }
        })
        if (res.goods.param) {
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
        that.addGoods()
        that.showDetail = true
        that.controlType = {
          title: '查看质押商品',
          btn: ''
        }
      })
    },
    handleClick2 (data, type) {
      if (type === 1) {
        this.goodsForm = {
          title: data.row.title,
          detail: data.row.detail,
          index: data.row.$index
        }
        this.dialogFormVisible = true
      } else if (type === 2) {
        var prev = this.goodsParametersData[data.$index * 1 - 1]
        this.goodsParametersData[data.$index - 1] = this.goodsParametersData[data.$index]
        this.goodsParametersData.splice(data.$index, 1, prev)
      } else if (type === 3) {
        var next = this.goodsParametersData[data.$index * 1 + 1]
        this.goodsParametersData[data.$index * 1 + 1] = this.goodsParametersData[data.$index]
        this.goodsParametersData.splice(data.$index, 1, next)
      } else if (type === 4) {
        this.$confirm('是否确认删除商品参数为' + data.row.title, '删除商品参数', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.goodsParametersData.splice(data.$index, 1)
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
      }
    }
  }
}
</script>

<style scoped>

</style>
