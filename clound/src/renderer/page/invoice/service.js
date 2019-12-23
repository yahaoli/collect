import request from "@/util/request";
const delay = (time, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, time);
	});
};

//获取发票列表
export function fetchInvoiceList(params) {
	return request("/", {
		method: "CloudOrder_getInvoiceList",
		params: params
	});
}

//修改订单开票方式为纸质发票
export function updatePaperTickets(params){
	return request("/", {
		method: "CloudOrder_updatePaperTickets",
		params: params
	});
}