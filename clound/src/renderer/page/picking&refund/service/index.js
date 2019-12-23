import request from "@/util/request";
import axios from "axios";

const delay = (time, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, time);
	});
};

//获取退票手续费
export async function getCostFee(params) {
	let defaultParams = { ordernum: "" };
	return request("/", {
		method: "Terminal_getCostFee",
		params: Object.assign(defaultParams, params)
	});
}

//取票打印
export async function order_printTicket(params) {
	return request("/", {
		method: "Order_printTicket",
		params: params
	});
}

//获取产品列表
export async function getScenicList(params) {
	return request("/", {
		method: "Terminal_getScenicList",
		params: params
	});
}

//查单
export async function orderQuery(params) {
	let defaultParams = {
		top: "2147483647",
		lid: "",
		apply_did: "",
		salerid: "",
		member: "",
		aid: "",
		ordernum: "",
		personid: "",
		ordertel: "",
		code: "",
		ordertime_begin: "",
		ordertime_end: "",
		order_status: "",
		pay_status: "1|2",
		isList: 0,
		offset: 0
	};
	return request("/", {
		method: "Order_QuickSearch",
		params: Object.assign(defaultParams, params)
	});
}

// //全部退票
// export async function allRefund(params) {
// 	return request("/", {
// 		method: "Order_ModifyTicketNum",
// 		params: params
// 	});
// }

//全部退票
export async function modifyTicketNum(params) {
	return request("/", {
		method: "Order_ModifyTicketNum",
		params: params
	});
}

//部分退票
export async function numModify(params) {
	return request("/", {
		method: "CloudOrder_numModify",
		params: params
	});
}

//撤改

export async function terminalRevoke(params) {
	return request("/", {
		versionStr: "",
		method: "Order_TerminalRevoke",
		params: params
	});
}

//部分退票时获取游客信息
export async function getOrderTouristInfo(params) {
	return request("/", {
		method: "CloudOrder_getOrderTouristInfo",
		params: params
	});
}

//取票后上传打印记录
export async function uploadPrintInfo(params) {
	return request("/", {
		method: "CloudSummary_uploadPrintInfo",
		params: params
	});
}

//验证
export async function ticketVerify(params) {
	return request("/", {
		method: "Order_Verify",
		params: params
	});
}

//验证2
export async function orderCheck(params) {
	return request("/", {
		versionStr: "",
		method: "Order_orderCheck",
		params: params
	});
}


// 撤改使用的是xmln格式发送
import Config from "@/config";
const { zdApi, env } = Config;



const revokeRequest = axios.create({
	timeout: 15000, // 请求超时时间
	headers: {
		"Content-Type": "text/xml; charset=utf-8",
		SOAPAction: "http://12301.cc/IPCService/OperationLog"
	},
	baseURL: zdApi[env]
});

export async function ticketRevoke(payloadParams) {
	let defaultParams = {
		ordernum: "",
		code: "",
		ttitle: "",
		remainingNum: 0,
		tprice: 0
	};
	let params = Object.assign(defaultParams, payloadParams);
	return revokeRequest({
		url: "PCService.svc",
		method: "post",
		data: `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><OperationLog xmlns="http://12301.cc"><otype>退票</otype><oman>123624</oman><log>撤销</log><productName/><orders>订单号:${
			params.ordernum
			},凭证号:${params.code}&#xD;
${params.ttitle}*${params.remainingNum}*${
			params.tprice
			}</orders></OperationLog></s:Body></s:Envelope>`
	});
}
