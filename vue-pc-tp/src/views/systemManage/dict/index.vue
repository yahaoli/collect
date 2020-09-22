<template>
    <div class="systemManage-dict">
        <el-form :inline="true">
            <el-form-item label="字典类型">
                <el-input clearable v-model="param.dictName" placeholder="请输入字典类型"/>
            </el-form-item>
            <el-form-item label="字典值">
                <el-input clearable v-model="param.dictValue" placeholder="请输入字典值"/>
            </el-form-item>
            <el-button type="primary" @click="getList">查询</el-button>
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
            <el-table-column label="字典类型" prop="districtName" align="center"/>
            <el-table-column label="字典值" prop="districtName" align="center"/>
            <el-table-column label="创建时间" prop="createdAt" align="center"/>
            <el-table-column label="修改时间" prop="changedAt" align="center"/>
        </el-table>
    </div>
</template>

<script>
  import {getPageDictApi} from "@/api";

  export default {
    data() {
      return {
        form: {
          dictName: "",
          dictValue: ""
        },
        param: {
          pageNo: 0,
          pageSize: 10
        },
        listLoading: false,
        list: []
      };
    },
    created() {
      console.log(11111111)
      this.getList(true);
    },
    methods: {
      getList(pageInit) {
        pageInit && (this.param.pageNo = 0);
        getPageDictApi(this.form).then(res => {
          console.log(res);
        });
        this.listLoading = true;
      }
    }
  };
</script>

<style lang="scss">
    @import "index";
</style>