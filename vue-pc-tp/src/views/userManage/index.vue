<template>
    <div class="orderManage-con">
        <el-form :inline="true">
            <el-form-item label="订单状态">
                <el-select v-model="form.status" filterable clearable placeholder="所有">
                    <el-option label="上架" value="1"/>
                    <el-option label="下架" value="0"/>
                </el-select>
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
            <el-table-column prop="month" label="月份" align="center"/>
            <el-table-column label="所属大区" prop="districtName" align="center"/>
        </el-table>
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
                list: []
            };
        },
        methods: {
            getList(pageInit) {
                pageInit && (this.param.pageNo = 0);
                // const {pageNo, pageSize} = this.param;
                this.listLoading = true;
            }
        }
    };
</script>

<style lang="scss">
    @import "index";
</style>