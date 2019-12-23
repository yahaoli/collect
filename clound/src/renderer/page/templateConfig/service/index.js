import request from "@/util/request";

//新建方案
export async function addNewPlan (params) {
    params.content = JSON.stringify(params.content)
    return request("/", {
    	method: "CloudOrder_addTemplate",
    	params: params
    });
}

//删除方案
export async function deletePlan (params) {
    return request("/", {
    	method: "CloudOrder_deleteTemplate",
    	params: params
    });
}

//保存修改
export async function savePlan (params) {
    params.content = JSON.stringify(params.content)
    return request("/", {
    	method: "CloudOrder_setTemplate",
    	params: params
    });
}

//当前采用方案更改
export async function usePlanChange (params) {
    return request("/", {
    	method: "CloudOrder_recordTemplateUser",
    	params:  params
    });
}

//获取当前采用模板
export async function fetchCurrentUsePlan (params) {
    return request("/", {
    	method: "CloudOrder_getLastUsedTemplate",
    	params: params
    });

}
//获取模板列表
export async function fetchPlanList (params) {

    return request("/", {
    	method: "CloudOrder_getTemplateList",
    	params: params
    });
}




