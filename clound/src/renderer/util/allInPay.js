
import Vue from "vue";
import Storage, { KEY } from "@/util/storage";
import Message from "@/util/message";
import { resolve } from "path";

const PRINT_UUID_KEY = KEY.PRINT_UUID_KEY;

let _UUID = Storage.get(PRINT_UUID_KEY) || 0;

/**
 *
 *  @param {object} cmd 	数据接口
 * @param {object} data                           数据
 */
export default function allInPay({ cmd = "", data }) {

	return new Promise((resolve, reject) => {
		if (!data) {
			Message.error("data.data must be string");
			return reject("data.data must be string");
		}


		_UUID++;
		Storage.set(PRINT_UUID_KEY, _UUID);

		const params = {
			reqid: _UUID,
			cmd: cmd,
			data: data
		};


		Vue.ws.send(params, function (res) {
			Message.closeLoading()
			res = res || {};
			if (res.code == 200) {
				resolve(res);
			} else {
				let msg = res.msg || "未知";
				// Message.error(`支付失败，失败原因：${msg}`);
				if (cmd == "allinpayPos") {
					reject(`支付失败，失败原因：${msg}`);
				} else {
					reject(`退款失败，失败原因：${msg}`);
				}
			}
		});

	})
}
