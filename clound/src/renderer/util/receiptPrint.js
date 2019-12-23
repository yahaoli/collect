/*
 *
 * 调打印机打印发票服务
 *
 * 如下使用：
 * TicketPrint({
 *      data       : "", 必填 {object}  订单数据
 *      printmoder : ""  必填 {array}  要打印的模板
 *      printSet   : {}  可选 {object}  打印时的一些自定义设置: {printName:"",pageWidth:100,pageHeight:200}
 * })
 *
 *
 *
 */

import NP from "number-precision";
import moment from "moment";
import Storage from "@/util/storage";
import Message from "@/util/message";
import { cloneDeep } from "lodash";
import BasePrint from "@/util/basePrint";

// 要打印时，先转换要打印的订单数据
// 因为浴火的打印服务限定死了字段名，而后端接口返回的订单数据字段名跟他的对不上，所以这里需要做一层转化
const transformOrderData = (data) => {

	data = cloneDeep(data);	
	
	let Logo = "";                  // logo
	let Text = "";                  // 文本
	let UUordernum = "";            // 订单号
	let UUcode = "";                // 凭证号
	let UUltitle = "";              // 景区名称
	let UUttitle = "";              // 门票名称
	let UUordername = "";           // 取票人姓名
	let UUordertel = "";            // 取票人手机号
	let UUordertel2 = "";           // 取票人手机号-新
	let UUtnum = "";                // 预订数量
	let PeopleNumber = 1;           // 人数
	let UUtprice_yuan = "";         // 结算价(元)
	let UUtprice_yuan_sum = "";     // 总结算价(元)
	let UUlprice_yuan = "";         // 零售价(元)
	let UUlprice_yuan_sum = "";     // 总零售价(元)
	let UUMprice_yuan = "";         // 门市价(元)
	let UUMprice_yuan_sum = "";     // 总门市价(元)
	let UUtotalmoney = 0;           // 总金额
	let UUtotalmoney_yuan = 0;      // 总金额(元)
	let UUpaywayName = "";          // 付款方式
	let UUpaystatus2String = "";    // 付款状态
	let UUbegintime = "";           // 有效开始日期
	let UUendtime = "";             // 有效日期
	let UUordertime = "";           // 下单日期
	let UUdtime = "";               // 验证日期
	let fenxiaoshang = "";          // 分销商
	let PerformanceTime = "";       // 演出开始时间
	let PerformanceTimeEnd = "";    // 演出结束时间
	let SeatNow = "";               // 座位号（排）
	let SeatNumber = "";            // 座位号（号）
	let AreaNumber = "";            // 区号
	let SingleArea = "";            // 单双区
	let UUTContent = "";            // 门票名称 * 预订数量
	let UUordernum_UUcode = "";     // 订单号 + 凭证码
	let UUtid_fxsAC = "";           // 门票ID + 分销商帐号
	let UUaid = "";                 // 供应商ID
	let fxsAC = "";                 // 分销商帐号
	let UUremark = "";              // 备注信息
	let SerialNumber = "";          // 票面流水号
	let SystemTime = "";            // 系统时间
	let EmployeeId = "";            // 操作员ID
	let EmployeeName = "";          // 操作员帐号名称
	let UUidcard = "";              // 身份证+姓名
	let UrlBarcode = "";            // 新二维码
	let Childs = [];              	// 合并打印单据
	let team_order = '';            // 合并打印单据
	let TouristSource = "";         // 合并打印单据
	let Guide = "";              	// 合并打印单据
	let Sceniclist = "";			// 剧场演出信息

	const mainOrder = data.mainOrder;
	Childs = data.Childs;
	TouristSource = `${data.team_province ? data.team_province : ''} ${data.team_city ? data.team_city : ''} ${data.team_county ? data.team_county : ''}`;
	Guide = data.team_guide;
	team_order = data.team_order;
	UUordernum = data.ordernum;
	UUcode = data.code;
	UUltitle = data.ltitle;
	UUttitle = data.ttitle;
	UUordername = data.ordername;
	UUordertel = data.ordertel;
	UUordertel2 = data.ordertel;
	UUtnum = data.tnum;
	UUremark = data.remark;
	PeopleNumber = data.tnum;
	UrlBarcode = data.UrlBarcode;

	//新增字段为剧场信息包含演出时间、作为分区、座位号
	Sceniclist = data.sceniclist;

	UUlprice_yuan = NP.strip(data.lprice / 100);
	UUlprice_yuan_sum = NP.strip(UUlprice_yuan * UUtnum);

	UUpaywayName = computedPayMode(data.pmode);
	UUbegintime = data.begintime;
	UUendtime = data.endtime;
	UUordertime = data.ordertime;
	// 总门市价
	UUMprice_yuan_sum = String(data.Mprice * data.tnum);
	if (UUMprice_yuan_sum.indexOf(".") < 0) UUMprice_yuan_sum = UUMprice_yuan_sum + ".00";
	//门市价
	UUMprice_yuan = String(data.Mprice);
	if (UUMprice_yuan.indexOf(".") < 0) UUMprice_yuan = UUMprice_yuan + ".00";
	//结算价(如果购票方是散客，结算价就取门市价来打印，如果是分销商，就取tprice)
	if (data.member == 112) {//散客
		UUtprice_yuan = String(data.Mprice);
	} else {// 分销商
		UUtprice_yuan = String(data.tprice / 100);
	}
	UUtprice_yuan_sum = String(UUtprice_yuan * UUtnum);
	if (UUtprice_yuan.indexOf(".") < 0) UUtprice_yuan = UUtprice_yuan + ".00";
	if (UUtprice_yuan_sum.indexOf(".") < 0) UUtprice_yuan_sum = UUtprice_yuan_sum + ".00";

	//总金额
	UUtotalmoney = String(data.totalmoney / 100);
	if (UUtotalmoney.indexOf(".") < 0) UUtotalmoney = UUtotalmoney + ".00";
	UUtotalmoney = " " + UUtotalmoney;
	UUtotalmoney_yuan = UUtotalmoney;

	//支付状态  1==已支付  2==未支付
	UUpaystatus2String = data.pay_status == 1 ? " 已支付" : " 未支付";
	//验证日期应该就是当前打印门票的时间
	UUdtime = moment().format("YYYY-MM-DD");

	fenxiaoshang = data.fenxiaoshang;

	UUTContent = data.ttitle + " * " + data.tnum;
	UUordernum_UUcode = data.ordernum + " " + data.code;
	UUtid_fxsAC = data.tid + " " + data.dname;
	UUaid = data.aid;
	fxsAC = data.dname;
	EmployeeName = data.operator ? data.operator.replace(/(.*)(\（.*\）)/g, function ($, $1, $2) {
		return $1;
	}) : "";
	EmployeeId = data.operator ? data.operator.replace(/(.*)\（(.*)\）/g, function ($, $1, $2) {
		return $2;
	}) : "";


	// 只有一票一码才能把身份证打印出来
	if (data.codes && (data.codes[0].indexOf("OD#") == 0)) { // 一票一码都是以"0D#"开头
		UUidcard = data.idcards.join(",");
	}

	// 演出类产品打印演出时间  分区名称  座位号
	const { dateTime, area, seat } = data.series || {};
	if (dateTime) PerformanceTime = dateTime;
	if (area) AreaNumber = area;
	if (seat) {
		SeatNow = seat.split("-")[0];
		SeatNumber = seat.split("-")[1];
	}


	const result = {
		Logo, Text, UUordernum, UUcode, UUltitle, UUttitle, UUordername, UUordertel, UUordertel2,
		UUtnum, PeopleNumber, UUtprice_yuan, UUtprice_yuan_sum, UUlprice_yuan, UUlprice_yuan_sum,
		UUMprice_yuan, UUMprice_yuan_sum, UUtotalmoney, UUtotalmoney_yuan, UUpaywayName, UUpaystatus2String, UUbegintime,
		UUendtime, UUordertime, UUdtime, fenxiaoshang, PerformanceTime, PerformanceTimeEnd, SeatNow,
		SeatNumber, AreaNumber, SingleArea, UUTContent, UUordernum_UUcode, UUtid_fxsAC, UUaid, fxsAC,
		UUremark, SerialNumber, SystemTime, EmployeeId, EmployeeName, UUidcard,UrlBarcode,Sceniclist
	};


	console.log("===============最终打印的数据==============");
	console.log(result);

	return result;

};

export default function ReceiptPrint ({ data, template, employeeName, printSet = {} }) {


	return new Promise((resolve, reject) => {
		//判断data是数组还是对象来区分是单独打印回执单还是购物车合并打印回执单
		let cmd, receiptData;
		if(Object.prototype.toString.call(data)==='[object Array]'){
			cmd='printGReceipt';
			receiptData=data.map(item => {
				return transformOrderData(item)
			});
		}else {
			cmd='printReceipt';
			receiptData=[transformOrderData(data)];
		}
		const params = {
			cmd: cmd,
			data: receiptData,
			template: template,
			employeeName: employeeName,
			printSet: {
				printName: printSet.printName || ""
			},
			dataKey: "printData"
		};

		BasePrint(params).then((res) => {
			resolve(params);
		}).catch((e) => {
			reject("打印失败，失败原因：", e);
		})

	})



};



function computedPayMode (paymode) {
	let paymodeName = ''
	switch (parseInt(paymode)) {
		case 0:
			paymodeName = "余额制度";
			break;
		case 1:
			paymodeName = "支付宝";
			break;
		case 2:
			paymodeName = "授信支付";
			break;
		case 3:
			paymodeName = "产品自销";
			break;
		case 4:
			paymodeName = "现场支付";
			break;
		case 5:
			paymodeName = "微信支付";
			break;
		case 6:
			paymodeName = "会员卡支付";
			break;
		case 7:
			paymodeName = "银联支付";
			break;
		case 8:
			paymodeName = "环迅支付";
			break;
		case 9:
			paymodeName = "现金支付";
			break;
		case 10:
			paymodeName = "拉卡拉";
			break;
		case 11:
			paymodeName = "拉卡拉（商户）";
			break;
		case 12:
			paymodeName = "拉卡拉（平台）";
			break;
		case 13:
			paymodeName = "特权支付（年卡）";
			break;
		case 14:
			paymodeName = "微信（聚合）";
			break;
		case 15:
			paymodeName = "平安银行";
			break;
		case 16:
			paymodeName = "支付宝（聚合）";
			break;
		case 17:
			paymodeName = "微信(通联)";
			break;
		case 18:
			paymodeName = "支付宝(通联)";
			break;
		case 19:
			paymodeName = "POS支付";
			break;
	}
	return paymodeName
}
