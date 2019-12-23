
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
export default function refundRequest(data) {
    console.log(data);
	return new Promise((resolve, reject) => {
		if (!data) {
			Message.error("data.data must be string");
			return reject("data.data must be string");
		}


		_UUID++;
		Storage.set(PRINT_UUID_KEY, _UUID);

		const params = {
			reqid: _UUID,
			cmd: 'Order_isCanRefund',
            ordernum: data,
            
		};

		Vue.ws.send(params, function (res) {
            res = res || {};
            console.log(res);
			if (res.code == 200) {
				resolve(res);
			} else {
				let msg = res.msg || "未知";
				    Message.error(`验证失败，失败原因：${msg}`);
					reject(`验证失败，失败原因：${msg}`);
			
			}
		});

	})
}
