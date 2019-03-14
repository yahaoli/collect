<template>
  <div>
    <div v-if="!showDetail" key="showDetail1">
      <el-form size="small" :inline="true" :model.sync="ruleForm2" ref="ruleForm2" status-icon>
        <el-form-item prop="goodsType" label="商品类型：" >
          <el-select v-model="ruleForm2.goodsType" style="width: 140px">
            <el-option v-for="(item,index) in goods.type" :key="index" :label="item.name" :value="item.categoryId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="goodsStatus"  label="认筹状态：" >
          <el-select v-model="ruleForm2.goodsStatus" style="width: 140px">
            <el-option v-for="(item,index) in goods.status" :key="index" :label="item.name" :value="item.id"></el-option>
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
        <div style="text-align: right;margin-bottom: 10px">
          <el-button v-if="$common.havePower(47)" @click="showDetail=true" type="primary" size="mini">申请商品认筹</el-button>
        </div>
        <el-table   ref="multipleTable"  class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column align="center" prop="name" label="商品名称"></el-table-column>
          <el-table-column
            align="center"
            prop="price_subscription"
            :formatter="function(row) {
              return (row.price_subscription/100).toFixed(2)
            }" label="认筹价（元）"></el-table-column>
          <el-table-column
            align="center"
            prop="price_sales"
            :formatter="function(row) {
              return (row.price_sales/100).toFixed(2)
            }"
            label="零售价（元）"></el-table-column>
          <el-table-column align="center" prop="num_subscription_total" label="认筹份数"></el-table-column>
          <el-table-column align="center" prop="num_subscription" label="已认筹份数"></el-table-column>
          <el-table-column
            align="center"
            prop="bonus_avg"
            :formatter="function(row) {
              return (row.bonus_avg/100).toFixed(2)
            }"
            label="单笔分红（元）"></el-table-column>
          <el-table-column align="center"  label="认筹时间">
            <template slot-scope="scope">
              {{scope.row.startTime | dateFormat(1)}}~{{scope.row.endTime | dateFormat(1)}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="status" label="认筹状态"></el-table-column>
          <el-table-column align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status==='认筹被退回'&&$common.havePower(46)" @click="handleClick(scope.row,2)"  type="text" size="mini">修改</el-button>
              <el-button v-else-if="scope.row.status==='认筹审核中'&&$common.havePower(123)" @click="handleClick(scope.row,3)"  type="text" size="mini">立即处理</el-button>
              <el-button v-else-if="$common.havePower(45)"  @click="handleClick(scope.row,1)" type="text" size="mini" >查看</el-button>
              <el-button v-if="scope.row.status==='商品已上架'&&$common.havePower(163)"  @click="handleClick(scope.row,4)" type="text" size="mini" >设置合卖进度</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            background
            @current-change="handleCurrentChange()"
            :current-page.sync="currentPage1"
            :page-size="pageSize"
            layout="prev,total, pager, next,jumper"
            :total="pageTotal*1">
          </el-pagination>
        </div>
      </div>
    </div>
    <div v-else key="showDetail2">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item @click.native="resetForm('ruleForm','showDetail')">返回上一级</el-breadcrumb-item>
        <el-breadcrumb-item>{{controlType.title}}</el-breadcrumb-item>
      </el-breadcrumb>
      <p v-if="ruleForm.checkReason">
        <i class="el-icon-warning" style="color: red"></i>
        <span>驳回申请理由：{{ruleForm.checkReason}}</span>
      </p>
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
          <el-form-item prop="goodsTotal" label="库存量：">
            <el-input :maxlength=13 v-model="ruleForm.goodsTotal" placeholder="请输入库存量">
              <template slot="suffix">件</template>
            </el-input>
          </el-form-item>
          <el-form-item prop="goodsPrice" label="零售单价：">
            <el-input  :maxlength=13  v-model="ruleForm.goodsPrice" placeholder="请输入零售单价">
              <template slot="suffix">元</template>
            </el-input>
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
              <el-option v-for="(item,index) in goods.storage" :key="index" :label="item" :value="index"></el-option>
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
          <p>七、认筹信息</p>
          <el-form-item v-if="ruleForm.goodsPrice&&!isNaN(ruleForm.goodsPrice/1)"  label="零售价：">
          {{ruleForm.goodsPrice}}元
          </el-form-item>
          <el-form-item prop="shareTotal" label="分红总额：">
            <el-input  :maxlength=13  v-model="ruleForm.shareTotal" placeholder="请输入分红总额">
              <template slot="suffix">元</template>
            </el-input>
          </el-form-item>
          <el-form-item prop="fromTotal" label="认筹份数：">
            <el-input  :maxlength=5  v-model="ruleForm.fromTotal" placeholder="请输入认筹份数"></el-input>
          </el-form-item>
          <el-form-item prop="storeMoney" label="售出店铺额外奖励：">
            <el-input :max="100"  :maxlength=5  v-model="ruleForm.storeMoney" placeholder="请输入0-100000之间的金额">
              <template slot="suffix">元</template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="!isNaN(ruleForm.goodsPrice/ruleForm.fromTotal)&&ruleForm.fromTotal&&ruleForm.goodsPrice"  label="认筹单价：">
            {{(ruleForm.goodsPrice/ruleForm.fromTotal).toFixed(2)}}元
          </el-form-item>
          <el-form-item v-if="!isNaN(ruleForm.shareTotal/ruleForm.fromTotal)&&ruleForm.fromTotal&&ruleForm.shareTotal"  label="单笔分红：">
            {{(ruleForm.shareTotal/ruleForm.fromTotal).toFixed(2)}}元
          </el-form-item>
          <el-form-item prop="fromTime" label="认筹发起时间：">
            <el-date-picker
              v-model="ruleForm.fromTime"
              type="daterange"
              :editable="false"
              :clearable="false"
              value-format="yyyy-MM-dd"
              range-separator="至"
              :picker-options="pickerOptions1"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="fromEndTime" label="商品销售截止日期：">
            <el-date-picker
              v-model="ruleForm.fromEndTime"
              type="date"
              :clearable="false"
              :disabled="!ruleForm.fromTime"
              :picker-options="pickerOptions2"
              :editable="false"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <template v-if="tableFrom.length">
            <p>八、认筹明细</p>
            <div  class="from-detail">
              <div>
                <el-progress type="circle" :percentage="ruleForm.numSubscription/ruleForm.numSubscriptionTotal*100">
                </el-progress>
                <p>
                  <span>总额：{{ruleForm.goodsPrice}}元</span><br>
                  <span>已认筹：{{(ruleForm.goodsPrice*ruleForm.numSubscription/ruleForm.numSubscriptionTotal).toFixed(2)}}元</span>
                </p>
              </div>
              <div>
                <el-table  class="admin-table" border   max-height="200"   :data="tableFrom">
                  <el-table-column align="center" prop="user" label="店主"></el-table-column>
                  <el-table-column align="center" prop="mobile" label="手机号"></el-table-column>
                  <el-table-column align="center" prop="userNum" label="认筹份数"></el-table-column>
                  <el-table-column
                    align="center"
                    prop="money"
                    :formatter="function(row) {return (row.money/100).toFixed(2)}"
                    label="认筹金额（元）">

                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="bonus"
                    :formatter="function(row) {return (row.bonus/100).toFixed(2)}"
                    label="预计分红（元）">

                  </el-table-column>
                </el-table>
                <div class="block">
                  <el-pagination
                    background
                    @current-change="handleCurrentChange(2)"
                    :current-page.sync="currentPage2"
                    :page-size="pageSize2"
                    layout="prev,total, pager, next,jumper"
                    :total="pageTotal2*1">
                  </el-pagination>
                </div>
              </div>
            </div>
          </template>
        </el-form>
        <p  style="text-align: right">
          <template v-if="controlType.addBtn">
            <el-button v-if="$common.havePower(item==='确认分红'?124:'no')"  @click="fromChange(item)" v-for="item in controlType.addBtn" :key="item"   size="small"  type="primary">{{item}}</el-button>
          </template>
          <el-button v-if="controlType.btn" @click="addGoodsOk('ruleForm')" size="small"  type="primary">{{controlType.btn}}</el-button>
        </p>
      </div>
    </div>
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
    <el-dialog title="修改合卖进度" width="360px" :visible.sync="dialogFormStatus" @close="currentFormStatus.status=1">
      <span>合卖状态：</span>
      <el-select size="mini" v-model="currentFormStatus.status" style="width: 140px">
        <el-option v-for="(item,index) in goods.formStatus" :key="index" :label="item.label" :value="item.id"></el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="formStatusSet()">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
import adminUpload from './common/admin-upload'
export default {
  name: 'from-manage',
  components: {adminAddress, adminUpload},
  data () {
    var that = this
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      pickerOptions2: {
        disabledDate (time) {
          return time.getTime() < new Date(that.ruleForm.fromTime[1]).getTime() + 3600 * 1000 * 24 * 7
        }
      },
      controlType: {
        title: '申请商品认筹',
        btn: '申请认筹'
      },
      dialogFormVisible: false,
      dialogFormStatus: false,
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
        goodsDeposit: [
          {required: true, message: '请输入定金'},
          {validator: that.$common.integer}
        ],
        storageMethod: [
          {required: true, message: '请选择仓储方式'}
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
        goodsTotal: [
          {required: true, message: '请输入库存量'},
          {validator: that.$common.integer}
        ],
        goodsPrice: [
          {required: true, message: '请输入零售单价'},
          {validator: that.$common.numTo2}
        ],
        propagateFile: [
          {required: true, message: '请上传商品宣传图片'}
        ],
        goodsDetailFile: [
          {required: true, message: '请上传商品详情图片'}
        ],
        shareTotal: [
          {required: true, message: '请输入分红总额'},
          {validator: that.$common.numTo2}
        ],
        fromTotal: [
          {required: true, message: '请输入认筹份数'},
          {validator: that.$common.integer}
        ],
        storeMoney: [
          {required: true, message: '请输入售出店铺额外奖励'},
          {validator: that.$common.integer}
        ],
        fromTime: [
          {required: true, message: '请选择认筹发起时间'}
        ],
        fromEndTime: [
          {required: true, message: '请选择商品销售截止日期'},
          {
            validator: function (rule, value, callback) {
              if (!that.ruleForm.fromTime.length) {
                return callback(new Error('请选择认筹发起时间'))
              }
              callback()
            }
          }
        ]
      },
      multipleSelection: [],
      showDetail: false,
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0,
      currentPage2: 1,
      pageSize2: 20,
      pageTotal2: 0,
      goodsParametersData: [],
      goodsParameters: {
        title: '',
        detail: ''
      },
      tableFrom: [],
      tableData: [],
      goods: {
        server: [],
        way: [
          {name: '全部', id: 2},
          {name: '快递', id: 0},
          {name: '自取', id: 1}
        ],
        brand: [],
        formStatus: [
          {label: '正在合卖', id: 1},
          {label: '预订成功', id: 2},
          {label: '支付尾款', id: 3},
          {label: '提货成功', id: 4}
        ],
        type: [
          {name: '全部', categoryId: ''}
        ],
        status: [
          {name: '全部', id: ''},
          {name: '认筹被退回', id: -4},
          {name: '认筹审请中', id: -2},
          {name: '认筹被拒绝', id: -3},
          {name: '认筹已开启', id: 0},
          {name: '商品已上架', id: 1},
          {name: '认筹失败', id: 3},
          {name: '已售出', id: 2}
        ],
        storage: ['平台仓储', '货源自主仓储']
      },
      currentFormStatus: {
        status: 1
      },
      ruleForm2: {
        goodsName: '',
        goodsType: '',
        goodsStatus: ''
      },
      currentImg: {
        key: '',
        index: ''
      },
      ruleForm: {
        goodsName: '',
        shareTotal: '',
        fromTotal: '',
        storeMoney: '',
        fromTime: '',
        fromEndTime: '',
        goodsType: '',
        goodsTotal: '',
        goodsPrice: '',
        goodsBrand: '',
        paymentMethod: 0,
        delivery: 0,
        checkDeposit: '',
        goodsDeposit: '',
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
      url: 'item/getCatList.action',
      params: {
        isRecommend: 0
      }
    }).then(function (res) {
      if (res) {
        that.goods.type = that.goods.type.concat(res)
      }
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
    fromChange (type) {
      var that = this
      var titleContent = {
        title: '认筹拒绝',
        type: -3,
        text: '请输入拒绝原因'
      }
      if (type === '确认分红') {
        this.$confirm('是否确认分红', '确认分红', {
          confirmButtonText: '确定',
          type: 'info',
          cancelButtonText: '取消'
        }).then(() => {
          that.$axios({
            method: 'get',
            url: 'sub/confirmBounsAvg.action',
            params: {
              goodsId: that.ruleForm.id
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.resetForm('ruleForm', 'showDetail')
            that.showDetail = false
            that.pageData()
          })
        }).catch(() => {

        })
      } else if (type === '审核通过') {
        var html = '<p>' + that.ruleForm.goodsName + '</p>'
        html += '<p>1、认筹时间' + that.ruleForm.fromTime[0] + '至' + that.ruleForm.fromTime[1] + '，认筹成功后将自动上架；</p>'
        html += '<p>2、商品销售截止日期为' + that.ruleForm.fromEndTime + '</p>'
        this.$confirm(html, '审核通过', {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true,
          type: 'info',
          cancelButtonText: '取消'
        }).then(() => {
          that.$axios({
            method: 'post',
            url: 'sub/saveSubItemStatus.action',
            data: {
              itemId: that.ruleForm.id,
              type: -1
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
        if (type === '认筹退回') {
          titleContent = {
            title: '认筹退回',
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
            url: 'sub/saveSubItemStatus.action',
            data: {
              itemId: that.ruleForm.id,
              reason: value,
              type: titleContent.type
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
    formStatusSet () {
      var that = this
      that.$axios({
        method: 'post',
        url: 'sub/updateSelleStatus.action',
        data: {
          goodsId: that.currentFormStatus.id,
          sellStatus: that.currentFormStatus.status
        }
      }).then(function () {
        that.$message.success('操作成功')
        that.dialogFormStatus = false
        that.pageData()
      })
    },
    pageData () {
      var that = this
      if (this.showDetail) {
        this.resetForm()
        this.showDetail = false
      }
      this.$axios({
        method: 'get',
        url: 'sub/subList.action',
        params: {
          pages: that.currentPage1,
          categoryId: that.ruleForm2.goodsType,
          rows: that.pageSize,
          type: 4,
          status: that.ruleForm2.goodsStatus,
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
          var option = {
            name: currentVal.goodsName,
            priceSales: Math.round(currentVal.goodsPrice * 100),
            detail: that.$common.imgUrl(currentVal.goodsDetailFile),
            categoryId: currentVal.goodsType,
            imgs: that.$common.imgUrl(currentVal.propagateFile),
            stock: currentVal.goodsTotal,
            brandId: currentVal.goodsBrand,
            param: that.$common.arrFomat(that.goodsParametersData),
            payType: 0,
            getWay: currentVal.delivery,
            deposit: currentVal.goodsDeposit ? Math.round(currentVal.goodsDeposit * 100) : '',
            serviceId: that.serverList.checkedServer.join(';'),
            type: currentVal.storageMethod,
            subscriptionStartTime: currentVal.fromTime[0],
            subscriptionEndTime: currentVal.fromTime[1],
            salesEndTime: currentVal.fromEndTime,
            numSubscriptionTotal: currentVal.fromTotal,
            bonusAvg: Math.round(currentVal.shareTotal * 100 / currentVal.fromTotal),
            salesAward: Math.round(currentVal.storeMoney * 100),
            bonus: Math.round(currentVal.shareTotal * 100),
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
          currentVal.id ? option.id = currentVal.id : option.adminId = sessionStorage.getItem('userId')
          that.$axios({
            method: 'post',
            url: 'sub/saveSubItem.action',
            data: option
          }).then(function (res) {
            that.$message.success('操作成功!')
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
    handleCurrentChange (type) {
      if (type === 2) {
        this.fromDetail()
      }
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
          goodsStatus: ''
        }
      }
      if (data) {
        this.tableFrom = []
        this.currentPage2 = 1
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
          shareTotal: '',
          fromTotal: '',
          storeMoney: '',
          fromTime: '',
          fromEndTime: '',
          checkDeposit: '',
          goodsDeposit: '',
          goodsType: '',
          goodsTotal: '',
          goodsPrice: '',
          goodsBrand: '',
          paymentMethod: 0,
          delivery: 0,
          storageMethod: '',
          storageAddressAll: this.$common.storeData.storageAddress || {},
          selfAddressAll: {},
          propagateFile: [],
          goodsDetailFile: []
        }
        this.addressList = {
          storageAddress: [],
          storageAddressInfo: '',
          storageAddressName: '',
          storageAddressPhone: ''
        }
        this[data] = false
        this.goods.brand = []
        this.goodsParametersData = []
        this.goodsParameters = {
          title: '',
          detail: ''
        }
        this.controlType = {
          title: '申请商品认筹',
          btn: '申请认筹'
        }
      }
      this.$refs[formName].resetFields()
    },
    fromDetail () {
      var that = this
      that.$axios({
        method: 'get',
        url: 'sub/getSubDetail.action',
        params: {
          pages: that.currentPage2,
          rows: that.pageSize2,
          itemId: that.ruleForm.id
        }
      }).then(function (res) {
        that.tableFrom = res.rows
        that.pageTotal2 = res.total
      })
    },
    handleClick (data, type) {
      var that = this
      if (type === 4) {
        this.dialogFormStatus = true
        that.currentFormStatus = {
          id: data.id,
          status: +data.sellStatus
        }
        return
      }
      that.$axios({
        method: 'get',
        url: 'sub/getSubItem.action',
        params: {
          itemId: data.id
        }
      }).then(function (res) {
        that.ruleForm = {
          id: res.goods.id,
          numSubscription: res.goods.numSubscription,
          numSubscriptionTotal: res.goods.numSubscriptionTotal,
          checkReason: res.goods.checkReason || '',
          fromTime: [that.$options.filters['dateFormat'](res.goods.subscriptionStartTime, 1), that.$options.filters['dateFormat'](res.goods.subscriptionEndTime, 1)],
          fromEndTime: that.$options.filters['dateFormat'](res.goods.salesEndTime, 1),
          fromTotal: res.goods.numSubscriptionTotal,
          shareTotal: (res.goods.bonusAvg / 100 * res.goods.numSubscriptionTotal).toFixed(2),
          storeMoney: (res.goods.salesAward / 100).toFixed(),
          goodsName: res.goods.name,
          goodsType: res.goods.categoryId,
          goodsTotal: res.goods.stock,
          goodsPrice: (res.goods.priceSales / 100).toFixed(2),
          goodsBrand: res.goods.brandId,
          checkDeposit: +res.goods.deposit > 0,
          goodsDeposit: res.goods.deposit > 0 ? Math.round(res.goods.deposit / 100) : '',
          paymentMethod: res.goods.payType,
          delivery: res.goods.getWay,
          storageMethod: res.goodsWarehouse.type,
          storageAddressAll: {
            province: res.goodsWarehouse.province,
            city: res.goodsWarehouse.city,
            area: res.goodsWarehouse.area,
            address: res.goodsWarehouse.address,
            mobile: res.goodsWarehouse.mobile,
            name: res.goodsWarehouse.name
          },
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
        that.addGoods()
        that.showDetail = true
        if (type === 2) {
          that.controlType = {
            title: '修改商品认筹',
            btn: '修改认筹'
          }
        } else if (type === 3) {
          that.controlType = {
            title: '商品认筹审核',
            btn: '',
            addBtn: ['认筹拒绝', '认筹退回', '审核通过']
          }
        } else {
          that.controlType = {
            title: '商品认筹查看',
            btn: ''
          }
          if (+res.goods.subscriptionStatus === 2) {
            that.controlType.addBtn = ['确认分红']
          }
        }
        that.fromDetail()
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
.from-detail>div:first-child{
  float: left;
  text-align: center;
}
.from-detail>div:last-child{
  width: 100%;
  padding-left: 200px;
  box-sizing: border-box;
}
</style>
