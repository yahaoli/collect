/*
 * @Author: huangzhiyang
 * @Date: 2017-10-26 11:06:29
 * @Last Modified by: huangzhiyang
 * @Last Modified time: 2018-06-05 18:38:25
 *
 * 本应用的一些全局配置
 *
 */
import {remote} from "electron";
import path from "path";
import fs from "fs";

const pck = require('../../../package.json');
const origin = process.env.ORIGIN;
const env = process.env.DEPLOY_ENV;
const updateUrl = pck.updateUrl[origin];


const originConfig = {
	sunriver: {
		updateUrl: updateUrl,
		envList: {
			test: "http://api.xisland.test/",
			local: "/api/",
			//内网138
			test138: "http://api.xisland.test/",
			//内网139
			test139: "http://api2.xisland.test/",
			//预生产
			release: "http://terminal.dev.xisland.cn/",
			//生产
			prod: "http://terminal.xisland.cn/"
		},
		memberList: {
			test: "http://gate.xisland.cn/",
			local: "/member/",
			//内网138
			test138: "http://gate.xisland.cn/",
			//内网139
			test139: "http://gate.xisland.cn/",
			//预生产
			release: "https://puc.xisland.cn/pxd/",
			//生产
			prod: "https://puc.xisland.cn/pxd/"
		},
		app_id: "cloud_ticket_system",
		secret: "df24da52053949f8e448a826916b34db",
		payApi: {
			test: "http://pay.xisland.test",
			loal: "http://pay.xisland.local",
			test138: "http://pay.xisland.test",
			test139: "http://pay.xisland.test",
			release: "http://pay.xisland.cn",
			prod: "http://pay.xisland.cn"
		},
		payApi_offline: {
			test: "http://api.xisland.test/api.php",
			local: "http://api.xisland.local/api.php",
			test138: "http://api.xisland.test/api.php",
			test139: "http://api.xisland.test/api.php",
			release: "http://terminal.dev.xisland.cn/api.php",
			prod: "http://terminal.xisland.cn/api.php"
		},
		zdApi: {
			test: "http://zd.xisland.cn/",
			local: "http://zd.xisland.cn/",
			test138: location.hostname === 'localhost' ? "/zd/" : "http://zd.xisland.cn/",
			test139: location.hostname === 'localhost' ? "/zd/" : "http://zd.xisland.cn/",
			release: location.hostname === 'localhost' ? "/zd/" : "http://zd.xisland.cn/",
			prod: "http://zd.xisland.cn/"
			// test:"http://zd.dev.xisland.cn/",
			// local: "http://zd.dev.xisland.cn/",
			// test138: location.hostname === 'localhost' ? "/zd/" : "http://zd.dev.xisland.cn/",
			// test139: location.hostname === 'localhost' ? "/zd/" : "http://zd.dev.xisland.cn/",
			// release: location.hostname === 'localhost' ? "/zd/" : "http://zd.dev.xisland.cn/",
			// prod: "http://zd.dev.xisland.cn/"
		}
	}
};


let config = {
	origin: origin,
	version: pck.version,
	AJAX_ERROR_TEXT: "网络故障，请稍后重试",
	AJAX_TIMEOUT_TEXT: "网络故障，请稍后重试",
	appPath: remote.app.getPath("userData"),

	//应用的边框大小
	winWH: {
		width: 560,
		height: 560
	},

	//登录过期时间，1小时
	expire: 60 * 60 * 1000,
	env: env,
	//最大库存数
	MAX_STORAGE_NUM: 9999999,
	//用户第一次启动云票务时，默认的系统设置项
	defaultUserSetting: {
		settingPassword: '12301',
		// 功能
		option: ['booking', 'picking', 'refund', 'summary', 'summary_sales', 'my_order', 'summary_log'],
		// 套票打印模式  main==打印主票  sub==打印子票
		set_ticket_checked: 'main',
		// 小票打印机
		// min_ticket: '',
		// 门票打印机
		entrance_ticket: '',
		// 门票打印机2
		entrance_ticket2: '',
		// 发票打印机
		invoice_print: '',
		// 产品列表
		product: '',
		// 读卡类型
		card_read_type: '',
		// 身份证读卡器列表
		id_read_type: '',
		// 购票信息输入
		tickets_buy_insert: ['mobile', 'mainAssn'],
		// 支付类型
		pay_type: ['cash', 'wx', 'alipay', 'couldpay'],
		// 提交身份信息不打门票
		id_no_ticket: 0,
		// 返回客户状态
		tickets_buy_return_tourist_status: 0,
		// 渠道按钮
		channel_btn: 0,
		// 门票打印确认
		ticket_print: 0,
		// 二次确认
		cash_confirm: 0,
		// 取票订票验证：
		ticket_pick: 0,
		// 购票订票验证：
		ticket_buy: 0,
		//移动支付扫码类型
		mobile_pay_checked: 'barCodeGun',
		//是否开启快捷键
		shortcutKeys: 0,
		//是否开启祥源会会员
		memberSet: 0,
		//找零
		changeMoney:0,
		mainAssnSearch: 1,
		//票类分组
		ticketGroup:0,
	}
};


config = {...config, ...originConfig[origin]}


const customConfigPath = path.join(config.appPath, "../pft.clund.user.config.json");
let customConfig = null;
try {
	const bufer = fs.readFileSync(customConfigPath);
	if (bufer) {
		customConfig = bufer.toString();
		customConfig = JSON.parse(customConfig);
	}
} catch (e) {
}


if (!customConfig) customConfig = {};

const finalConfig = {...config, ...customConfig};

export default finalConfig;
