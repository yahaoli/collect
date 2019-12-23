import request from "@/util/request";
const delay = (time, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, time);
	});
};

export async function asyncSearch(params) {
	return request("/", {
		method: "CloudOrder_getSearchConfigOther",
		params: params
	});
}
export async function getSearchConfig() {
	return request("/", {
		method: "CloudOrder_getSearchConfig"
	});
}

export async function allRefund(params) {
	return request("/", {
		method: "Order_ModifyTicketNum",
		params: params
	});
}

export async function numModify(params) {
	return request("/", {
		method: "CloudOrder_numModify",
		params: params
	});
}

export async function getOrderTouristInfo(params) {
	return request("/", {
		method: "CloudOrder_getOrderTouristInfo",
		params: params
	});
}


export async function getOrderDetail(params) {
	return request("/", {
		method: "CloudOrder_getOrderDetail",
		params: params
	});
}
export async function Order_printTicket(params) {
	return delay(1000, {
		code: 200,
		msg: "打印成功"
	});
}

export async function getScenicList(params) {
	return request("/", {
		method: "Terminal_getScenicList",
		params: params
	});
}

export async function fetchOrderList(params) {
	return request("/", {
		method: "CloudOrder_getList",
		params: params
	});
}


export async function uploadPrintInfo(params) {
	return request("/", {
		method: "CloudSummary_uploadPrintInfo",
		params: params
	});
}

//获取退票手续费
export async function getCostFee(params) {
	let defaultParams = { ordernum: "" };
	return request("/", {
		method: "Terminal_getCostFee",
		params: Object.assign(defaultParams,params)
	});
}

//获取订单列表导出
export async function exportOrderList (params) {
	return request("/", {
		method: "CloudOrder_exportOrderList",
		params: params
	});
}

