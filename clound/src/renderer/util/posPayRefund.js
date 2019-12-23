
import Vue from "vue";
import Storage, { KEY } from "@/util/storage";
import Message from "@/util/message";
import { resolve } from "path"; 
import {refundRequest} from "@/service";

const PRINT_UUID_KEY = KEY.PRINT_UUID_KEY;

let _UUID = Storage.get(PRINT_UUID_KEY) || 0;

/**
 *@param {object} numType 					0；取消，1部分取消
 * @param {object} cmd 							数据接口
 * @param {object} data                           数据
 */
export default function posPayRefund(payload,numType) {
	return new Promise((resolve, reject) => {
		if (!payload) {
			Message.error("data.data must be string");
			return reject("data.data must be string");
		}


		_UUID++;
		Storage.set(PRINT_UUID_KEY, _UUID);
		
		let pmodeType = payload.pmode;
		let refundSumprice ='';
		//0表示取消全部，取origin_num为取消票数
		if(numType==0){
			 refundSumprice = Number(payload.tprice/100)*Number(payload.tnum);
		}
		//1表示部分取消全部，取num为取消票数
		 if(numType==1){

			 refundSumprice = Number(payload.tprice/100)*Number(payload.num);
		}
		let trade_no  = payload.trade_no;
		let dataNo = [refundSumprice, trade_no];
		
		const params = {
			reqid: _UUID,
			cmd: 'alipayPosRefund',
			data: dataNo
		};
		let ordernum = payload.ordernum;
		 /**
		 * 发送请求验证是否可以退款
		 */
		  refundRequest({ordernum:ordernum}).then(res => {
				if (res.code == 200) {
				Message.loading('等待刷卡,退款中')
				Vue.ws.send(params, function (res) {
					res = res || {};
					if (res.code == 200) {
						Message.closeLoading();
						resolve(res);
						Message.success('退款成功！');
					} else {
						Message.closeLoading();
						let msg = res.msg || "未知";
						Message.error(`退款失败，失败原因：${msg}`);
						reject(`退款失败，失败原因：${msg}`);
					}
				});
				
			} else {
				Message.closeLoading();
				Message.error(`退款失败，失败原因：${res.msg}`);
				reject(res.msg);
			}

		}).catch(err => {
			Message.closeLoading();
			Message.error(`验证失败，失败原因：${err}`);
			reject(`验证失败，失败原因：${err}`);
		});




	})
}
