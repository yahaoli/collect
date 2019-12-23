import request from "@/util/request";

const delay = (time, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, time);
	});
};

export async function orderSummary(params) {
	return await request("/", {
		method: "CloudSummary_summary",
		params: params
	});
}

export async function getSummaryList(params) {
	return request("/", {
		method: "CloudOrder_getSummaryList",
		params: params
	});
}

export async function getScenicList(params) {
	return request("/", {
		method: "Terminal_getScenicList",
		params: params
	});
}

//获取汇总列表导出
export async function getSummaryExcel (params) {
	return request("/", {
		method: "CloudOrder_getSummaryExcel",
		params: params
	});
}


//打印销售员报表
export async function exportStaffSaleReport (params) {
	return request("/", {
		method: "Order_exportStaffSaleReport",
		params: params
	});
}

