<template>
<div>
  <div v-if="!showDetail" key="showDetail1">
    <el-form size="small" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
      <el-form-item prop="goodsStatus"  label="商品状态：" >
        <el-select v-model="ruleForm2.goodsStatus" style="width: 140px">
          <el-option v-for="(item,index) in goods.status" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="goodsName">
        <el-input @keyup.enter.native="submitForm()" :maxlength=100 v-model="ruleForm2.goodsName" placeholder="请输入商品名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button  type="primary" @click="resetForm('ruleForm2')">重置</el-button>
        <el-button  type="primary" @click="submitForm()">搜索</el-button>
      </el-form-item>
    </el-form>
    <div style="text-align: right;margin-bottom: 10px">
      <el-button v-if="$common.havePower(203)" @click="showDetail = true" type="primary" size="mini">申请买断</el-button>
    </div>
    <el-table  @select-all="checked=!checked" @selection-change="handleSelectionChange" class="admin-table" border   max-height="400"   :data="tableData">
      <el-table-column
        type="selection"
        align="center"
        :selectable="function(row, index) {
              return +row.status===2
            }">
      </el-table-column>
      <el-table-column align="center" prop="goodsOverstockName" label="商品名称"></el-table-column>
      <el-table-column align="center" prop="GoodsOverstockInfoNum" label="商品数量"></el-table-column>
      <el-table-column
        align="center"
        prop="price"
        :formatter="function(row) {return (row.price/100).toFixed(2)}"
        label="零售价（元）">
      </el-table-column>
      <el-table-column align="center" prop="stock" label="库存量（件）"></el-table-column>
      <el-table-column align="center" prop="status" label="商品状态">
        <template slot-scope="scope">
          {{$common.findElem(goods.status,'id',scope.row.status,'name')}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$common.havePower(204)" @click="handleClick(scope.row,1)" type="text" size="mini" >查看</el-button>
          <el-button v-if="(+scope.row.status===0||+scope.row.status===-4)&&$common.havePower(205)" @click="handleClick(scope.row,2)" type="text" size="mini">修改</el-button>
          <el-button v-if="+scope.row.status===2&&$common.havePower(206)" @click="handleClick(scope.row,3)" type="text" size="mini">下架</el-button>
          <el-button v-if="+scope.row.status===-2&&$common.havePower(207)" @click="handleClick(scope.row,5)" type="text" size="mini">立即处理</el-button>
          <el-button v-if="+scope.row.status!==2&&+scope.row.status!==-2&&$common.havePower(208)" @click="handleClick(scope.row,4)" type="text" size="mini">删除</el-button>
          <el-button v-if="+scope.row.status===2&&$common.havePower(209)" @click="handleClick(scope.row,6)" type="text" size="mini">修改库存</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <el-pagination
        background
        @current-change="pageData()"
        :current-page.sync="currentPage1"
        :page-size="pageSize"
        layout="slot,prev,total, pager, next,jumper"
        :total="pageTotal">
        <div style="display: inline-block">
          <el-button @click="handleMultiple" type="text" size="mini">批量下架</el-button>
        </div>
      </el-pagination>
    </div>
  </div>
  <div v-else key="showDetail12">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item @click.native="resetForm('ruleForm','showDetail')">返回上一级</el-breadcrumb-item>
      <el-breadcrumb-item>{{controlType.title}}</el-breadcrumb-item>
    </el-breadcrumb>
    <p v-if="ruleForm.reason">
      <i class="el-icon-warning" style="color: red"></i>
      <span>驳回申请理由：{{ruleForm.reason}}</span>
    </p>
    <el-form :disabled="!controlType.btn" size="mini"  :inline="true" :model.sync="ruleForm" :rules="rules" ref="ruleForm" status-icon>
      <p>一、商品基本信息</p>
      <el-form-item prop="goodsName" label="商品名称：">
        <el-input :maxlength=100 v-model="ruleForm.goodsName" placeholder="请输入商品名称"></el-input>
      </el-form-item>
      <el-form-item prop="goodsTotal" label="库存量：">
        <el-input :maxlength=11 v-model="ruleForm.goodsTotal" placeholder="请输入库存量">
          <template slot="suffix">件</template>
        </el-input>
      </el-form-item>
      <el-form-item prop="singleTotal" label="单次最低购买量：">
        <el-input :maxlength=11 v-model="ruleForm.singleTotal" placeholder="请输入单次最低购买量">
          <template slot="suffix">件</template>
        </el-input>
      </el-form-item>
      <el-form-item prop="shareMoney" label="分红金额：">
        <el-input  :maxlength=13  v-model="ruleForm.shareMoney" placeholder="请输入分红金额">
          <template slot="suffix">元</template>
        </el-input>
      </el-form-item>
      <p>
        <label style="color: #f56c6c">*</label><span>商品组成（合计：零售价{{PriceTotal.price}}元;销售价：{{PriceTotal.salePrice}}元）：</span>
        <el-button :disabled="!controlType.btn" @click="dialogGoodsList=true" size="small" type="primary">添加商品</el-button>
      </p>
      <el-table v-if="tableGoodList.length"   class="admin-table" border   max-height="400"   :data="tableGoodList">
        <el-table-column align="center" prop="goodsName" label="商品名称"></el-table-column>
        <el-table-column align="center" prop="goodsType" label="类型">
          <template slot-scope="scope">
            {{$common.findElem(goods.type,'id',scope.row.goodsType,'name')}}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="goodsPrice" label="零售价"></el-table-column>
        <el-table-column align="center" prop="goodsSalePrice" label="销售价"></el-table-column>
        <el-table-column align="center" prop="handle" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="!controlType.btn" @click="handleGoodList(scope,1)" type="text" size="mini">修改</el-button>
            <el-button :disabled="!controlType.btn" @click="handleGoodList(scope,2)" type="text" size="mini">删除</el-button>
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
    </el-form>
    <p style="text-align: right">
      <el-button v-if="controlType.btn"  @click="addGoodsOk('ruleForm')" size="small"  type="primary">{{controlType.btn}}</el-button>
      <template v-if="controlType.addBtn">
        <el-button  @click="buyOffChange(item)" v-for="item in controlType.addBtn" :key="item"   size="small"  type="primary">{{item}}</el-button>
      </template>
    </p>
  </div>
  <el-dialog :title="goodsList.title" width="900px" :visible.sync="dialogGoodsList"  @close='resetGoodsList()'>
    <el-form  :inline="true" size="mini" :model.sync="goodsListForm" :rules="goodsListRules" ref="goodsListForm">
      <el-form-item prop="goodsName" label="商品名称：">
        <el-input :maxlength=100 v-model="goodsListForm.goodsName" placeholder="请输入商品名称"></el-input>
      </el-form-item>
      <el-form-item prop="goodsType"  label="类型：" >
        <el-select v-model="goodsListForm.goodsType" style="width: 140px">
          <el-option v-for="(item,index) in goods.type" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="sku" label="规格：">
        <el-input :maxlength=30 v-model="goodsListForm.sku" placeholder="请输入规格"></el-input>
      </el-form-item>
      <el-form-item prop="goodsPrice" label="零售价：">
        <el-input  :maxlength=11  v-model="goodsListForm.goodsPrice" placeholder="请输入零售价">
          <template slot="suffix">元</template>
        </el-input>
      </el-form-item>
      <el-form-item prop="goodsSalePrice" label="销售价：">
        <el-input  :maxlength=11  v-model="goodsListForm.goodsSalePrice" placeholder="请输入销售价">
          <template slot="suffix">元</template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="+goodsListForm.goodsType===0" prop="time" label="有效截止日期：">
        <el-date-picker
          v-model="goodsListForm.time"
          type="date"
          :clearable="false"
          :picker-options="pickerOptions1"
          :editable="false"
          value-format="timestamp"
          placeholder="选择日期">
        </el-date-picker>
      </el-form-item>
      <p>
        <el-form-item prop="img" label="图片：">
          <admin-upload
            :limit="1"
            name="uploadFile"
            current="img"
            :fileList="goodsListForm.img"
            :on-remove="handleRemove"
            :on-success="imgOK"
            action="pic/upload.action">
          </admin-upload>
        </el-form-item>
      </p>
      <el-form-item prop="belong"  label="归属：" >
        <el-select v-model="goodsListForm.belong" filterable>
          <el-option v-for="(item,index) in goods.belong" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <br>
      <template v-if="+goodsListForm.goodsType===1">
        <el-form-item prop="storageAddress" label="仓储地址：" >
          <adminAddress v-model="goodsListForm.storageAddress" @change="handleCity" selectGrade="3" ></adminAddress>
        </el-form-item>
        <el-form-item prop="storageAddressInfo">
          <el-input :maxlength=20  v-model="goodsListForm.storageAddressInfo" placeholder="请输入详细地址"></el-input>
        </el-form-item>
        <el-form-item prop="storageAddressName">
          <el-input :maxlength=20  v-model="goodsListForm.storageAddressName" placeholder="请输入联系人姓名"></el-input>
        </el-form-item>
        <el-form-item prop="storageAddressPhone">
          <el-input :maxlength=15  v-model="goodsListForm.storageAddressPhone" placeholder="请输入联系人方式"></el-input>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item prop="storeList" label="适用门店：">
          <el-tag
            :key="index"
            v-for="(tag,index) in goodsListForm.storeList"
            closable
            :disable-transitions="false"
            @close="storeHandleClose(tag,index)">
            {{tag.address}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="storeData.inputVisible"
            v-model="storeData.inputValue"
            ref="saveTagInput"
            size="small"
            @blur="storeHandleInputConfirm()"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="storeShowInput()">+ 添加门店</el-button>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button  type="primary" @click="addGoodsList('goodsListForm')">{{goodsList.btn}}</el-button>
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
  name: 'buyOff',
  components: {adminAddress, adminUpload},
  data () {
    var that = this
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      storeData: {
        inputValue: '',
        inputVisible: false
      },
      showDetail: false,
      checked: false,
      dialogFormVisible: false,
      dialogGoodsList: false,
      ruleForm2: {
        goodsName: '',
        inputValue: '',
        goodsStatus: ''
      },
      controlType: {
        title: '新建商品',
        btn: '新增货源'
      },
      goodsList: {
        title: '添加商品',
        btn: '添加'
      },
      ruleForm: {
        goodsName: '',
        goodsTotal: '',
        singleTotal: '',
        shareMoney: '',
        propagateFile: [],
        goodsDetailFile: []
      },
      rules: {
        goodsName: [
          {required: true, message: '请输入商品名称'}
        ],
        goodsTotal: [
          {required: true, message: '请输入库存量'},
          {validator: that.$common.integer}
        ],
        singleTotal: [
          {required: true, message: '请输入库存量'},
          {validator: that.$common.integer}
        ],
        shareMoney: [
          {required: true, message: '请输入分红金额'},
          {validator: that.$common.numTo2}
        ],
        propagateFile: [
          {required: true, type: 'array', message: '请上传商品宣传图片'}
        ],
        goodsDetailFile: [
          {required: true, type: 'array', message: '请上传商品详情图片'}
        ]
      },
      currentImg: {
        key: '',
        index: ''
      },
      goods: {
        status: [
          {name: '全部', id: ''},
          {name: '申请中', id: -2},
          {name: '退回', id: -4},
          {name: '拒绝', id: -3},
          {name: '未上架', id: 0},
          {name: '已上架', id: 2}
        ],
        server: [],
        belong: [],
        type: [
          {name: '抵用券', id: 0},
          {name: '实物', id: 1}
        ]
      },
      multipleSelection: [],
      tableData: [],
      tableGoodList: [],
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      goodsParametersData: [],
      goodsParameters: {
        title: '',
        detail: ''
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
      goodsListForm: {
        goodsName: '',
        goodsType: 0,
        sku: '',
        goodsPrice: '',
        goodsSalePrice: '',
        time: '',
        img: [],
        storeList: [],
        belong: '',
        storageAddress: [],
        storageAddressInfo: '',
        storageAddressName: '',
        storageAddressPhone: ''
      },
      goodsListRules: {
        goodsName: [
          {required: true, message: '请输入商品名称'}
        ],
        sku: [
          {required: true, message: '请输入规格'}
        ],
        goodsType: [
          {required: true, message: '请选择类型'}
        ],
        goodsPrice: [
          {required: true, message: '请输入零售价'},
          {validator: that.$common.numTo2}
        ],
        goodsSalePrice: [
          {required: true, message: '请输入销售价'},
          {validator: that.$common.numTo2}
        ],
        time: [
          {required: true, message: '请输入有效截止日期'}
        ],
        img: [
          {required: true, type: 'array', message: '请上传图片'}
        ],
        storeList: [
          {required: true, type: 'array', message: '至少添加一个门店'}
        ],
        belong: [
          {required: true, message: '请选择归属'}
        ],
        storageAddress: {type: 'array', required: true, message: '请选择地址'},
        storageAddressInfo: {required: true, message: '请输入详细地址'},
        storageAddressName: {required: true, message: '请输入联系人姓名'},
        storageAddressPhone: [
          {required: true, message: '请输入联系方式'},
          {validator: function (rule, value, callback) {
            if (value && !/^[0-9]+$/.test(value) && !/-/g.test(value)) {
              return callback(new Error('联系方式只能输入数字和-'))
            }
            callback()
          }}
        ]

      }
    }
  },
  created () {
    var that = this
    this.pageData()
    // 获取服务项列表
    that.$axios({
      method: 'get',
      url: 'supply/getServiceAll.action'
    }).then(function (res) {
      that.goods.server = res
    })
    // 获取供应商列表
    that.$axios({
      method: 'get',
      url: 'user/getSupplierList.action'
    }).then(function (res) {
      that.goods.belong = res
    })
  },
  computed: {
    PriceTotal () {
      var option = {
        price: 0,
        salePrice: 0
      }
      if (this.tableGoodList.length) {
        this.tableGoodList.forEach(function (item) {
          option.price += +item.goodsPrice
          option.salePrice += +item.goodsSalePrice
        })
      }
      return option
    }
  },
  methods: {
    buyOffChange (type) {
      var that = this
      var titleContent = {
        title: '申请拒绝',
        type: -3,
        text: '请输入拒绝原因'
      }
      if (type === '审核通过' || type === '发起申请') {
        var confirmTitle = type === '审核通过' ? {
          title: '审核通过',
          text: '是否确认' + that.ruleForm.goodsName + '买断申请审核通过。',
          status: 2
        } : {title: '发起申请', text: '是否确认' + that.ruleForm.goodsName + '买断发起申请。', status: -2}
        this.$confirm(confirmTitle.text, confirmTitle.title, {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true,
          type: 'info',
          cancelButtonText: '取消'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'supply/delAndUpAndOtherBuyOutGoods.action',
            data: {
              goodsOverstockIds: [that.ruleForm.id],
              status: confirmTitle.status
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.resetForm('ruleForm', 'showDetail')
            that.pageData()
          })
        }).catch(() => {

        })
      } else {
        if (type === '审核退回') {
          titleContent = {
            title: '审核退回',
            type: -4,
            text: '请输入退回原因'
          }
        }
        this.$prompt(this.ruleForm.goodsName, titleContent.title, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: titleContent.text,
          inputValidator: function (value) {
            if (!value) {
              return '请输入内容'
            }
            return true
          }
        }).then(({value}) => {
          that.$axios({
            method: 'post',
            url: 'supply/delAndUpAndOtherBuyOutGoods.action',
            data: {
              goodsOverstockIds: [that.ruleForm.id],
              status: titleContent.type,
              reason: value
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.resetForm('ruleForm', 'showDetail')
            that.pageData()
          })
        }).catch(() => {

        })
      }
    },
    pageData () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'supply/getBuyOutGoodsList.action',
        params: {
          pages: that.currentPage1,
          rows: that.pageSize,
          status: that.ruleForm2.goodsStatus,
          goodsOverstockName: that.ruleForm2.goodsName
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
    resetForm (formName, data) {
      if (formName === 'ruleForm2') {
        this.ruleForm2 = {
          goodsName: '',
          goodsStatus: ''
        }
        return
      }
      if (data) {
        this.$refs[formName].resetFields()
        this[data] = false
        this.ruleForm = {
          goodsName: '',
          goodsTotal: '',
          singleTotal: '',
          shareMoney: '',
          propagateFile: [],
          goodsDetailFile: []
        }
        this.goodsParameters = {
          title: '',
          detail: ''
        }
        this.controlType = {
          title: '新建商品',
          btn: '新增货源'
        }
        this.tableGoodList = []
      }
    },
    resetGoodsList () {
      this.$refs['goodsListForm'].resetFields()
      this.goodsListForm = {
        goodsName: '',
        goodsType: 0,
        sku: '',
        goodsPrice: '',
        goodsSalePrice: '',
        time: '',
        img: [],
        storeList: [],
        belong: '',
        storageAddress: [],
        storageAddressInfo: '',
        storageAddressName: '',
        storageAddressPhone: ''
      }
      this.goodsList = {
        title: '添加商品',
        btn: '添加'
      }
      this.storeData = {
        inputValue: '',
        inputVisible: false
      }
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    handleClick (data, type) {
      var that = this
      if (type === 4) {
        this.$confirm('是否删除' + data.goodsOverstockName + '，删除后将不可恢复', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'supply/delAndUpAndOtherBuyOutGoods.action',
            data: {
              goodsOverstockIds: [data.goodsOverstockId],
              status: -1
            }
          }).then(function (res) {
            that.$message.success('删除成功!')
            that.pageData()
          })
        }).catch(() => {
        })
      } else if (type === 3) {
        this.$confirm('是否确认' + data.goodsOverstockName + '下架', '下架确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'supply/delAndUpAndOtherBuyOutGoods.action',
            data: {
              goodsOverstockIds: [data.goodsOverstockId],
              status: 0
            }
          }).then(function (res) {
            that.pageData()
            that.$message.success('操作成功!')
          })
        }).catch(() => {
        })
      } else if (type === 6) {
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
            url: 'supply/updateGoodsOverstock.action',
            data: {
              goodsOverstockId: data.goodsOverstockId,
              stock: value
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
          url: 'supply/getBuyOutGoodsById.action',
          params: {
            id: data.goodsOverstockId
          }
        }).then(function (res) {
          that.ruleForm = {
            id: res.id,
            goodsName: res.name,
            goodsTotal: res.stock,
            reason: res.reason || null,
            singleTotal: res.buyNum,
            shareMoney: (res.rebate / 100).toFixed(2),
            propagateFile: res.imgs.split(';').map(function (item, index) {
              return {
                url: item
              }
            }),
            goodsDetailFile: res.detail.split(';').map(function (item, index) {
              return {
                url: item
              }
            })
          }
          if (res.param) {
            var paramArr = []
            var paramJson = JSON.parse(res.param)
            for (var key in paramJson) {
              paramArr.push({title: key, detail: paramJson[key]})
            }
            that.goodsParametersData = paramArr
          }
          that.tableGoodList = res.goodsOverstockOrgoodsWarehouseOrAddressList.map(function (item) {
            var option = {
              goodsName: item.goodsOverstockInfo.goodsName,
              id: item.goodsOverstockInfo.id,
              sku: item.goodsOverstockInfo.sku,
              goodsType: item.goodsOverstockInfo.type,
              goodsPrice: (item.goodsOverstockInfo.pricePurchase / 100).toFixed(2),
              goodsSalePrice: (item.goodsOverstockInfo.priceSales / 100).toFixed(2),
              img: [{url: item.goodsOverstockInfo.img}],
              time: item.goodsOverstockInfo.useEndTime,
              belong: item.goodsOverstockInfo.adminId,
              storageAddress: [],
              storageAddressInfo: '',
              storageAddressName: '',
              storageAddressPhone: '',
              storeList: item.addressList || []
            }
            if (item.goodsWarehouse) {
              option.storageAddress = [item.goodsWarehouse.province, item.goodsWarehouse.city, item.goodsWarehouse.area]
              option.storageAddressInfo = item.goodsWarehouse.address
              option.storageAddressName = item.goodsWarehouse.name
              option.storageAddressPhone = item.goodsWarehouse.mobile
            }
            return option
          })
          if (res.serviceId) {
            that.serverList.checkedServer = res.serviceId.split(';')
            that.handleCheckedServerChange(that.serverList.checkedServer)
          }
          that.showDetail = true
          if (type === 2) {
            that.controlType = {
              title: '修改商品',
              btn: '修改',
              addBtn: ['发起申请']
            }
          } else if (type === 5) {
            that.controlType = {
              title: '商品审核',
              btn: '',
              addBtn: ['申请拒绝', '审核退回', '审核通过']
            }
          } else {
            that.controlType = {
              title: '查看商品',
              btn: ''
            }
          }
        })
      }
    },
    handleMultiple () {
      var that = this
      if (!this.multipleSelection.length) {
        that.$message.info('请选择下架商品!')
        return
      }
      this.$confirm('是否确认批量下架这些商品', '批量下架', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var a = that.multipleSelection.map(function (item) {
          return item.goodsOverstockId
        })
        that.$axios({
          method: 'post',
          url: 'supply/delAndUpAndOtherBuyOutGoods.action',
          data: {
            goodsOverstockIds: a,
            status: 0
          }
        }).then(function (res) {
          that.pageData()
          that.$message.success('操作成功!')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
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
    changeImg (url) {
      this.ruleForm[this.currentImg.key].splice(this.currentImg.index, 1, {name: '第' + (this.currentImg.index + 1) + '张', url: url})
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
        key !== 'img' ? that.ruleForm[key].splice(index, 1) : that.goodsListForm.img = []
      }).catch(() => {
      })
    },
    imgOK (key, data) {
      key !== 'img' ? this.ruleForm[key] = this.ruleForm[key].concat(data) : this.goodsListForm.img = data
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
          return false
        }
      })
    },
    addGoodsList (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var obj = that.$common.copyObj(that.goodsListForm)
          if (that.goodsList.title === '添加商品') {
            that.tableGoodList.push(obj)
          } else {
            that.tableGoodList.splice(that.goodsList.index, 1, obj)
          }
          that.dialogGoodsList = false
        } else {
          return false
        }
      })
    },
    handleCity (value) {
      this.goodsListForm.storageAddress = value
    },
    handleGoodList (data, type) {
      var that = this
      if (type === 1) {
        this.goodsListForm = this.$common.copyObj(data.row)
        this.goodsList = {
          title: '修改商品',
          index: data.$index,
          btn: '修改'
        }
        this.dialogGoodsList = true
      } else {
        this.$confirm('是否删除此商品（立即生效）', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (!that.$common.isNull(data.row.id)) {
            that.$axios({
              method: 'post',
              url: 'supply/delGoodsOverstockInfo.action',
              data: {
                goodsOverstockInfoId: data.row.id,
                status: -1
              }
            }).then(function (res) {
              that.tableGoodList.splice(data.row.$index, 1)
            })
          } else {
            that.tableGoodList.splice(data.row.$index, 1)
          }
        }).catch(() => {
        })
      }
    },
    addGoodsOk (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (!that.tableGoodList.length) {
            that.$message.warning('至少添加一个商品')
            return
          }
          var currentVal = that.ruleForm
          var option = {
            name: currentVal.goodsName,
            stock: currentVal.goodsTotal,
            buyNum: currentVal.singleTotal,
            rebate: Math.round(currentVal.shareMoney * 100),
            detail: that.$common.imgUrl(currentVal.goodsDetailFile),
            imgs: that.$common.imgUrl(currentVal.propagateFile),
            param: that.$common.arrFomat(that.goodsParametersData),
            serviceId: that.serverList.checkedServer.join(';'),
            GoodsOverstockOrgoodsWarehouseOrAddressList: JSON.stringify(that.tableGoodList.map(item => {
              var option = {
                goodsOverstockInfo: {
                  goodsName: item.goodsName,
                  sku: item.sku,
                  type: item.goodsType,
                  pricePurchase: Math.round(item.goodsPrice * 100),
                  priceSales: Math.round(item.goodsSalePrice * 100),
                  img: item.img[0].url,
                  useEndTime: item.time,
                  adminId: item.belong
                },
                goodsWarehouse: {
                  province: '',
                  city: '',
                  area: '',
                  address: item.storageAddressInfo,
                  name: item.storageAddressName,
                  mobile: item.storageAddressPhone
                },
                goodsAddressList: item.storeList
              }
              if (!that.$common.isNull(item.id)) {
                option.goodsOverstockInfo.id = item.id
              }
              if (item.storageAddress.length) {
                option.goodsWarehouse.province = item.storageAddress[0]
                option.goodsWarehouse.city = item.storageAddress[1]
                option.goodsWarehouse.area = item.storageAddress[2]
              }
              return option
            }))
          }
          if (currentVal.id) { option.id = currentVal.id }
          that.$axios({
            method: 'post',
            url: 'supply/addAndUpdateBuyOutGoods.action',
            data: option
          }).then(function (res) {
            that.$message.success('操作成功!')
            that.resetForm('ruleForm', 'showDetail')
            if (that.$common.isNull(currentVal.id)) {
              that.currentPage1 = 1
            }
            that.pageData()
          })
        } else {
          that.$message.warning('请填写完整')
          return false
        }
      })
    },
    storeShowInput () {
      this.storeData.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    storeHandleInputConfirm () {
      let inputValue = this.storeData.inputValue
      if (inputValue) {
        this.goodsListForm.storeList.push({address: inputValue})
      }
      this.storeData.inputVisible = false
      this.storeData.inputValue = ''
    },
    storeHandleClose (data, index) {
      var that = this
      if (data.id) {
        this.$confirm('是否删除此已存在的门店（立即生效）', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'supply/delGoodsAddress.action',
            data: {
              goodsAddressId: data.id
            }
          }).then(function (res) {
            that.goodsListForm.storeList.splice(index, 1)
          })
        }).catch(() => {
        })
      } else {
        that.goodsListForm.storeList.splice(index, 1)
      }
    }
  }
}
</script>

<style>
.input-new-tag{
  width: 90px;
}
</style>
