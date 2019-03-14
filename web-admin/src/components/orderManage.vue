<template>
  <div>
    <div v-if="!showDetail" key="showDetail1">
      <div class="el-form el-form--inline">
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-input size="small" @keyup.enter.native="submitForm()" :maxlength=20 v-model="ruleForm2.goodsName" style="width: 300px" placeholder="请输入订单号\买家姓名\买家联系方式"></el-input>
          </div>
        </div>
        <div class="el-form-item el-form-item--feedback el-form-item--small">
          <div class="el-form-item__content">
            <el-button size="small"  type="primary" @click="ruleForm2.goodsName=''">重置</el-button>
            <el-button size="small"  type="primary" @click="submitForm()">搜索</el-button>
          </div>
        </div>
      </div>
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item) in orderList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        >

        </el-tab-pane>
      </el-tabs>
      <div>
        <p v-if="activeName==='2'" style="float: right">
          <el-button  v-if="$common.havePower(142)" @click="getCode()" size="small"   type="primary">提货码</el-button>
        </p>
        <el-table class="admin-table" border max-height="400" :data="tableData">
          <el-table-column align="center" prop="orderNum" label="订单号"></el-table-column>
          <el-table-column align="center" label="交易时间">
            <template slot-scope="scope">
              {{scope.row.createTime | dateFormat(1)}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="name" label="商品名称">
            <template slot-scope="scope">
              <span>{{scope.row.name}}</span>
              <span v-if="+scope.row.category===0">(认筹商品)</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="pricePurchase"
            :formatter="function(row) {
              return (row.pricePurchase/100).toFixed(2)
            }"
            label="零售价（元）">

          </el-table-column>
          <el-table-column
            v-if="+$common.powerList.type===0"
            align="center"
            prop="priceSales"
            :formatter="function(row) {
              return (row.priceSales/100).toFixed(2)
            }"
            label="销售价（元）">

          </el-table-column>
          <el-table-column align="center" prop="payTypeString" label="支付方式">
          </el-table-column>
          <el-table-column align="center" prop="getWayString" label="取货方式">
          </el-table-column>
          <el-table-column align="center" label="买方信息">
            <template slot-scope="scope">
              {{scope.row.userName}}
              （{{scope.row.mobile}}）
            </template>
          </el-table-column>
          <el-table-column v-if="activeName==='2'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(56)" @click="handleClick(scope.row,1)" type="text" size="mini">查看
              </el-button>
              <el-button v-if="$common.havePower(57)" @click="handleClick(scope.row,2)" type="text" size="mini">申请退款
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="activeName==='3'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(129)" @click="handleClick(scope.row,1)" type="text" size="mini">查看
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="activeName==='4'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(60)" @click="handleClick(scope.row,1)" type="text" size="mini">查看
              </el-button>
              <el-button v-if="$common.havePower(61)" @click="handleClick(scope.row,2)" type="text" size="mini">申请退款
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="activeName==='6'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(64)" @click="handleClick(scope.row,1)" type="text" size="mini">查看
              </el-button>
              <el-button v-if="$common.havePower(65)" @click="handleClick(scope.row,3)" type="text" size="mini">确认退款
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="activeName==='7'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(130)" @click="handleClick(scope.row,1)" type="text" size="mini">查看
              </el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="activeName==='8'" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(130)" @click="handleClick(scope.row,1)" type="text" size="mini">查看
              </el-button>
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
    <div class="span-right" v-else key="showDetail2">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click.native="resetForm">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>订单信息</el-breadcrumb-item>
      </el-breadcrumb>
      <div>
        <template v-if="activeName==='8'">
          <p>
            <span>订单号：{{orderInfo.orderNum}}</span>
            <span style="float: right">交易时间：{{orderInfo.createTime | dateFormat}}</span>
          </p>
          <div>
            <h4>一、支付/运输信息</h4>
            <span>支付方式：在线支付金额{{(orderInfo.payMoney/100).toFixed(2)}}({{orderInfo.payMoney===orderInfo.money?'已付清':'未支付'+((orderInfo.money-orderInfo.payMoney)/100).toFixed(2)}})</span>
            <span>配送方式：{{orderInfo.getWayString}}</span>
            <span>收货人：{{orderInfo.userName}}（Tel:{{orderInfo.mobile}}）</span>
            <span>收货地址：{{orderInfo.address}}</span>
          </div>
          <div>
            <h4>二、商品基本信息</h4>
            <el-table  class="admin-table" border   max-height="400"   :data="orderInfo.orderGoodsInfos">
              <el-table-column align="center" prop="goodsName" label="商品名称"></el-table-column>
              <el-table-column align="center" prop="type" label="类型">
                <template slot-scope="scope">
                  {{scope.row.type===0?'核销':'实物'}}
                </template>
              </el-table-column>
              <el-table-column align="center" prop="pricePurchase" label="零售价(元)">
                <template slot-scope="scope">
                  {{(scope.row.pricePurchase/100).toFixed(2)}}
                </template>
              </el-table-column>
              <el-table-column align="center" prop="priceSales" label="销售价(元)">
                <template slot-scope="scope">
                  {{(scope.row.priceSales/100).toFixed(2)}}
                </template>
              </el-table-column>
              <el-table-column align="center" prop="priceSales" label="商品状态">
                <template slot-scope="scope">
                  {{getGoodsStatus(scope.row)}}
                </template>
              </el-table-column>
              <el-table-column align="center" prop="handle" label="操作">
                <template slot-scope="scope">
                  <el-button v-if="+scope.row.status===2&&+scope.row.type===1" @click="openExpress(scope.row)" type="text" size="mini">发货</el-button>
                  <el-button v-if="+scope.row.status===3&&+scope.row.type===1" @click="getExpress(scope.row.expressNum)" type="text" size="mini">查询</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div>
            <h4>三、商品参数</h4>
            <el-table v-if="goodsParametersData.length"    border   max-height="400"   :data="goodsParametersData">
              <el-table-column align="center" prop="title" label="商品参数标题"></el-table-column>
              <el-table-column align="center" prop="detail" label="参数详情"></el-table-column>
            </el-table>
            <p v-else>无</p>
          </div>
          <div v-if="orderInfo.goodsServices.length">
            <h4>四、商品服务项</h4>
            <span v-for="(item) in orderInfo.goodsServices" :key="item.id">{{item.name}}</span>
          </div>
        </template>
        <template v-else>
          <p>订单号：{{orderInfo.orderNum}}</p>
          <div>
            <h4>一、商品基本信息</h4>
            <span>商品名称：{{orderInfo.goodsName}}</span>
            <span>商品分类：{{orderInfo.category}}</span>
            <span>品牌：{{orderInfo.brand}}</span>
            <span>购买数量：{{orderInfo.buyNum}}</span>
            <span>零售价：{{(orderInfo.pricePurchase/100).toFixed(2)}}</span>
            <span>销售价：{{(orderInfo.priceSales/100).toFixed(2)}}</span>
            <template v-if="+orderInfo.deposit>0">
              <span>定金：{{(orderInfo.deposit/100).toFixed()}}</span>
              <span>未付款金额：{{(orderInfo.unpayMoney/100).toFixed(2)}}</span>
            </template>
            <span>商品规格：{{orderInfo.sku}}</span>
          </div>
          <div>
            <h4>二、商品参数</h4>
            <el-table v-if="goodsParametersData.length"    border   max-height="400"   :data="goodsParametersData">
              <el-table-column align="center" prop="title" label="商品参数标题"></el-table-column>
              <el-table-column align="center" prop="detail" label="参数详情"></el-table-column>
            </el-table>
            <p v-else>无</p>
          </div>
          <div>
            <h4>三、买方信息</h4>
            <span>收货人：{{orderInfo.userName}}</span>
            <span>联系电话：{{orderInfo.mobile}}</span>
            <span>收货地址：{{orderInfo.address}}</span>
          </div>
          <div>
            <h4>四、支付/运输信息</h4>
            <span>支付方式：{{orderInfo.payTypeString}}</span>
            <span>配送方式：{{orderInfo.getWayString}}</span>
            <span v-if="+orderInfo.getWay===0">收货地址：{{orderInfo.address}}</span>
            <template v-else>
              <span>自取联系人：{{orderInfo.goodsAddressName}}(Tel：{{orderInfo.goodsAddressMobile}})</span>
              <span>自取地址：{{orderInfo.goodsAddress}}</span>
            </template>
          </div>
          <div>
            <h4>五、仓储方式</h4>
            <span>仓储方式：{{$common.dataCommon().storage[orderInfo.warehouseType]}}</span>
            <span>
            仓储地址：
            {{orderInfo.warehouseProvince}}
            {{orderInfo.warehouseCity}}
            {{orderInfo.warehouseArea}}
            {{orderInfo.warehouseAddress}}
          </span>
            <span>联系人：{{orderInfo.warehouseMobile}}</span>
          </div>
          <div v-if="orderInfo.goodsServices.length">
            <h4>六、商品服务项</h4>
            <span v-for="(item) in orderInfo.goodsServices" :key="item.id">{{item.name}}</span>
          </div>
          <el-form  size="mini" :inline="true" :model.sync="orderForm" :rules="orderRule" ref="orderForm" status-icon>
            <h4>七、退货信息</h4>
            <div v-if="activeName==='6'">
              <el-form-item prop="address" label="退货地址：">
                <el-input style="width: 350px" :maxlength=50 v-model="orderForm.address" placeholder="请输入退货地址"></el-input>
              </el-form-item>
              <el-form-item prop="name" label="联系人：">
                <el-input :maxlength=20 v-model="orderForm.name" placeholder="请输入退货联系人"></el-input>
              </el-form-item>
              <el-form-item prop="phone" label="手机号：">
                <el-input :maxlength=11 v-model="orderForm.phone" placeholder="请输入手机号"></el-input>
              </el-form-item>
            </div>
            <p v-else>无</p>
            <div v-if="(activeName!=='6'&&+orderInfo.getWay===0)||orderForm.deliveryNum">
              <h4>八、快递信息</h4>
              <el-form-item  prop="deliveryCom" label="快递公司：">
                <el-select :disabled="activeName!=='2'" v-model="orderForm.deliveryCom" style="width: 140px">
                  <el-option v-for="(item,index) in goods.company" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="deliveryNum" label="快递单号：">
                <el-input :disabled="activeName!=='2'" :maxlength=20 v-model="orderForm.deliveryNum" placeholder="请输入快递单号"></el-input>
              </el-form-item>
              <el-button @click="getExpress(orderForm.deliveryNum)" v-if="activeName==='3'" type="text" size="mini">查询</el-button>
            </div>
          </el-form>
          <p style="text-align: right">
            <el-button v-if="+orderInfo.getWay===0&&activeName==='2'" @click="orderOk('orderForm',1)" size="small"  type="primary">确认发货</el-button>
            <el-button v-if="+orderInfo.getWay===1&&activeName==='2'" @click="getCodeOk()" size="small"  type="primary">确认提货</el-button>
            <el-button v-if="activeName==='6'&&$common.havePower(65)" @click="orderOk('orderForm',2)" size="small"  type="primary">确认退款</el-button>
            <el-button v-if="activeName==='6'&&!orderInfo.refundName" @click="orderOk('orderForm',3)" size="small"  type="primary">发送退货地址</el-button>
          </p>
        </template>
      </div>
    </div>
    <el-dialog title="发货" width="360px" :visible.sync="dialogExpressVisible" @close="resetForm('expressForm')">
      <el-form :inline="true" size="mini" :model.sync="expressForm" :rules="expressRules" ref="expressForm" label-width="120px">
        <el-form-item  prop="deliveryCom" label="快递公司：">
          <el-select  v-model="expressForm.deliveryCom" style="width: 140px">
            <el-option v-for="(item,index) in goods.company" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="deliveryNum" label="快递单号：">
          <el-input  :maxlength=20 v-model="expressForm.deliveryNum" placeholder="请输入快递单号"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="orderOk('expressForm',1)">确认发货</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'order-manage',
  components: {adminAddress},
  data () {
    var that = this
    return {
      showDetail: false,
      dialogExpressVisible: false,
      orderList: [],
      activeName: '2',
      goods: {
        company: [
          {name: '圆通速递', id: 'yuantong'},
          {name: '顺丰速运', id: 'shunfeng'},
          {name: '韵达速递', id: 'yunda'},
          {name: '申通快递', id: 'shentong'},
          {name: 'EMS', id: 'ems'},
          {name: '天天快递', id: 'tiantian'},
          {name: '百世汇通', id: 'huitongkuaidi'},
          {name: '中通快递', id: 'zhongtong'},
          {name: '德邦物流', id: 'debangwuliu'},
          {name: '如风达快递', id: 'rufengda'},
          {name: '安信达', id: 'anxindakuaixi'},
          {name: '百福东方', id: 'baifudongfang'},
          {name: '平邮', id: 'youzhengguonei'},
          {name: '邦送物流', id: 'bangsongwuliu'},
          {name: '中国东方（COE）', id: 'coe'},
          {name: '传喜物流', id: 'chuanxiwuliu'},
          {name: '大田物流', id: 'datianwuliu'},
          {name: 'D速快递', id: 'dsukuaidi'},
          {name: '递四方', id: 'disifang'},
          {name: '飞康达物流', id: 'feikangda'},
          {name: '飞快达', id: 'feikuaida'},
          {name: '凡客如风达', id: 'rufengda'},
          {name: '风行天下', id: 'fengxingtianxia'},
          {name: '飞豹快递', id: 'feibaokuaidi'},
          {name: '港中能达', id: 'ganzhongnengda'},
          {name: '国通快递', id: 'guotongkuaidi'},
          {name: '汇强快递', id: 'huiqiangkuaidi'},
          {name: '华宇物流', id: 'tiandihuayu'},
          {name: '恒路物流', id: 'hengluwuliu'},
          {name: '华夏龙', id: 'huaxialongwuliu'},
          {name: '海航天天', id: 'tiantian'},
          {name: '海盟速递', id: 'haimengsudi'},
          {name: '华企快运', id: 'huaqikuaiyun'},
          {name: '佳吉物流', id: 'jiajiwuliu'},
          {name: '佳怡物流', id: 'jiayiwuliu'},
          {name: '加运美', id: 'jiayunmeiwuliu'},
          {name: '京广速递', id: 'jinguangsudikuaijian'},
          {name: '急先达', id: 'jixianda'},
          {name: '晋越快递', id: 'jinyuekuaidi'},
          {name: '捷特快递', id: 'jietekuaidi'},
          {name: '金大物流', id: 'jindawuliu'},
          {name: '嘉里大通', id: 'jialidatong'},
          {name: '快捷速递', id: 'kuaijiesudi'},
          {name: '康力物流', id: 'kangliwuliu'},
          {name: '跨越物流', id: 'kuayue'},
          {name: '联昊通', id: 'lianhaowuliu'},
          {name: '龙邦物流', id: 'longbanwuliu'},
          {name: '蓝镖快递', id: 'lanbiaokuaidi'},
          {name: '优速物流', id: 'youshuwuliu'},
          {name: '万家物流', id: 'wanjiawuliu'},
          {name: '万象物流', id: 'wanxiangwuliu'},
          {name: '新邦物流', id: 'xinbangwuliu'},
          {name: '信丰物流', id: 'xinfengwuliu'},
          {name: '香港邮政', id: 'hkpost'},
          {name: '运通快递', id: 'yuntongkuaidi'},
          {name: '芝麻开门', id: 'zhimakaimen'},
          {name: '宅急送', id: 'zhaijisong'},
          {name: '中邮物流', id: 'zhongyouwuliu'}
        ]
      },
      orderForm: {
        address: '',
        deliveryNum: '',
        deliveryCom: '',
        name: '',
        phone: ''
      },
      orderRule: {
        name: [
          {required: true, message: '请输入退货联系人'}
        ],
        deliveryCom: [
          {required: true, message: '请选择快递公司'}
        ],
        deliveryNum: [
          {required: true, message: '请输入快递单号'},
          {validator: that.$common.integerEn}
        ],
        address: [
          {required: true, message: '请输入退货地址'}
        ],
        phone: [
          {required: true, message: '请输入手机号'},
          {validator: that.$common.phone}
        ]
      },
      expressForm: {
        deliveryNum: '',
        deliveryCom: ''
      },
      expressRules: {
        deliveryCom: [
          {required: true, message: '请选择快递公司'}
        ],
        deliveryNum: [
          {required: true, message: '请输入快递单号'},
          {validator: that.$common.integerEn}
        ]
      },
      goodsParametersData: [],
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      tableData: [],
      orderInfo: {},
      ruleForm2: {
        goodsName: ''
      }
    }
  },
  created () {
    var list = [
      {
        label: '待发货',
        id: 55,
        name: '2'
      },
      {
        label: '待收货',
        id: 58,
        name: '3'
      },
      {
        label: '已完成订单',
        id: 59,
        name: '4'
      },
      {
        label: '已退款',
        id: 62,
        name: '7'
      },
      {
        label: '退货/售后',
        id: 63,
        name: '6'
      },
      {
        label: '买断订单',
        id: 220,
        name: '8'
      }
    ]
    var currentList = this.$common.powerFilter(list)
    this.activeName = currentList[0].name
    this.orderList = currentList
    this.pageData()
  },
  methods: {
    getGoodsStatus (data) {
      var status = ''
      if (+data.type === 0) {
        switch (data.status) {
          case 3:
            status = '未核销'
            break
          case 4:
            status = '已核销'
            break
          case 5:
            status = '已过期'
            break
        }
      } else {
        switch (data.status) {
          case 0:
            status = '未付款'
            break
          case 2:
            status = '已付款'
            break
          case 3:
            status = '已发货'
            break
          case 4:
            status = '已完成'
            break
        }
      }
      return status
    },
    openExpress (data) {
      this.expressForm.id = data.id
      this.dialogExpressVisible = true
    },
    getExpress (num) {
      window.open('https://www.baidu.com/s?wd=' + num)
    },
    getCodeOk () {
      var that = this
      that.$axios({
        method: 'post',
        url: 'order/updateOrderByCode.action',
        data: {
          orderId: that.orderInfo.id
        }
      }).then(function (res) {
        that.$message.success('操作成功')
        that.pageData()
      })
    },
    getCode () {
      var that = this
      this.$prompt('提货码:', '提货码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入提货码',
        inputValidator: function (value) {
          if (!value) {
            return '请输入内容'
          }
          if (value.length !== 6) {
            return '只能输入六位'
          }
          if (!that.$common.integerEn(false, value)) {
            return '只能输入数字和字母'
          }
          return true
        }
      }).then(({value}) => {
        that.$axios({
          method: 'get',
          url: 'order/getOrderDetailByCode.action',
          params: {
            code: value
          }
        }).then(function (res) {
          that.orderInfo = res
          if (res.param && res.param !== '{}') {
            var paramArr = []
            var paramJson = JSON.parse(res.param)
            for (var key in paramJson) {
              paramArr.push({title: key, detail: paramJson[key]})
            }
            that.goodsParametersData = paramArr
          }
          that.showDetail = true
        })
      }).catch(function () {

      })
    },
    pageData () {
      var that = this
      if (this.showDetail) {
        this.resetForm()
        this.showDetail = false
      }
      this.tableData = []
      this.$axios({
        method: 'get',
        url: 'order/getOrderList.action',
        params: {
          pages: that.currentPage1,
          rows: that.pageSize,
          status: that.activeName,
          queryString: that.ruleForm2.goodsName,
          category: +that.activeName === 8 ? 3 : 1
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
    handleCurrentChange () {
      this.pageData()
    },
    tabClick () {
      this.currentPage1 = 1
      this.pageData()
    },
    orderOk (formName, type) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (type === 1) {
            var option = {
              express: that[formName].deliveryCom,
              expressNum: that[formName].deliveryNum
            }
            formName === 'expressForm' ? option.goodsOrderGoodsInfoId = that.expressForm.id : option.orderId = that.orderInfo.id
            that.$axios({
              method: 'post',
              url: 'order/updateOrderByDeliver.action',
              data: option
            }).then(function () {
              that.$message({
                type: 'success',
                message: '操作成功!'
              })
              if (formName === 'expressForm') {
                that.dialogExpressVisible = false
                that.handleClick({id: that.orderInfo.id}, 1)
                return
              }
              that.pageData()
            })
          } else if (type === 2) {
            that.handleClick({name: that.orderInfo.goodsName, id: that.orderInfo.id}, 2)
          } else {
            that.$axios({
              method: 'post',
              url: 'order/updateOrderByRefundAddress.action',
              data: {
                orderId: that.orderInfo.id,
                refundAddress: that.orderForm.address,
                refundMobile: that.orderForm.phone,
                refundName: that.orderForm.name
              }
            }).then(function () {
              that.$message({
                type: 'success',
                message: '操作成功!'
              })
              that.handleClick({id: that.orderInfo.id}, 1)
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (forName) {
      if (forName === 'expressForm') {
        this.expressForm = {
          deliveryNum: '',
          deliveryCom: ''
        }
        this.$refs[forName].clearValidate()
        return
      }
      this.orderForm = {
        address: '',
        deliveryNum: '',
        deliveryCom: '',
        name: '',
        phone: ''
      }
      this.orderInfo = {}
      this.$refs['orderForm'] && this.$refs['orderForm'].clearValidate()
      this.showDetail = false
    },
    handleClick (data, type) {
      var that = this
      if (type === 1) {
        this.$axios({
          method: 'get',
          url: 'order/getOrderDetail.action',
          params: {
            orderId: data.id
          }
        }).then(function (res) {
          that.orderInfo = res
          if (that.activeName !== '8') {
            that.orderForm = {
              address: res.refundAddress,
              deliveryCom: res.express,
              deliveryNum: res.expressNum,
              name: res.refundName,
              phone: res.refundMobile
            }
          }
          if (res.param && res.param !== '{}') {
            var paramArr = []
            var paramJson = JSON.parse(res.param)
            for (var key in paramJson) {
              paramArr.push({title: key, detail: paramJson[key]})
            }
            that.goodsParametersData = paramArr
          }
          that.showDetail = true
        })
      } else if (type === 2) {
        this.$confirm('是否确认进行' + data.name + '的退货处理', '申请退货', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'get',
            url: 'order/updateOrderByRefund.action',
            params: {
              orderId: data.id
            }
          }).then(function () {
            that.$message({
              type: 'success',
              message: '操作成功!'
            })
            that.pageData()
          })
        }).catch(() => {
        })
      } else {
        this.$confirm('确认退款后将系统自动将' + (data.priceSales / 100).toFixed(2) + '元打回支付账户，确认后不可恢复', '确认退款', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios({
            method: 'get',
            url: 'order/updateOrderByRefundMoney.action',
            params: {
              orderId: data.id
            }
          }).then(function () {
            that.$message({
              type: 'success',
              message: '操作成功!'
            })
            that.pageData()
          })
        }).catch(() => {
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
