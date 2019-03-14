<template>
  <div >
    <el-tabs v-model="activeRole" type="card" @tab-click="tabClick">
      <el-tab-pane
        v-for="(item) in roleList"
        :key="item.name"
        :label="item.label"
        :name="item.name"
      >

      </el-tab-pane>
    </el-tabs>
    <div style="text-align: right;margin-bottom: 10px">
      <el-button v-if="activeRole==='2'" @click="openDialog()" type="primary" size="small">{{controlType.title}}</el-button>
      <el-button v-else @click="openDialog()" type="primary" size="small">{{controlType.title}}</el-button>
    </div>
    <el-table ref="multipleTable" class="admin-table" border max-height="400" :data="tableData">
      <template v-for="(item,index) in tableHead" >
        <el-table-column :key="index" align="center" :prop="item.prop" :label="item.label"></el-table-column>
      </template>
      <el-table-column v-if="activeRole==='2'" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row,1)" type="text" size="mini">修改</el-button>
          <el-button @click="handleClick(scope.row,2)" type="text" size="mini">删除</el-button>
          <el-button @click="handleClick(scope.row,3)" type="text" size="mini">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column v-else align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button @click="handleClick2(scope.row,1)" type="text" size="mini">修改</el-button>
          <el-button @click="handleClick2(scope.row,2)" type="text" size="mini">删除</el-button>
          <el-button @click="handleClick2(scope.row,3)" type="text" size="mini">查看</el-button>
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
    <el-dialog :title="controlType.title" :fullscreen="!controlType.full" :width="controlType.width||'1150px'" :visible.sync="dialogFormVisible" @close="resetForm()">
      <div v-if="activeRole==='2'">
        <label style="color: #f56c6c">*</label><span>角色名：</span>
        <el-input :maxlength=10 style="width: 200px" size="mini" v-model="roleForm.name"
                  placeholder="请输入角色名称"></el-input>
        <el-tree
          :data="powerData"
          show-checkbox
          default-expand-all
          class="tree-list clear"
          :default-checked-keys="checkedPower"
          :props="defaultProps"
          node-key="id"
          ref="treePower">
        </el-tree>
      </div>
      <div v-else>
        <p>
          <span style="width: 110px;display: inline-block"><label style="color: #f56c6c">*</label>数据权限名称：</span>
          <el-input :disabled="!controlType.btn" :maxlength=10 style="width: 200px" size="mini" v-model="roleForm.dataName"
                    placeholder="数据权限名称"></el-input>
        </p>
        <p v-if="+roleForm.dataType===1">
          <label style="width: 110px;display: inline-block">可见范围：</label>
          <el-input :disabled="!controlType.btn" :maxlength=11 style="width: 200px" size="mini" v-model="roleForm.addName"
                    placeholder="请输入手机号"></el-input>
          <el-button :disabled="!controlType.btn" size="small"  type="primary" @click="addUser()">添加</el-button>
        </p>
        <p>
          <el-radio-group :disabled="!controlType.btn" v-model="roleForm.dataType" size="mini">
            <el-radio  label="0" border>全部</el-radio>
            <el-radio  label="1" border>部分</el-radio>
            <el-radio  label="2" border>个人</el-radio>
          </el-radio-group>
        </p>
        <div v-if="+roleForm.dataType===1" style="max-height: 300px">
          <el-tag
            :key="tag.mobile"
            size="medium"
            v-for="(tag,index) in userList"
            :closable="!!controlType.btn"
            @close="removeBrand(tag,1,index)">
            {{tag.mobile}}
          </el-tag>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="controlType.btn" @click="okPower()" type="primary">{{controlType.btn}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roleManage',
  data () {
    return {
      roleList: [
        {
          label: '操作权限',
          name: '2'
        },
        {
          label: '数据权限',
          name: '3'
        }
      ],
      checkedPower: [],
      userList: [],
      defaultProps: {
        children: 'childMenu',
        label: 'name'
      },
      activeRole: '2',
      dialogFormVisible: false,
      tableHead: [
        {label: '角色', prop: 'name'},
        {label: '操作权限', prop: 'permission'}
      ],
      roleForm: {
        name: '',
        addName: '',
        dataType: '2',
        dataName: ''
      },
      powerData: [],
      controlType: {
        title: '新建角色',
        btn: '新建'
      },
      tableData: [],
      currentPage1: 1,
      pageSize: 20,
      pageTotal: 0
    }
  },
  created () {
    this.pageData()
  },
  methods: {
    resetForm () {
      if (this.activeRole === '2') {
        this.controlType = {
          title: '新建角色',
          btn: '新建'
        }
      } else {
        this.controlType = {
          title: '新建数据权限',
          full: 'no',
          width: '420px',
          btn: '新建'
        }
      }

      this.roleForm = {
        name: '',
        addName: '',
        dataType: '2',
        dataName: ''
      }
      this.checkedPower = []
    },
    pageData () {
      var url = 'role/getDataRoleList.action'
      if (this.activeRole === '2') {
        url = 'role/getRoleList.action'
      }
      var that = this
      that.tableData = []
      this.$axios({
        method: 'get',
        url: url,
        params: {
          pages: that.currentPage1,
          rows: that.pageSize
        }
      }).then(function (res) {
        that.tableData = res.rows
        that.pageTotal = res.total
      })
    },
    handleCurrentChange () {
    },
    openDialog () {
      var that = this
      this.$axios({
        method: 'get',
        url: 'role/getMeunList.action'
      }).then(function (res) {
        that.powerData = res.data
        that.dialogFormVisible = true
      })
    },
    okPower () {
      var that = this
      if (this.activeRole === '2') {
        if (that.$common.isNull(that.roleForm.name)) {
          that.$message.warning('请输入角色名称')
          return
        }
        if (this.$refs['treePower'].getCheckedKeys().length === 0) {
          that.$message.warning('请选择权限')
          return
        }
        var powerArr = this.$refs['treePower'].getCheckedKeys().concat(this.$refs['treePower'].getHalfCheckedKeys())
        var postData = {
          roleName: that.roleForm.name,
          ids: powerArr
        }
        if (!that.$common.isNull(that.controlType.id)) {
          postData.roleId = that.controlType.id
        }
        that.$axios({
          method: 'post',
          url: 'role/editRole.action',
          data: postData
        }).then(function () {
          that.$message.success('操作成功')
          that.dialogFormVisible = false
          that.currentPage1 = 1
          that.pageData()
        })
      } else {
        if (that.$common.isNull(that.roleForm.dataName)) {
          that.$message.warning('请输入数据权限名称')
          return
        }
        var option = {
          roleName: that.roleForm.dataName,
          type: that.roleForm.dataType
        }
        if (!that.$common.isNull(that.roleForm.id)) {
          option.id = that.roleForm.id
        }
        if (that.roleForm.dataType === '1') {
          if (that.userList.length === 0) {
            that.$message.warning('最少添加一个手机号')
            return
          }
          option.scope = that.userList.map(function (val) {
            return val.id
          }).join(';')
        }
        that.$axios({
          method: 'post',
          url: 'role/addDataRole.action',
          data: option
        }).then(function () {
          that.$message.success('操作成功')
          that.dialogFormVisible = false
          if (that.controlType.btn === '新建') {
            that.currentPage1 = 1
          }
          that.pageData()
        })
      }
    },
    tabClick () {
      if (this.activeRole === '2') {
        this.tableHead = [
          {label: '角色', prop: 'name'},
          {label: '操作权限', prop: 'permission'}
        ]
        this.controlType = {
          title: '新建角色',
          btn: '新建'
        }
      } else {
        this.controlType = {
          title: '新建数据权限',
          full: 'no',
          width: '420px',
          btn: '新建'
        }
        this.tableHead = [
          {label: '数据权限名称', prop: 'roleName'},
          {label: '可见范围', prop: 'scopeString'}
        ]
      }
      this.pageData()
    },
    handleClick (data, type) {
      var that = this
      if (type === 2) {
        this.$confirm('是否确认删除' + data.name + '角色，删除后对应角色账号登陆后角色将为空。', '删除确认', {
          confirmButtonText: '确定',
          type: 'warning'
        }).then(() => {
          this.$axios({
            method: 'post',
            url: 'role/deleteRole.action',
            data: {
              roleId: [data.id]
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.dialogFormVisible = false
            that.pageData()
          })
        }).catch(() => {

        })
      } else {
        window.axios.all([that.$axios({
          method: 'get',
          url: 'role/getRolePermission.action',
          params: {
            roleId: data.id
          }
        }), that.$axios({
          method: 'get',
          url: 'role/getMeunList.action'
        })]).then(window.axios.spread(function (res1, res2) {
          var a = []
          that.arrRecursion(res1, a)
          that.checkedPower = a
          that.powerData = res2.data
          that.roleForm = {
            name: data.name
          }
          if (type === 1) {
            that.controlType = {
              title: '修改角色',
              btn: '修改',
              id: data.id
            }
          } else {
            that.controlType = {
              title: '查看角色',
              btn: ''
            }
          }
          that.dialogFormVisible = true
        }))
      }
    },
    handleClick2 (data, type) {
      var that = this
      if (type === 2) {
        this.$confirm('是否确认删除' + data.roleName + '数据权限，删除后对应用户数据将不能查看', '删除确认', {
          confirmButtonText: '确定',
          type: 'warning'
        }).then(() => {
          this.$axios({
            method: 'post',
            url: 'role/deleteDataRole.action',
            data: {
              id: data.id
            }
          }).then(function (res) {
            that.$message.success('操作成功')
            that.dialogFormVisible = false
            that.pageData()
          })
        }).catch(() => {

        })
      } else {
        that.$axios({
          method: 'get',
          url: 'role/getDataRoleDetail.action',
          params: {id: data.id}
        }).then(function (res) {
          that.roleForm = {
            id: data.id,
            name: '',
            addName: '',
            dataType: res.type.toString(),
            dataName: res.roleName
          }
          if (+res.type === 1) {
            that.userList = JSON.parse(res.scopeString)
          }
          if (type === 1) {
            that.controlType = {
              title: '修改数据权限',
              full: 'no',
              width: '420px',
              btn: '修改'
            }
          } else {
            that.controlType = {
              title: '查看数据权限',
              full: 'no',
              width: '420px',
              btn: ''
            }
          }
          that.dialogFormVisible = true
        })
      }
    },
    arrRecursion (data, a) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].childMenu.length === 0) {
          a.push(data[i].id)
        }
        this.arrRecursion(data[i].childMenu, a)
      }
    },
    addUser () {
      var that = this
      if (that.$common.isNull(that.roleForm.addName)) {
        that.$message.warning('请输入手机号')
        return
      }
      if (!that.$common.phone(false, that.roleForm.addName)) {
        that.$message.warning('手机号格式不正确')
        return
      }
      var index = that.$common.findElem(that.userList, 'mobile', that.roleForm.addName)
      if (index >= 0) {
        that.$message.warning('此用户已关联')
        that.roleForm.addName = ''
        return
      }
      that.$axios({
        method: 'get',
        url: 'user/getAdminAll.action',
        params: {
          mobile: that.roleForm.addName
        }
      }).then(function (res) {
        if (res.length) {
          that.userList.push({
            mobile: res[0].mobile,
            id: res[0].id
          })
        } else {
          that.$message.warning('无此手机号的用户')
        }
        that.roleForm.addName = ''
      })
    },
    removeBrand (tag, type, index) {
      this.userList.splice(index, 1)
    }
  }
}
</script>

<style scoped>
</style>
