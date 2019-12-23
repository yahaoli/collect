/*
 * @Author: huangzhiyang
 * @Date: 2018-05-14 11:58:57
 * @Last Modified by: huangzhiyang
 * @Last Modified time: 2018-06-07 17:28:04
 *
 * 通用低层打印报务
 *
 * 示例：
 *
 * print({
 * 	  cmd : "printticket",
 * 	  data : {},
 * 	  template : {},
 *    printSet : {
 * 	      printName : "aaaa"
 *    }
 * })
 *
 *
 */
import Vue from "vue";
import Storage, {KEY} from "@/util/storage";
import Message from "@/util/message";
import {resolve} from "path";

const PRINT_UUID_KEY = KEY.PRINT_UUID_KEY;

let _UUID = Storage.get(PRINT_UUID_KEY) || 0;

/**
 *
 * @param {string} cmd                            要调哪个打印报务
 * @param {object} data                           要打印的数据
 * @param {string|object} template                要打印的模板，如果是object，方法会调用JSON.stringify专成string
 * @param {object} printSet                       打印参数设置
 * @param {boolean} printSet.enableDerivePrint    打印参数设置
 * @param {string} printSet.printName             要用哪个打印机打印
 * @param {number} printSet.pageWidth
 * @param {number} printSet.pageHeight
 * @param {number} dataKey                        传给硬件的键名
 * @param {number} dataKey                        传给硬件的键名
 */
export default function print({cmd = "", data, template, employeeName, printSet = {}, dataKey = 'printData'}) {

	return new Promise((resolve, reject) => {

		if (!data) {
			Message.error("CallPrint: data.data must be string");
			return reject("CallPrint: data.data must be string");
		}
		if (!template) {
			Message.error("CallPrint: data.printmoder must be string");
			return reject("CallPrint: data.printmoder must be string");
		}


		printSet = Object.assign({
			enableDerivePrint: true,
			printName: "",
			pageWidth: 100,
			pageHeight: 200
		}, printSet);

		printSet = JSON.stringify(printSet);

		_UUID++;
		Storage.set(PRINT_UUID_KEY, _UUID);

		const params = {
			reqid: _UUID,
			cmd: cmd,
			employeeName: employeeName,
			//李健改了打印服务，现在打印时不需要再把订单数据stringify化
			//data字段废弃掉，改用printData
			// data : orderInfoStr,
			[dataKey]: data,	//硬件data的字段名会根据服务不同要起不同   门票：printData  报表：reportData
			printset: printSet
		};

		// 不同的cmd对template的格式要求不一致
		if (cmd === 'printInvoice' || cmd === 'printReceipt' || cmd === 'printGReceipt') {
			params.rprintmoder = template
		} else {
			if (typeof template !== "string") {
				try {
					template = JSON.stringify(template);
				} catch (e) {
					try {
						template = eval(template);
					} catch (e) {
						Message.error("转化打印模板为string时出错");

					}
				}
			}

			if (typeof template !== "string") return reject("转化打印模板为string时出错");
			if (template == "") return reject("打印模板不能为空");

			params.printmoder = template

		}

		cmd !== 'printticket' && Message.loading("请稍后，正在为您打印...");
		Vue.ws.send(params, function (res) {
			//console.log("res", res.msg);
			cmd !== 'printticket' && Message.closeLoading()
			res = res || {};
			if (res.code == 200) {
				resolve(params);
			} else {
				let msg = res.msg || "未知";
				// Message.error(`打印失败，失败原因：${msg}`);
				reject(`打印失败，失败原因：${msg}`);
			}
		});

	})
}
