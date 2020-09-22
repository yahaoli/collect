<template>
    <div class="goodsManage-con">
        <el-form :inline="true">
            <el-form-item label="商品状态">
                <el-select v-model="form.status" filterable clearable placeholder="所有">
                    <el-option label="上架" value="1"/>
                    <el-option label="下架" value="0"/>
                </el-select>
            </el-form-item>
            <el-button type="primary" @click="getList">查询</el-button>
            <el-button type="primary" @click="dialogExport=true">新增</el-button>
        </el-form>
        <el-table
                v-loading="listLoading"
                :data="list"
                element-loading-text="Loading"
                border
                fit
                highlight-current-row
                style="margin-top: 10px"
        >
            <el-table-column prop="month" label="月份" align="center"/>
            <el-table-column label="所属大区" prop="districtName" align="center"/>
        </el-table>
        <el-pagination
                :total="totalCount"
                :current-page="param.pageNo + 1"
                background
                layout="total,prev, pager, next"
                @current-change="toPage"/>
        <el-dialog :visible.sync="dialogExport" :title="dialogTitle" width="600px" @closed="reset">
            <el-form ref="dialogForm" :model="dialogForm" :rules="dialogFormRules" label-width="120px">
                <el-form-item label="商品名" prop="name">
                    <el-input v-model="dialogForm.name" style="width: 300px" clearable placeholder="请输入商品名"/>
                </el-form-item>
                <el-form-item label="上传图片" prop="fileList">
                    <el-upload
                            ref="upload"
                            :data="ossParam"
                            :limit="1"
                            :on-exceed="uploadLimit"
                            :file-list="dialogForm.fileList"
                            :on-success="uploadSuccess"
                            :on-error="uploadFailure"
                            :on-remove="removeUploadFile"
                            :on-change="beforeUpload"
                            :auto-upload="false"
                            :action="uploadUrl"
                            name="fileData">
                        <el-button slot="trigger" size="small" type="primary">选取图片</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button size="small" type="primary" @click="dialogSubmit">提交</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

    </div>
</template>

<script>
  export default {
    data() {
      return {
        form: {
          status: ""
        },
        param: {
          pageNo: 0,
          pageSize: 10
        },
        listLoading: false,
        list: [],
        totalCount: 0,
        dialogForm: {
          name: "",
          fileList: []
        },
        dialogFormRules: Object.freeze({
          name: [
            {required: true, message: "请输入商品名"}
          ],
          fileList: [
            {required: true, type: "array", message: "请上传文件"}
          ]
        }),
        ossParam: {},
        uploadUrl: "",
        dialogExport: false,
        dialogTitle: "新增商品"
      };
    },
    created() {
    },
    methods: {
      toPage(pageNo) {
        this.param.pageNo = pageNo - 1;
        this.getList();
      },
      getList(pageInit) {
        pageInit && (this.param.pageNo = 0);
        // const {pageNo, pageSize} = this.param;
        this.listLoading = true;
      },
      // dialog关闭重置变量
      reset() {
        this.$refs["dialogForm"].resetFields();
        this.dialogForm = {
          name: "",
          fileList: []
        };
      },
      beforeUpload(file, fileList) {
        const isImg = file.raw.type.split("/")[0] === "image";
        if (!isImg) {
          this.dialogForm.fileList = [];
          this.$message.warning("只能上传图片!");
          return false;
        }
        this.dialogForm.fileList = fileList;
      },
      uploadSuccess(response, file, fileList) {
        if (response.code === "0") {
          this.$message.success("附件上传成功");
          this.dialogExport = false;
          this.getList(true);
        } else {
          fileList[0].status = "ready";
          this.dialogForm.fileList = fileList;
          this.$message.error(response.message);
        }
      },

      uploadFailure() {
        this.$message.error("附件上传失败, 请稍后重试");
      },
      uploadLimit() {
        this.$message.warning("附件数量不能超过限定数量,更换请删除重新上传");
      },
      removeUploadFile() {
        this.dialogForm.fileList = [];
      },
      dialogSubmit() {
        this.$refs["dialogForm"].validate((valid) => {
          if (valid) {
            this.ossParam.name = this.dialogForm.name;
            this.$refs.upload.submit();
          } else {
            return false;
          }
        });
      }
    }
  };
</script>

<style lang="scss">
    @import "index";
</style>