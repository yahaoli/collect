<template>
  <div>
    <div class="el-form el-form--inline">
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-input  @keyup.enter.native="formSearch()"  size="small" :maxlength=20 v-model="ruleForm2.account" placeholder="请输入手机号/身份证/姓名"></el-input>
        </div>
      </div>
      <div class="el-form-item el-form-item--feedback el-form-item--small">
        <div class="el-form-item__content">
          <el-button size="small" type="primary" @click="ruleForm2.account=''">重置</el-button>
          <el-button size="small" type="primary" @click="formSearch()">搜索</el-button>
        </div>
      </div>
    </div>
    <div class="tree-content">
      <el-tree
        highlight-current
        default-expand-all
        ref="tree"
        class="admin-tree"
        :data="treeList"
        node-key="id"
        :expand-on-click-node=false
        @node-click="handleNodeClick">

      </el-tree>
      <div  class="tree-con">
        <div v-if="userRole===2&&$common.havePower(114)" style="text-align: right;margin-bottom: 10px">
          <el-button data-id="114" @click="dialogFormVisible = true" type="primary" size="mini">新建账号</el-button>
        </div>
        <div v-else-if="userRole===0&&$common.havePower(133)" style="text-align: right;margin-bottom: 10px">
          <el-button @click="dialogFormVisible = true" type="primary" size="mini">新建账号</el-button>
        </div>
        <div v-else-if="userRole===1&&$common.havePower(115)" style="text-align: right;margin-bottom: 10px">
          <el-button @click="dialogFormVisible = true" type="primary" size="mini">新建账号</el-button>
        </div>
        <div v-else-if="userRole===3&&$common.havePower(116)" style="text-align: right;margin-bottom: 10px">
          <el-button @click="dialogFormVisible = true" type="primary" size="mini">新建账号</el-button>
        </div>
        <el-table  ref="multipleTable" @select-all="checked=!checked" @selection-change="handleSelectionChange" class="admin-table" border   max-height="400"   :data="tableData">
          <el-table-column
            type="selection"
            align="center"
            >
          </el-table-column>
          <el-table-column align="center" prop="mobile" label="手机号"></el-table-column>
          <el-table-column align="center" prop="name" label="姓名"></el-table-column>
          <el-table-column align="center" prop="idCard" label="身份证号"></el-table-column>
          <el-table-column align="center" prop="roleList" label="操作权限">
            <template slot-scope="scope">
              {{scope.row.roleName?scope.row.roleName.join(';'):''}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="invitationLen" label="邀请用户数"></el-table-column>
          <el-table-column v-if="userRole===2" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(134)"  @click="handleClick(scope.row,1)" type="text" size="mini">修改</el-button>
              <el-button v-if="$common.havePower(135)"  @click="handleClick(scope.row,2)" type="text" size="mini">删除</el-button>
              <el-button v-if="$common.havePower(136)"  @click="handleClick(scope.row,3)" type="text" size="mini">密码重置</el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="userRole===1" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(8)"  @click="handleClick(scope.row,1)" type="text" size="mini">修改</el-button>
              <el-button v-if="$common.havePower(9)"  @click="handleClick(scope.row,2)" type="text" size="mini">删除</el-button>
              <el-button v-if="$common.havePower(10)" @click="handleClick(scope.row,3)" type="text" size="mini">密码重置</el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="userRole===3" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(12)"  @click="handleClick(scope.row,1)" type="text" size="mini">修改</el-button>
                <el-button v-if="$common.havePower(13)"  @click="handleClick(scope.row,2)" type="text" size="mini">删除</el-button>
                <el-button v-if="$common.havePower(14)" @click="handleClick(scope.row,3)" type="text" size="mini">密码重置</el-button>
            </template>
          </el-table-column>
          <el-table-column v-else-if="userRole===0" align="center" prop="handle" label="操作">
            <template slot-scope="scope">
              <el-button v-if="$common.havePower(4)"  @click="handleClick(scope.row,1)" type="text" size="mini">修改</el-button>
                <el-button v-if="$common.havePower(5)"  @click="handleClick(scope.row,2)" type="text" size="mini">删除</el-button>
                <el-button v-if="$common.havePower(6)"  @click="handleClick(scope.row,3)" type="text" size="mini">密码重置</el-button>
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
            <div v-if="userRole===2" style="display: inline-block">
              <el-button v-if="$common.havePower(135)"  @click="handleMultiple(1)" type="text" size="mini">批量删除</el-button>
              <el-button v-if="$common.havePower(136)"  @click="handleMultiple(2)" type="text" size="mini">批量重置密码</el-button>
            </div>
            <div v-else-if="userRole===1" style="display: inline-block">
              <el-button v-if="$common.havePower(9)"  @click="handleMultiple(1)" type="text" size="mini">批量删除</el-button>
              <el-button v-if="$common.havePower(10)"  @click="handleMultiple(2)" type="text" size="mini">批量重置密码</el-button>
            </div>
            <div v-else-if="userRole===0" style="display: inline-block">
              <el-button v-if="$common.havePower(5)"  @click="handleMultiple(1)" type="text" size="mini">批量删除</el-button>
              <el-button v-if="$common.havePower(6)"  @click="handleMultiple(2)" type="text" size="mini">批量重置密码</el-button>
            </div>
            <div  v-else-if="userRole===3" style="display: inline-block">
              <el-button v-if="$common.havePower(13)"  @click="handleMultiple(1)" type="text" size="mini">批量删除</el-button>
              <el-button v-if="$common.havePower(14)"  @click="handleMultiple(2)" type="text" size="mini">批量重置密码</el-button>
            </div>
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog  :title="controlType.title" width="1000px" :visible.sync="dialogFormVisible" @close="resetForm('ruleForm')">
      <div>
        <el-form  :inline="true" size="mini" :model.sync="ruleForm" :rules="rules" ref="ruleForm" label-width="140px">
          <el-form-item prop="phone" label="手机号：" >
            <el-input :maxlength=11  v-model="ruleForm.phone" placeholder="请输入手机号"  style="width: 140px"></el-input>
          </el-form-item>
          <template  v-if="userRole===2||userRole===3">
            <el-form-item prop="role" label="操作权限：" >
              <el-select v-model="ruleForm.role" style="width: 140px">
                <template v-for="item in common.powerList">
                  <el-option :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item prop="dataRole" label="数据权限：" >
              <el-select v-model="ruleForm.dataRole" style="width: 140px">
                <template v-for="item in common.dataRoleList">
                  <el-option :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                </template>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item v-if="userRole===0||userRole===2"  prop="name" label="姓名：">
            <el-input style="width: 140px" :maxlength=20 v-model="ruleForm.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item v-else :rules="[{required: true, message: '请输入姓名'}]" label="姓名：" prop="name">
            <el-input style="width: 140px" :maxlength=20 v-model="ruleForm.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item v-if="userRole===0||userRole===2"  :rules="[{validator: $common.idCard}]" prop="idCard" label="身份证号：" >
            <el-input
              style="width: 140px"
              :maxlength=18
              v-model="ruleForm.idCard"
              placeholder="请输入身份证">

            </el-input>
          </el-form-item>
          <el-form-item v-else  :rules="[{required: true, message: '请输入身份证号'},{validator: $common.idCard}]" prop="idCard" label="身份证号：" >
            <el-input
              style="width: 140px"
              :maxlength=18
              v-model="ruleForm.idCard"
              placeholder="请输入身份证">

            </el-input>
          </el-form-item>

          <el-form-item label="性别：" prop="sex">
            <el-select v-model="ruleForm.sex" style="width: 140px">
              <el-option label="男" value="0"></el-option>
              <el-option label="女" value="1"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="userRole===1||userRole===3">
            <el-form-item prop="giveNum" label="打款账号：" >
              <el-input style="width: 140px" :maxlength=19  v-model="ruleForm.giveNum" placeholder="请输入打款账号"></el-input>
            </el-form-item>
            <el-form-item  prop="giveName" label="打款户名：" >
              <el-input :maxlength=15 style="width: 140px"  v-model="ruleForm.giveName" placeholder="请输入打款户名"></el-input>
            </el-form-item>
            <el-form-item prop="giveBank" label="打款银行：" >
              <el-select v-model="ruleForm.giveBank" style="width: 140px">
                <el-option v-for="(item,index) in bankList" v-bind:key="index" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item  prop="giveBankAddress" label="开户行：" >
              <el-input :maxlength=30 style="width: 140px"  v-model="ruleForm.giveBankAddress" placeholder="请输入开户行"></el-input>
            </el-form-item>
            <p v-if="userRole===1&&ruleForm.invite&&ruleForm.invite.length">邀请用户：
              <span v-for="(item,index) in ruleForm.invite" :key="index">{{item}}</span>
            </p>
          </template>
          <template v-if="userRole===3">
            <el-form-item  prop="address" label="地址：" >
              <el-input style="width: 140px" :maxlength=20  v-model="ruleForm.address" placeholder="请输入地址"></el-input>
            </el-form-item>
            <el-form-item  prop="legalPerson" label="法人姓名：" >
              <el-input style="width: 140px"  :maxlength=20  v-model="ruleForm.legalPerson" placeholder="请输入法人姓名"></el-input>
            </el-form-item>
            <el-form-item prop="legalPhone" label="法人联系方式：" >
              <el-input style="width: 140px" :maxlength=11  v-model="ruleForm.legalPhone"   placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item prop="repayNum" label="还款账户：" >
              <el-input style="width: 140px" :maxlength=19  v-model="ruleForm.repayNum" placeholder="请输入还款账户"></el-input>
            </el-form-item>
            <el-form-item prop="repayName" label="还款户名：" >
              <el-input style="width: 140px" :maxlength=15  v-model="ruleForm.repayName" placeholder="请输入还款户名"></el-input>
            </el-form-item>
            <el-form-item prop="repayBank" label="还款银行：">
              <el-select v-model="ruleForm.repayBank" style="width: 140px">
                <el-option v-for="(item,index) in bankList" v-bind:key="index" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="repayBankAddress" label="还款开户行：" >
              <el-input :maxlength=30 style="width: 140px"  v-model="ruleForm.repayBankAddress" placeholder="请输入还款开户行"></el-input>
            </el-form-item>
            <el-form-item prop="companyName" label="企业名称：" >
              <el-input style="width: 140px" :maxlength=50  v-model="ruleForm.companyName"   placeholder="请输入企业名称"></el-input>
            </el-form-item>
            <el-form-item prop="companyNum" label="企业信用代码：">
              <el-input style="width: 140px" :maxlength=20  v-model="ruleForm.companyNum"   placeholder="请输入企业信用代码"></el-input>
            </el-form-item>
            <br>
            <el-form-item prop="storageAddress" label="仓储地址：" >
              <adminAddress v-model="ruleForm.storageAddress" @change="handleCity" selectGrade="3" ></adminAddress>
            </el-form-item>
            <el-form-item prop="storageAddressInfo">
              <el-input :maxlength=20  v-model="ruleForm.storageAddressInfo" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            <el-form-item prop="storageAddressName">
              <el-input :maxlength=20  v-model="ruleForm.storageAddressName" placeholder="请输入联系人姓名"></el-input>
            </el-form-item>
            <el-form-item prop="storageAddressPhone">
              <el-input :maxlength=15  v-model="ruleForm.storageAddressPhone" placeholder="请输入联系人方式"></el-input>
            </el-form-item>
            <br>
            <el-form-item prop="companyFile" label="附件：" >
              <el-upload
                action="admin/pic/upload.action"
                :file-list="ruleForm.companyFile"
                list-type="picture"
                name="uploadFile"
                :before-upload="$common.beforeImg"
                :on-preview="handlePreview('companyFile')"
                :on-remove="handleRemove(2,'companyFile')"
                :before-remove="handleRemove(1,'companyFile')"
                :on-error="$common.imgError"
                :on-success="imgOK('companyFile')">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
          </template>
        </el-form>
        <div v-if="invite.exist.length" style="margin-bottom: 10px">
          <label>已有品牌：</label>
          <el-tag
            :key="tag"
            size="medium"
            v-for="tag in invite.exist"
            closable
            @close="removeBrand(tag)">
            {{tag}}
          </el-tag>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm2('ruleForm')">{{controlType.btn}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import adminAddress from './common/admin-address'
export default {
  name: 'account-manage',
  data () {
    var that = this
    return {
      invite: {
        exist: []
      },
      userRole: 2,
      bankList: [],
      ruleForm: {
        pass: '123456',
        phone: '',
        role: '',
        dataRole: '',
        name: '',
        sex: '0',
        idCard: '',
        giveNum: '',
        giveBank: '',
        giveBankAddress: '',
        giveName: '',
        address: '',
        legalPerson: '',
        legalPhone: '',
        repayNum: '',
        repayName: '',
        repayBank: '',
        repayBankAddress: '',
        companyName: '',
        companyNum: '',
        companyFile: [],
        storageAddress: [],
        storageAddressInfo: '',
        storageAddressName: '',
        storageAddressPhone: ''
      },
      controlType: {
        title: '新建用户',
        btn: '新建'
      },
      rules: {
        phone: [
          {required: true, message: '请输入手机号'},
          {validator: that.$common.phone}
        ],
        role: [
          {required: true, message: '请选择操作权限'}
        ],
        dataRole: [
          {required: true, message: '请选择数据权限'}
        ],
        giveNum: [
          {required: true, message: '请输入打款账户'},
          {validator: that.$common.integer},
          {min: 16, max: 19, message: '打款账户16-19位'}
        ],
        repayNum: [
          {validator: that.$common.integer},
          {min: 16, max: 19, message: '打款账户16-19位'}
        ],
        giveName: [
          {required: true, message: '请输入打款户名'}
        ],
        giveBank: [
          {required: true, message: '请选择打款银行'}
        ],
        giveBankAddress: [
          {required: true, message: '请输入开户行'}
        ],
        address: [
          {required: true, message: '请输入地址'}
        ],
        legalPerson: [
          {required: true, message: '请输入法人姓名'}
        ],
        legalPhone: [
          {required: true, message: '请输入手机号'},
          {validator: that.$common.phone}
        ],
        companyName: [
          {required: true, message: '请输入企业名称'}
        ],
        companyNum: [
          {required: true, message: '请输入企业信用代码'}
        ],
        companyFile: [
          {required: true, message: '请添加附件'}
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
      },
      tableData: [],
      dialogFormVisible: false,
      multipleSelection: [],
      checked: false,
      treeList: [],
      treeHave: [],
      ruleForm2: {
        account: ''
      },
      currentPage1: 1,
      common: {
        powerList: [],
        dataRoleList: []
      },
      pageSize: 20,
      pageTotal: 0
    }
  },
  components: {adminAddress},
  created () {
    var list = [{
      label: '茂茂管理后台',
      id: 2,
      power: 132
    },
    {
      label: '普通用户',
      power: 3,
      id: 0
    },
    {
      label: '个人店铺用户',
      power: 7,
      id: 1
    },
    {
      label: '公司店铺用户',
      power: 11,
      id: 3
    }
    ]
    var currentList = this.$common.powerFilter(list, 'power')
    this.userRole = currentList[0].id
    this.treeHave = currentList
    this.pageData()
    var that = this
    this.$axios({
      method: 'get',
      url: 'role/getRoleAll.action'
    }).then(function (res) {
      that.common.powerList = res
    })
    this.$axios({
      method: 'get',
      url: 'role/getDataRoleAll.action'
    }).then(function (res) {
      that.common.dataRoleList = res
    })
    this.$axios({
      method: 'get',
      url: 'user/getBankList.action'
    }).then(function (res) {
      that.bankList = res
    })
  },
  methods: {
    handleCity (value) {
      this.ruleForm.storageAddress = value
    },
    formSearch () {
      this.currentPage1 = 1
      this.pageData()
    },
    pageData (type) {
      var that = this
      var url = 'user/getIndividualUserList.action'
      if (this.userRole === 2 || this.userRole === 3) {
        url = 'user/getSupplierUserList.action'
      }
      if (!type) {
        this.$axios({
          method: 'post',
          url: 'user/getUserAndAdminList.action',
          data: {
            queryString: that.ruleForm2.account
          }
        }).then(function (res) {
          that.treeHave.forEach(function (item) {
            if (item.id === 2) {
              item.label = '茂茂管理后台(' + res.internalNum + ')'
            } else if (item.id === 0) {
              item.label = '普通用户(' + res.ordinaryNum + ')'
            } else if (item.id === 1) {
              item.label = '个人店铺用户(' + res.individualNum + ')'
            } else {
              item.label = '公司店铺用户(' + res.supplierNum + ')'
            }
          })
          that.treeList = that.treeHave
          that.$nextTick(function () {
            that.$refs['tree'].setCurrentKey(that.userRole)
          })
        })
      }
      that.tableData = []
      this.$axios({
        method: 'post',
        url: url,
        data: {
          pages: that.currentPage1,
          type: that.userRole % 2,
          rows: that.pageSize,
          queryString: that.ruleForm2.account
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.ruleForm = {
        pass: '123456',
        phone: '',
        role: '',
        dataRole: '',
        name: '',
        sex: '0',
        idCard: '',
        giveNum: '',
        giveBank: '',
        giveBankAddress: '',
        giveName: '',
        address: '',
        legalPerson: '',
        legalPhone: '',
        repayNum: '',
        repayName: '',
        repayBank: '',
        repayBankAddress: '',
        companyName: '',
        companyNum: '',
        companyFile: [],
        storageAddress: [],
        storageAddressInfo: '',
        storageAddressName: '',
        storageAddressPhone: ''
      }
      this.controlType = {
        title: '新建用户',
        btn: '新建'
      }
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    handleCurrentChange () {
      this.pageData(1)
    },
    handleMultiple (type) {
      var that = this
      var url = 'user/delUser.action'
      if (!this.multipleSelection.length) {
        that.$message.info('请选择用户!')
        return
      }
      var confirmData = {
        title: '批量删除',
        content: '是否确认批量删除这些用户'
      }
      if (that.userRole === 2 || that.userRole === 3) {
        url = 'user/delAdminUser.action'
      }
      if (type === 2) {
        url = 'user/ResetUserPassword.action'
        if (that.userRole === 2 || that.userRole === 3) {
          url = 'user/ResetAdminUserPassword.action'
        }
        confirmData.content = '是否确认批量将登陆密码重置为：123456，重置后不可恢复'
        confirmData.title = '批量重置'
      }
      this.$confirm(confirmData.content, confirmData.title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var option = {
          type: that.userRole % 2
        }
        var a = that.multipleSelection.map(function (item) {
          return item.id || item.userId ? item.id || item.userId : item.adminId
        })
        if (that.userRole === 2 || that.userRole === 3) {
          option.adminIds = a
        } else {
          option.userIds = a
        }
        that.$axios({
          method: 'post',
          url: url,
          data: option
        }).then(function () {
          that.pageData(1)
          that.$message.success('操作成功!')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    handleNodeClick (data) {
      this.currentPage1 = 1
      this.userRole = data.id
      this.pageData(1)
    },
    handlePreview (data) {
      var that = this
      return (file, fileList) => {
        data && that.$emit('openImg', file.url)
      }
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
          var index = that.$common.findElem(that.ruleForm[data], 'name', file.name)
          if (index > -1) {
            that.ruleForm[data].splice(index, 1)
          }
        }
      }
    },
    imgOK (a) {
      return (response, file, fileList) => {
        if (!this.$common.imgRes(response)) {
          fileList.pop()
          return
        }
        var index = this.ruleForm[a].length
        this.ruleForm[a].push(
          {
            name: '第' + (index + 1) + '张',
            url: response.data.url
          }
        )
      }
    },
    handleClick (data, type) {
      var that = this
      var option = {
        type: that.userRole % 2
      }
      var url = ''
      if (type === 1) {
        if (data.id || data.userId) {
          option.userId = data.id || data.userId
        }
        if (data.adminId) {
          option.adminId = data.adminId
        }
        url = 'user/editIndividualUser.action'
        if (that.userRole === 2 || that.userRole === 3) {
          url = 'user/editSupplierUser.action'
        }
        that.$axios({
          method: 'post',
          url: url,
          data: option
        }).then(function (res) {
          var currentForm = {
            phone: res.mobile,
            userId: res.userId || '',
            invite: res.invitation,
            adminId: res.adminId || '',
            role: res.roleList ? res.roleList[0] : '',
            dataRole: res.dataRoleList ? res.dataRoleList[0] : '',
            name: res.name || res.userName,
            sex: '0',
            idCard: res.idCard || res.leaglPersonId,
            giveNum: res.account || res.bankAccount,
            giveBank: res.bankName,
            giveBankAddress: res.accountsBank,
            giveName: res.bankUserName || res.bankUser,
            legalPerson: res.legalPerson,
            legalPhone: res.legalPersonMobile,
            repayNum: res.repaymentBankAccount,
            repayName: res.repaymentBankUser,
            repayBank: res.repaymentBankName,
            repayBankAddress: res.repaymentAccountsBank,
            companyName: res.companyName,
            companyNum: res.companyCode,
            address: res.companyAddress,
            companyFile: res.enclosure ? res.enclosure.split(';').map(function (item, index) {
              return {
                name: '第' + (index * 1 + 1) + '张',
                url: item
              }
            }) : []
          }
          if (that.userRole === 3) {
            currentForm.storageAddress = [res.province, res.city, res.area]
            currentForm.storageAddressInfo = res.address
            currentForm.storageAddressName = res.addressName
            currentForm.storageAddressPhone = res.addressMobile
          }
          that.ruleForm = currentForm
          that.controlType = {
            title: '修改账户',
            btn: '修改'
          }
          that.dialogFormVisible = true
        })
        return
      }
      if (data.id || data.userId) {
        option.userIds = data.id || data.userId
      }
      if (data.adminId) {
        option.adminIds = data.adminId
      }
      var confirmData = {
        title: '',
        content: ''
      }
      if (type === 2) {
        url = 'user/delUser.action'
        if (that.userRole === 2 || that.userRole === 3) {
          url = 'user/delAdminUser.action'
        }
        confirmData.content = '是否确认删除' + data.name + '（身份证：' + data.idCard + '）的' + data.mobile + '的登陆账号，删除后将不可恢复。'
        confirmData.title = '删除账号'
      } else if (type === 3) {
        url = 'user/ResetUserPassword.action'
        if (that.userRole === 2 || that.userRole === 3) {
          url = 'user/ResetAdminUserPassword.action'
        }
        confirmData.content = '是否确认将登陆密码重置为：123456，重置后不可恢复'
        confirmData.title = '密码重置'
      }
      this.$confirm(confirmData.content, confirmData.title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.$axios({
          method: 'post',
          url: url,
          data: option
        }).then(function (res) {
          that.$message.success('操作成功')
          that.pageData(1)
        })
      }).catch(() => {
      })
    },
    submitForm2 (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var url = 'user/addIndividualUser.action'
          if (that.controlType.btn === '新建') {
            if (that.userRole === 2 || that.userRole === 3) {
              url = 'user/addSupplierUser.action'
            }
          } else {
            url = 'user/updateIndividualUser.action'
            if (that.userRole === 2 || that.userRole === 3) {
              url = 'user/updateSupplierUser.action'
            }
          }
          var currentVal = that.ruleForm
          var option = {
            mobile: currentVal.phone,
            password: currentVal.pass,
            name: currentVal.name,
            idCard: currentVal.idCard,
            dataRoleId: currentVal.dataRole,
            leaglPersonId: currentVal.idCard,
            sex: currentVal.sex,
            roleId: currentVal.role,
            account: currentVal.giveNum,
            bankAccount: currentVal.giveNum,
            userName: currentVal.giveName,
            bankUser: currentVal.giveName,
            bankName: currentVal.giveBank,
            accountsBank: currentVal.giveBankAddress,
            legalPersion: currentVal.legalPerson,
            legalPersonMobile: currentVal.legalPhone,
            repaymentBankAccount: currentVal.repayNum,
            repaymentBankName: currentVal.repayBank,
            repaymentBankUser: currentVal.repayName,
            repaymentAccountsBank: currentVal.repayBankAddress,
            companyName: currentVal.companyName,
            companyAddress: currentVal.address,
            companyCode: currentVal.companyNum,
            enclosure: currentVal.companyFile.length ? that.$common.imgUrl(currentVal.companyFile) : '',
            type: that.userRole % 2
          }
          if (that.userRole === 3) {
            option.province = currentVal.storageAddress[0]
            option.city = currentVal.storageAddress[1]
            option.area = currentVal.storageAddress[2]
            option.address = currentVal.storageAddressInfo
            option.addressName = currentVal.storageAddressName
            option.addressMobile = currentVal.storageAddressPhone
          }
          if (currentVal.adminId) {
            option.adminId = currentVal.adminId
          }
          if (currentVal.userId) {
            option.userId = currentVal.userId
          }
          that.$axios({
            method: 'post',
            url: url,
            data: option
          }).then(function () {
            that.$message.success('操作成功')
            that.dialogFormVisible = false
            that.pageData(1)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
  .tree-content{
    position: relative;
  }
.admin-tree{
  float: left;
  width: 185px;
}
  .tree-con{
    position: relative;
    overflow-x: hidden;
  }
</style>
