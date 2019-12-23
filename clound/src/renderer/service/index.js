import request from "@/util/request";
import md5 from "js-md5";
import Config from "@/config";
import randomString from "@/util/randomString";
import axios from "axios";
import Storage, {KEY} from "@/util/storage";
import Message from "@/util/message";
import {isNull} from "util";

const {envList, env, payApi_offline, payApi} = Config;
const delay = (time, data) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, time);
	});
};

// 获取站点列表
export function getSite({account = ""}) {
	if (!account) return false;
	return request("/", {
		method: "Terminal_getMemberSite",
		params: {
			account: account
		}
	});
}

// 获取行程单
export function travelItinerary({teamverifycode = ""}) {
	if (!teamverifycode) return false;
	return request("/", {
		method: "Order_sendItinerary",
		params: {
			teamverifycode: teamverifycode
		}
	});
}

//提交行程单
export function SendTouristAuthentication({teamCode = "", touristInfo = ''}) {
	return request("/", {
		method: "Order_SendTouristAuthentication",
		params: {
			touristInfo: touristInfo,
			teamCode: teamCode,
		}
	});
}

/**
 * 登录接口
 */
export function Login({account = "", password = "", siteId = ''}) {
	if (!account || !password || !siteId) return false;

	// return delay(1000,{
	//     code : 200,
	//     "data": {
	//         "account" : "123624", //登录账号
	//         "member_id" : "3385",//登录用户ID
	//         "member_name" : "慢慢的店铺23",//登录用户姓名
	//         "member_type" : "0",//登录用户类型 0=供应商，1=分销商，2=直接供应方，3=合并终端后的资源方，5=普通用户，6=员工，7=集团帐号，9=平台帐号
	//         "parent_member_id" : "3385",//主账号ID
	//         "parent_member_name" : "慢慢的店铺23",//主账号姓名
	//         "token" : "8d3ce15be1c084db2b4a71d97277be95",//登录令牌
	//         "expire" : "1489766400",//登录过期时间戳 - 暂时没有启用
	//     }
	// })

	//加密规则详见：http://git.12301.io/PFT/PFT_Documents/src/master/%E7%BB%88%E7%AB%AF/%E7%A1%AC%E4%BB%B6%E5%AF%B9%E6%8E%A5.md
	return request("/", {
		method: "Terminal_login",
		params: {
			account: account,
			siteId: siteId,
			password: md5(md5(password))
		}
	});
}


/**
 * @page 打印发票及回执单
 * @param ticket_info 传输内容
 */
export function TicketLog(ticket_info) {
	return request("/", {
		method: "CloudOrder_ticketLog",
		params: ticket_info
	});
}

/**
 * @page 下单页面
 * @desc 获取分销商列表
 * @param account
 * @param aid
 * @param keyword 搜索关键字
 * @param siteId
 * @param sourceType
 * @param siteType 1散客2团队3全部
 */
export async function FetchRelationList({account, aid, keyword = "", siteId, sourceType = 1, siteType}) {

	//散客
	let self = {
		"id": "0",                         //散客的分销商id默认为0
		"parent_id": aid,                  //父ID
		"son_id": "-1",                    //子ID
		"son_id_type": "-1",               //0分销商1资源方2员工3供应商（父ID为集团帐号情况下）
		"ship_type": "-1",                 //关系类型0供销关系1从属关系2平级关系3推荐关系
		"status": "0",                     //0正常1断联
		"rectime": "",                     //记录生成时间
		"mid": "0",                        //会员表id  散客的分销商id默认为0
		"dname": "散客",                    //姓名
		"cname": "",                       //别名
		"dtype": "-1",                     //会员类型0供应商1分销商2直接供应方3合并终端后的资源方5普通用户6员工7集团帐号9平台帐号
		"account": "-1",                   //账号
		"mobile": ""
	}
	if (siteType === 2) {
		return {
			data: [self],
			code: 200
		};
	} else {
		// const key = KEY.BUY_TICKET_RELATION_LIST + "_" + keyword;
		// let list = Storage.Session.get(key);
		// if (list) return JSON.parse(list);
		const res = await request("/", {
			method: "Terminal_getRelationList",
			params: {
				account,
				aid,
				siteId,
				sourceType,
				keyword
			}
		});
		if (res && res.code == 200 && res.data && keyword == "") {
			if (siteType === 3) res.data.unshift(self);
		}
		//Storage.Session.set(key, res)
		return res;

	}

}

/**
 * @page 下单页面
 * @desc 获取总社弱关联列表
 * @param account
 * @param aid
 * @param keyword 搜索关键字
 * @param siteId
 * @param sourceType
 * @param siteType 1散客2团队3全部
 */
export async function FetchMainAssnList({account, aid, did}) {
	const res = await request("/", {
		method: "Terminal_getRelationCon",
		params: {
			account,
			aid,
			did
		}
	});
	return res;
}
/*
*获取票类分组列表
 */
export async function FetchTicketGroupList({ aid, lid}) {
	const res = await request("/", {
		method: "Terminal_getTicketGroup",
		params: {
			aid,
			lid
		}
	});
	return res;
}
/**
 * @page 下单页面
 * @desc 获取散客产品列表
 * @param {object} params 传给后端的数据
 * @param {string} params.account  登录用户的帐号
 * @param {string} params.aid      登录用户的供应商id
 */
export async function FetchProductListForPerson({aid, siteId, sourceType = 1}) {

	// let list = Storage.Session.get(KEY.BUY_TICKET_PRODUCT_LIST_PERSON);
	// if (list) list = JSON.parse(list);
	// if (list) return list;
	const params = {
		aid,
		page: 1,
		size: 1000 * 100,
		sale_flag: "Y",
		siteId,
		sourceType,
		channel: 7
	};

	const res = await request("/", {
		method: "Terminal_getProductListForCasual",
		params: params
	});
	// Storage.Session.set(KEY.BUY_TICKET_PRODUCT_LIST_PERSON, res);
	return res;
}

/**
 * @page 下单页面
 * @desc 获取分销商的产品列表
 * @param {object} params 传给后端的数据
 * @param {string} params.fid      分销商的id
 * @param {string} params.sid      供应商id
 */
export async function FetchProductListForDis({fid, sid}) {
	const params = {
		fid,
		sid,
		page: 1,
		size: 1000 * 100
	};

	let key = fid + "_" + sid;
	let list = Storage.Session.get(KEY.BUY_TICKET_PRODUCT_LIST_DIS);
	list = list ? JSON.parse(list) : {};
	if (list[key]) return list[key];

	const res = await request("/", {
		method: "Terminal_getProListForDistributorV1",
		params: params
	});

	list[key] = res;

	Storage.Session.set(KEY.BUY_TICKET_PRODUCT_LIST_DIS, list);

	return res;
}

/**
 * @page  下单页面
 * @desc  获取某个产品下的票类数据
 * @param {object} params 传给后端的数据
 * @param {string} params.aid          供应商ID，散客的时候，aid传登陆者产品列表里的sapply_did
 * @param {string} params.lid          景区/产品id
 * @param {string} params.fid          分销商ID，散客的时候，fid传登陆者ID
 * @param {string} params.channel      渠道  7==散客窗口   9==团队窗口
 * @param {string} params.date         日期
 */
export async function FetchTicketList({ aid, lid, fid, channel = 7, date = '', siteId, sourceType = 1, groupId = '' }) {
	return request("/", {
		method: "Terminal_getTicketListV1",
		params: {
			aid, lid, fid, channel, date, siteId, sourceType, groupId,
		}
	});
	//测试代码
	// if(lid!=108){
	// 	return request("/", {
	// 		method: "Terminal_getTicketListV1",
	// 		params: {
	// 			aid,lid,fid,channel,date
	// 		}
	// 	});
	// }
	// const res = await request("/", {
	// 	method: "Terminal_getTicketListV1",
	// 	params: {
	// 		aid,lid,fid,channel,date
	// 	}
	// });
	// res.data.list = res.data.list.map((ticket) => {
	// 	const {tid} = ticket;
	// 	if(tid=="176818"){
	// 		ticket.ageLimit = [{low:20,high:25},{low:30,high:60}];
	// 	}else if(tid=="176820"){
	// 		ticket.ageLimit = [{low:28,high:30}];
	// 	}else if(tid=="176821"){
	// 		ticket.ageLimit = [{low:30,high:35}];
	// 	}
	// 	return ticket;
	// })
	// return res;
}

/**
 * @page  下单页面
 * @desc  获取某个产品某天的库存
 * @param {object} params              传给后端的数据
 * @param {string} params.lid          景区/产品id
 * @param {string} params.date         2017-11-08
 */
export function FetchTicketStorage({date, lid, tid}) {
	return request("/", {
		method: "Terminal_getTodayStorage",
		params: {
			date,
			lid,
			tid
		}
	});
}

/**
 * @page  下单页面
 * @desc  获取场次列表
 * @param {string} lid          景区/产品id
 * @param {string} date         2017-11-08
 * @param {string} memberId     登录会员id
 * http://git.12301.io/PFT/PFT_Documents/src/master/%E7%BB%88%E7%AB%AF/%E7%BB%88%E7%AB%AF%E4%BA%91%E7%A5%A8%E5%8A%A1%E6%BC%94%E5%87%BA%E6%8E%A5%E5%8F%A3.md
 */
export async function FetchChangCiList({date, lid, memberId}) {
	const url = envList[env].replace(/v1\//g, "");
	let res = await request(url, {
		method: "Product_getShowProduct",
		versionStr: "",
		params: {
			date,
			lid,
			memberId
		}
	});

	//这里对返回的数据做一层处理
	// let data = res.data;
	// if(res.code==200 && data && data.rounds && data.rounds.length>0 && data.tickets && data.tickets.length>0){
	//     let rounds = data.rounds;
	//     let tickets = data.tickets;
	//     rounds.forEach((round)=>{
	//         let ticket_storage = {};
	//         tickets.forEach((ticket)=>{
	//             const _zoneID = ticket.zone_id;
	//             const tid = ticket.tid;
	//             if(_zoneID==0){//zone_id==0说明是没有设置分区，即为站票，库存不限
	//                 ticket_storage[tid] = Config.MAX_STORAGE_NUM;
	//             }else{
	//                 const curArea = round.area_storage.split("|").find((item)=>item.split(",")[0]===_zoneID);
	//                 if(curArea){
	//                     ticket_storage[tid] = curArea.split(",")[1];
	//                 }else{
	//                     ticket_storage[tid] = Config.MAX_STORAGE_NUM;
	//                 }
	//             }
	//         })
	//         //额外添加这个字段
	//         round["ticket_storage"] = ticket_storage;
	//     })
	// }

	return res;
}

//获取省市地址
export async function fetchSecondLevelArea(data) {
	return await request("/", {
		method: "Order_secondLevelArea",
		params: data
	});
}

//获取乡镇接口
export async function fetchTownList(data) {
	return await request("/", {
		method: "Order_getTownList",
		params: data
	});
}

//查询导游列表
export async function getGuideInfo(data) {
	return await request("/", {
		method: "TeamOrder_getGuideInfo",
		params: data
	});
}

export async function submitOrder(data) {
	return await request("/", {
		method: "Terminal_submitOrder",
		params: data
	});
}

/**
 * 字典查询
 */
export async function getSystemDict() {
	return await request("/", {
		method: "Terminal_getSystemDict"
	});
}

/**
 * 现金/会员卡支付
 */
export async function payOrderOffline({
										  ordernum = "", //订单号
										  total_fee = 0, //总金额，精确到分
										  sorceT = 4, //支付渠道，4:现金 5:会员卡
										  pay_account = "", //收款商户账号，如“拉卡拉”票付通收款
										  buy_account = "", //购买人账号——如拉卡拉的银行卡号
										  tradeno = "", //支付流水号
										  orderTel = "", //手机号码
										  SendPhone = '0', //是否发送短信
										  memberCode = "",
										  siteId = "",
										  is_vip = ""
									  }, version) {
	return await request(payApi_offline[env], {
		// method: "Order_QuickPayOffline",
		method: version == 'v1' ? "Order_QuickPayOffline" : "Order_quickPayOfflineV2",
		versionStr: "",
		params: {
			ordernum,
			total_fee,
			sorceT,
			pay_account,
			buy_account,
			tradeno: tradeno ? tradeno : randomString(10, 20),
			orderTel, //手机号码
			SendPhone, //是否发送短信
			memberCode,
			siteId,
			is_vip
		}
	});
}


/**
 * 支付接口(在线支付)
 * http://git.12301.io/PFT/PFT_Documents/src/master/%E9%80%9A%E7%94%A8%E7%A7%BB%E5%8A%A8%E6%94%AF%E4%BB%98%E6%8E%A5%E5%8F%A3.md
 */
export async function payOrder({
								   pay_type = 1,        //支付方式  1==支付宝  2==微信
								   is_member = 0,       //0:不是分销商需要原路退回，1是分销商退回到账户余额；
								   channel = 1,         //1==支付宝  2==微信
								   from = 1,            //写死
								   pay_scen = 1,        //写死
								   merchant_id = "",    //供应商id
								   auth_code = "",      //扫描得到的付款码
								   ordernum = "",       //订单号
								   memberCode = "", //会员码
								   is_vip = "",      //会员段识
								   subject = "",      //产品名
								   siteId = ""
							   }) {

	//支付宝支付
	//http://www.12301dev.com/r/pay_MobilePay/micropay/
	//pay_type=1&auth_code=284172646503939228&ordernum=16390098&is_member=0&channel=1&from=1&pay_scen=1&merchant_id=3385

	//微信支付
	//http://www.12301dev.com/r/pay_MobilePay/micropay/
	//pay_type=2&auth_code=135227625240834456&ordernum=16390100&is_member=0&channel=2&from=1&pay_scen=1&merchant_id=3385

	const url = `${payApi[env]}/r/pay_MobilePay/micropay/`;
	let params = {
		pay_type,
		is_member,
		channel,
		from,
		siteId,
		pay_scen,
		merchant_id,
		auth_code,
		ordernum,
		memberCode,
		subject,
		is_vip
	};


	return new Promise((resolve, reject) => {
		$.ajax({
			url: url,
			dataType: "json",
			type: "post",
			data: params,
			success: function (res) {
				resolve(res);
			},
			error: function (xhr, text) {
				reject(text);
			}
		})
	})
	// return axios.post(url,params);


	// return new Promise((resolve,reject) => {
	//     PFT.Util.Ajax(url,{
	//         type : "post",
	//         params : {
	//             pay_type,
	//             is_member,
	//             channel,
	//             pay_type,
	//             from,
	//             pay_scen,
	//             merchant_id,
	//             auth_code,
	//             ordernum
	//         },
	//         success : function(res){
	//             resolve(res);
	//         },
	//         timeout : function(){
	//             resolve({code:-1,msg:PFT.AJAX_TIMEOUT_TEXT});
	//         },
	//         serverError : function(){
	//             resolve({code:-2,msg:PFT.AJAX_ERROR_TEXT});
	//         }
	//     })
	// })

	// try{
	//     return await axios({
	//         method : "post",
	//         url : "https://pay.12301.cc/r/pay_MobilePay/micropay/",
	//         data : {
	//             pay_type,
	//             is_member,
	//             channel,
	//             pay_type,
	//             from,
	//             pay_scen,
	//             merchant_id,
	//             auth_code,
	//             ordernum
	//         }
	//     })
	// }catch(e){
	//     message.error(e.message || "请求出错，请稍后重试...");
	// }
}

/**
 * 下单页面-通过订单号查询订单详情信息
 * @param {string} ordernum 订单号
 * @param {string} account  登录帐号
 *
 *
 */
export async function queryOrderInfo({
										 ordernum, lid, applyDid,
										 salerid = "",
										 personid = "",
										 ordertel = "",
										 code = "",
										 ordertime_begin = "",
										 ordertime_end = "",
										 order_status = "0|7",
										 pay_status = "1|2",
										 member = "",
										 aid = "",
										 isList = 0,
										 offset = 0,
										 top = 100
									 }) {
	return request("/", {
		method: "Order_QuickSearch",
		params: {
			ordernum, lid, salerid, apply_did: applyDid,
			personid, ordertel, code, ordertime_begin, ordertime_end,
			order_status, pay_status, member, aid, isList, offset, top
		}
	})
}

/**
 * 下单页面-修改订单打印状态 打印门票
 * @param {string} ordernum    订单号
 * @param {string} salerId     景区id
 * @param {string} source      固定传4
 * @param {string} oper        操作员工id
 *
 * 后端返回
 *
 *  tickets        订单包含的门票，金额单位：分,[{"tid":"门票ID",title":"成人票","tnum":1,"tprice":1,"ordernum":"订单号"},]
 pType        产品类型
 distri        供应商名称
 ordernum    订单号
 code        凭证码
 paymode        支付方式
 mobile        游客手机号
 ordername    游客姓名
 isReprint    是否重打印 0不是，1是
 *
 */
export async function editOrderPrintStatus({
											   ordernum,
											   salerId,
											   source,
											   oper
										   }) {
	return await request("/", {
		method: "Order_printTicket",
		params: {
			ordernum,
			salerId,
			source,
			oper
		}
	});
}


/**
 * 请求验证订单是否可退
 * @param {object} ordernum
 */
export async function refundRequest({
										ordernum
									}) {
	return request("/", {
		method: "Order_isCanRefund",
		params: {
			ordernum
		}
	});

}

/**
 * 获取订单(门票)打印模板
 */

export async function queryOrderPrintTemplate({account, lid}) {
	let result = {
		code: 200,
		data: {},
		msg: ""
	};
	let zdRoot = Config.zdApi[env];
	let res = await axios.get(`${zdRoot}ThirdService.svc/printtemplate/${account}?productId=${lid}`);
	if (res) {
		try {
			// res = eval(res);
			res = JSON.parse(res);
			result.code = res.code;
			result.data = res.data;
			result.msg = res.msg;

		} catch (e) {
			result.code = 0;
			result.msg = "返回的json字符串格式错误"
		}
	} else {
		result.code = 1;
		result.msg = "查无该产品对应的打印模板数据";
	}
	return result;
}

/**
 * 打印门票 修改订单打印状态
 * @param {string} ordernum  订单号，如果是一票一码或一票一证的，是‘OD#’开头的 | 必填
 * @param {string} salerid   产品id（lid） 必填
 * @param {string} oper      操作员ID 非必填
 * @param {string} source    取票渠道,2:自助机，4:云票务，20:安卓智能终端机 | 必填  |
 */
export function changeStatusToPrintTicket({ordernum = "", salerid = "", oper = "", source = 4, rawQueryParam = "", printIfpack}) {
	const params = {
		ordernum, source, oper,
		salerId: salerid,
		printIfpack
	};
	if (rawQueryParam) params["rawQueryParam"] = rawQueryParam;
	return request("/", {
		method: "Order_printTicket",
		params: params
	});
}

/**
 * 订单查询
 */
export async function queryOrderList({
										 account = "",         //登陆账号
										 begin_time = "",      //开始时间 2018-01-01 00:00:00
										 end_time = "",        //结束时间 2018-01-02 23:59:59
										 reseller_id = "",     //分销商id
										 lid = "",             //景区id
										 tid = "",             //票类id
										 pay_mode = "",        //支付方式
										 action = "",          //操作类型 action==4代表获取已支付的订单
										 key_word = "",        //关键字
										 page = "",            //第几页
										 size = "",            //每页数量
										 search_type = "",     //1 平台订单凭证号查询 2 平台订单其他条件查询 3 查我的订单
										 time_type = "",       //1 15年上半年 2 15年下半年 3 16年上半年 4 16年下半年 5 17年上半年 0 当前
										 is_ten = false        //是否查询最近10个订单
									 }) {
	if (is_ten) action = 0;
	const res = await request("/", {
		method: "CloudOrder_getList",
		params: {
			account,
			begin_time,
			end_time,
			reseller_id,
			lid,
			tid,
			pay_mode,
			action,
			key_word,
			page,
			size,
			search_type,
			time_type,
			is_ten
		}
	});
	return res;
}

/**
 * 上传打印汇总的信息
 * @param {string} type    1 售票打印 2 重打印 3 取票打印 4 退票作废
 * @param {string} landID  景区ID
 * @param {string} num     打印张数
 * @param {string} order   订单号
 */
export async function CloudSummaryUploadPrintInfo({type, landID, num, order}) {
	return request("/", {
		method: "CloudSummary_uploadPrintInfo",
		params: {
			type, num, order,
			land_id: landID
		}
	})
}

//获取产品列表
/**
 * @param {string} account    登录账号
 * @param {string} aid       userInfo中顶级供应商ID
 */
export async function getScenicList(params) {
	return request("/", {
		method: "Terminal_getScenicList",
		params: params
	});
}

/**
 * 班结页面，查询班结列表
 */
export function banjieGetList({opid = "", page = 1, begintime = "", endtime = "", page_num = 10} = {}) {
	// return delay(1000,{
	// 	"code":200,
	// 	"data":{
	// 		"allNum":"29",
	// 		"recordList":[
	// 			{"id":"129","btime":"2018-04-18 15:11:19","etime":"2018-04-19 15:59:42","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"128","btime":"2018-03-21 09:40:51","etime":"2018-04-18 15:11:18","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"127","btime":"2017-11-22 18:21:08","etime":"2018-03-21 09:40:50","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 			{"id":"1","btime":"2017-11-22 00:00:00","etime":"2017-11-22 18:21:07","channel":"4","memInfo":"123624   测试组店铺测试组店铺1"},
	// 		]
	// 	},
	// 	"msg":"success"
	// })
	return request("/", {
		method: "Statistics_getClassRecord",
		params: {
			opid, page, begintime, endtime, page_num
		}
	});
}

/**
 * 班结页面 - 发起班结
 */
export function banjieSetup({opid = "", btime = "", etime = ""} = {}) {
	return request("/", {
		method: "Statistics_setClassSettleReport",
		params: {
			opid, btime, etime
		}
	})
}

/**
 * 班结页面 - 查看班结详情
 */
export function banjieDetail({id = ""} = {}) {
	return request("/", {
		method: "Statistics_exportClassReport",
		params: {
			csr_id: [id]
		}
	})
}

//获取回执单数据
/**
 * @param {string} ordernum    订单号
 * @param {string} op_id       操作员ID
 */

export async function getInvoiceData(params) {
	return request("/", {
		method: "Order_InvoiceOrderSearch",
		params: params
	});
}


//获取模板数据
/**
 * @param {string} type    订单号
 * @param {string} op_id       操作员ID
 */

export async function getTemplate(params) {
	return request("/", {
		method: "CloudOrder_getLastUsedTemplate",
		params: params
	});
}

/**
 * =============================================
 * 2018-06-26 huangzhiyang
 * 演出类在线选座相关接口
 * =============================================
 */

export const ShowService = {
	/**
	 * 获取演出相应分区的座位信息
	 */
	getZoneSeats({venue_id = "", zone_id = "", round_id = ""}) {
		return request("/", {
			method: "Show_getZoneSeats",
			params: {
				venue_id, zone_id, round_id
			}
		});
	},
	/**
	 * 获取分区座位状态
	 */
	getSeatStatus({venue_id = "", zone_id = "", round_id = ""}) {
		return request("/", {
			method: "Show_getSeatStatus",
			params: {
				venue_id, zone_id, round_id
			}
		});
	},
	/**
	 * 把上面2个接口合并并行请求，然后把这2个接口返回的数据merge后再统一返回
	 */
	getVenueSeatMergeStatus({venue_id = "", zone_id = "", round_id = ""}) {
		return Promise.all([
			this.getZoneSeats({venue_id, zone_id, round_id}),
			this.getSeatStatus({venue_id, zone_id, round_id})
		]).then((res) => {
			const venueRes = res[0];
			const statusRes = res[1];
			if (venueRes.code != 200) return venueRes;
			if (statusRes.code != 200) return statusRes;
			const statusList = statusRes.data;
			venueRes.data.seat_list = venueRes.data.seat_list.map((item, index) => {
				let {status, seat_id} = statusList[index];
				if (seat_id == item.seat_id) {
					item["status"] = status;
				} else {
					let statusItem = statusList.find((s) => s.seat_id == item.seat_id);
					if (statusItem) {
						item["status"] = statusItem.status;
					}
				}
				return item;
			})

			return venueRes
		})
	},
	/**
	 * 获取场次列表及分区列表
	 * @param {string|number} lid 景区ID
	 */
	getRoundZoneList({lid = "", date = ""}) {
		return request("/", {
			method: "Show_getRoundZoneList",
			params: {
				lid, date
			}
		});
	},
	/**
	 * 预留选定好的座位
	 */
	reserveSeats({venueID = "", zoneID = "", roundID = "", seatID = "", name = "", mobile = "", memo = ""}) {
		return request("/", {
			method: "Show_reserveSeats",
			params: {
				venue_id: venueID,
				round_id: roundID,
				zone_id: zoneID,
				seat_ids: seatID,
				contact_name: name,
				contact_mobile: mobile,
				contact_desc: memo
			}
		});
	},
	/**
	 * 取消预留
	 */
	releaseReserveSeats({recordID = "", seatID = ""}) {
		return request("/", {
			method: "Show_releaseReserveSeats",
			params: {
				record_id: recordID,
				seat_ids: seatID
			}
		});
	},
	/**
	 * 锁定座位
	 */
	lockSeats({venueID = "", zoneID = "", roundID = "", seatID = ""}) {
		return request("/", {
			method: "Show_lockSeats",
			params: {
				venue_id: venueID,
				round_id: roundID,
				zone_id: zoneID,
				seat_ids: seatID,
			}
		});
	},
	/**
	 * 解锁座位
	 */
	unlockSeats({venueID = "", zoneID = "", roundID = "", seatID = ""}) {
		return request("/", {
			method: "Show_unlockSeats",
			params: {
				venue_id: venueID,
				round_id: roundID,
				zone_id: zoneID,
				seat_ids: seatID,
			}
		});
	},
	/**
	 * 获取座位预留列表
	 */
	getReserveList({lid = "", date = "", page = 1, size = 10, roundID = "", contactName = "", contactMobile = "", isIssueTicket = 0}) {
		return request("/", {
			method: "Show_getReserveList",
			params: {
				lid, date, page, size,
				round_id: roundID,
				contact_name: contactName,
				contact_mobile: contactMobile,
				is_issue_ticket: isIssueTicket
			}
		});
	},

}


/**
 * 获取所有可出售的产品
 * account_id : 登录者的主帐号id: parent_member_id
 */
export function getAllProductList({ptype = "", account = "", shop = "", showDistribution = true, page = 1, size = 10}) {
	const params = {
		account_id: account,
		type: ptype,
		show_distribution: showDistribution,
		page_size: size,
		page_num: page,
		shop
	};
	return request("/", {
		method: "Terminal_getVendibilityProductList",
		params: params
	});
}

/**
 * 根据手机号或会员码查询信息
 *
 */
export async function getMemberCode({ mobile = '', openid = '' }, refresh) {
	const params = {
		memberCode: mobile,
		openid: openid,
	};
	let token = await getToken(refresh);
	if (token) {
		const res = await request('/member', {
			versionStr: 'member/api/member/memberInfo',
			header: { 'access-token': token },
			params: params,
			postType: 'json',
		}, true);
		if (res.status === 400) {
			return getMemberCode({ mobile: mobile, openid: openid }, true);
		}
		return res
	}

}

/**
 * 获取token信息
 *
 */
export async function getToken(refresh) {
	let params = {
		appKey: '86tgj49r8a98dtry7j9rf',
		appSecret: 'sr6t5j4r98y968a65tj487ik9a6w253sr2f',
		companyNo: 'ypwProgram',
	};
	let token;

	function validateToken() {
		let oldToken = JSON.parse(Storage.Session.get('memberToken'));
		if (oldToken) {
			let tokenTime = oldToken.time, currentTime = new Date().getTime();
			token = oldToken.token;
			return currentTime - Number(tokenTime) <= 2 * 60 * 60 * 1000;
		}
	}

	if (refresh || !validateToken()) {
		let res = await request('/member', {
			versionStr: 'member/api/member/token',
			params: params,
			postType: 'json',
		});
		if (res) {
			token =res.data.token;
			Storage.Session.set('memberToken', { token: token, time: new Date().getTime() });
		} else {
			 Message.error('会员信息获取失败，请重试');
			 return ''
		}
	}
	return token;
}

/**
 * 会员Code查询会员权益
 *
 */
export async function getRightsInterests({memberCode = ""}) {
	let params = {
		memberCode: memberCode
	};
	return request("/member", {
		versionStr: 'member/api/memberRights/queryRightsByMemberCode',
		params: params,
		postType: 'json'
	})
	return res;
}

/**
 * 用获取的会员Code查询积分
 *
 */
export async function getpoint({memberCode = ""}) {
	let params = {
		memberCode: memberCode
	};
	return request("/member", {
		versionStr: 'member/api/member/point/point',
		params: params,
		postType: 'json'
	})
	return res;
}

/**
 * 获取积分兑换比例
 *
 */
export async function getIntegralRate({}) {
	let params = {
		cloudtype: 'cloud_ticket'
	};
	return request("/", {
		method: "Order_getIntegralRate",
		params: params
	});
	// let params =  {
	// 	cloudtype: 'cloud_ticket'
	// };
	// return request("/",{
	// 	versionStr: 'Order_getIntegralRate',
	// 	params:params
	// })
	// return res;
}


//添加旅行社总社相关接口定义
export function queryGuideList({name = "", mobile = "", guideNo = ""}) {
	return request("/", {
		method: "CloudOrder_traveGuideList",
		params: {
			name, mobile, guide_no: guideNo
		}
	})
}

export function addGuide({name = "", mobile = "", guideNo = ""}) {
	return request("/", {
		method: "CloudOrder_addGuide",
		params: {
			name, mobile, guide_no: guideNo
		}
	})
}
