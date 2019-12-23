import "./index.scss";
import Vue from "vue";
import Vuex from "vuex";
import {checkLogin} from "@/auth";
import Message from "@/util/message";
import Storage, {KEY} from "@/util/storage";
import {UPDATE_USER_INFO} from "@/store/mutation-types";
import {mapGetters, mapActions} from "vuex";
import Setting from "../setting";
import printProgress from "./components/print-progress/index";
import Ws from "@/util/websocket";
import Config from "@/config";
import {remote} from "electron";
import path from 'path';
import router from "../../router";
// 获取当前的window对象
const win = remote.getCurrentWindow();
const winWH = Config.winWH;

export default {
	template: require("./index.xtpl"),

	components: {
		Setting,
		printProgress
	},

	data() {
		return {
			appMinHeight: $(window).height() - 75,
			title:  "祥源票务" ,
			logo:  require("../../assets/image/xy_logo256.png") ,
			checkingForUpdate: false, //是否正在检测更新
			navList: [
				{
					name: "购票",
					img: require("../../assets/image/goupiao.png"),
					activeImg: require("../../assets/image/goupiao_active.png"),
					link: "/booking"
				},
				{
					name: "取票",
					img: require("../../assets/image/qupiao.png"),
					activeImg: require("../../assets/image/qupiao_active.png"),
					link: "/picking"
				},
				{
					name: "退票",
					img: require("../../assets/image/tuipiao.png"),
					activeImg: require("../../assets/image/tuipiao_active.png"),
					link: "/refund"
				},
				{
					name: "汇总",
					img: require("../../assets/image/huizong.png"),
					activeImg: require("../../assets/image/huizong_active.png"),
					link: "/summary"
				},
				{
					name: "班结",
					img: require("../../assets/image/banji_bg.png"),
					activeImg: require("../../assets/image/banji_bg_active.png"),
					link: "/banjie"
				},
				{
					name: "选座",
					img: require("../../assets/image/seat.png"),
					activeImg: require("../../assets/image/seat_active.png"),
					link: "/seat_selection"
				},
				{
					name: "发票管理",
					img: require("../../assets/image/invoice.png"),
					activeImg: require("../../assets/image/invoice_active.png"),
					link: "/invoice"
				}
			],
			times: 3,
			updateProgress: false,
			percentage: 0
		};
	},

	beforeCreate() {
		const path = this.$route.path.substring(1);
		if (checkLogin()) {
			if (path == "login") {
				this.$router.push("/");
			}
		} else {
			if (path !== "login") {
				this.$router.push("/login");
			}
		}
	},
	async mounted() {

		//读取字典存到store中
		this.updateDictionary();
		// Message.success(path.resolve(__dirname, '../../../app.asar.unpacked/extra/service/PFT.Platform.exe') + '\n' + path.resolve(__dirname, '../../../../extra/service/PFT.Platform.exe'));
		// console.log(remote.shell.showItemInFolder(path.resolve(__dirname, '../../../app.asar.unpacked/extra/service/PFT.Platform.exe')));


		//读取登录的帐号对应的终端号 - (暂时没用)
		//this.queryTerminalByAccount();

		// 0 : "连接还没开启",
		// 1 : "连接已开启并准备好进行通信",
		// 2 : "连接正在关闭的过程中",
		// 3 : "连接已经关闭，或者连接无法建立"
		const ws = Ws("", {
			onopen: (e) => {
				this.updateSocketState(e.target.readyState);
				if (this.$route.name != "Login") {
					setTimeout(() => {
						this.initToSendWSRequest();
					}, 500)
				}
			},
			onclose: (e) => {
				this.updateSocketState(e.target.readyState);
			},
			onerror: (e) => {
				this.updateSocketState(e.target.readyState);
			},
			onsend: (data) => {
				return data;
			},
			onmessage: (e) => {
				let res = {};
				for (var i in e) res[i] = e[i];
				try {
					if (res.data) res.data = JSON.parse(res.data);
				} catch (e) {
					try {
						if (res.data) res.data = eval(res.data);
					} catch (e) {
						Message.error("转化ws返回的数据出错");
					}
				}
				return res;
			}
		});
		Vue.ws = Vue.prototype.$ws = ws;


		this.$electron.ipcRenderer.on("window-all-close", () => {
			this.$ws.send({cmd: "quit"});
			this.logoutToClear();
		})
		this.$electron.ipcRenderer.on("window-close", () => {
			this.$ws.send({cmd: "quit"});
			this.logoutToClear();
		})


	},
	beforeRouteEnter(to, from, next) {
		next((vm) => {
			vm.$electron.ipcRenderer.on("update-message", (event, {type, data}) => {
				if (type == "checking-for-update") { //正在检查是否有新版本
					vm.checkingForUpdate = true;
				} else if (type == "update-not-available") { //检测完毕，没有新版本
					vm.checkingForUpdate = false;
					vm.$notify({
						title: "当前已是最新版本",
						message: "当前已是最新版本",
						type: "success"
					})
				} else if (type == "update-available") { //检测完毕，发现新版本
					vm.checkingForUpdate = false;
					vm.checkUpdateMsg("update-available", data).then(() => {
						vm.$RemoteService.downloadUpate();
						vm.$notify({
							title: "后台正在为您下载新版本安装包",
							message: "此下载过程需要花费1~3分钟时间，请稍后..",
							type: "info"
						})
						vm.updateProgress = true;
					}).catch(() => {
					});
				} else if (type == "download-progress") { //监听下载进度
					vm.percentage = +(data.percent.toFixed(0));
				} else if (type == "update-downloaded") { //新版本下载完毕
					vm.updateProgress = false;
					vm.percentage = 0;
					vm.checkUpdateMsg("update-downloaded").then(() => {
						vm.$RemoteService.quitAndInstall();
					}).catch(() => {
					});
				} else if (type == "error") { //发生错误
					vm.updateProgress = false;
					vm.percentage = 0;
					vm.checkingForUpdate = false;
					vm.$notify.error({
						title: "检测更新时发生错误",
						message: data
					})
				}
			})
		})
	},
	beforeRouteUpdate(to, from, next) {
		if (from.name == "Login" && to.name == "Booking") {
			setTimeout(() => {
				this.initToSendWSRequest();
			}, 500)
		}
		next();
	},
	computed: {
		...Vuex.mapState(["setting"]),
		pageLoading() {
			return this.$store.state.pageLoading;
		},
		websocketReadyState() {
			return this.$store.state.websocketReadyState;
		}
	},

	methods: {
		...mapActions(['updateDictionary', 'queryTerminalByAccount']),
		//当收到ws发回的读取打印机列表
		onWSReadPrint(res) {

			const error = (text) => `获取打印机名称列表失败，失败原因：${text}`;
			if (!res) return Message.error(error("未知"));
			if (res.code != 200) return Message.error(error(res.msg || "出错"));
			if (res.data == '') return Message.error(error("硬件服务返回的res.data值不存在"));
			try {
				const data = JSON.parse(res.data);
				if (data && data.length > 0) {
					this.$store.dispatch('updatePrintListAction', data).catch(err => {
						Message.error(err);
					})
				} else {
					Message.error(error("获取数据为空"));
				}
			} catch (e) {
				Message.error(error(e));
			}
		},
		//初始化时发送读身份证级获取打印机列表请求
		initToSendWSRequest() {
			//获取系统设置里的身份证读卡类型
			const {id_read_type} = this.setting.data;
			//第一次连接上时就启动身份证读卡
			this.$ws.send({
				cmd: "idread",
				reqid: "2",
				idcardType: (typeof id_read_type !== "undefined") ? id_read_type : ""
			});
			this.$ws.send({cmd: "readprint", reqid: "1000"}, (res) => {
				//当收到ws发回的读取打印机列表
				this.onWSReadPrint(res);
			});
		},

		onLogout(e) {
			Message.confirm("确定要退出应用吗？")
				.then(() => {
					this.logoutToClear();
					this.$RemoteService.setWinSize({width: winWH.width, height: winWH.height})
				})
				.catch(e => {
				});
		},
		logoutToClear() {
			//切换帐号时，先把session里的缓存删掉，否则用新帐号登录进来后，会取上一个帐号的缓存数据
			Storage.Session.remove(KEY.USER_INFO);
			Storage.Session.remove(KEY.LAST_REQUEST_TIME_KEY);
			Storage.Session.remove(KEY.BUY_TICKET_RELATION_LIST);
			Storage.Session.remove(KEY.BUY_TICKET_PRODUCT_LIST_PERSON);
			Storage.Session.remove(KEY.BUY_TICKET_PRODUCT_LIST_DIS);
			this.$store.commit(UPDATE_USER_INFO, null);
			this.$router.push("/login");
			//this.$ws.close();
		},
		reConnectWebsocket() {
			this.updatePageLoading(true);
			this.$ws
				.reconnect()
				.then(e => {
					this.updatePageLoading(false);
					this.updateSocketState(e.target.readyState);
					Message.success("服务连接成功");
					this.updateSocketState(e.target.readyState);
					//获取系统设置里的身份证读卡类型
					const {id_read_type} = this.setting.data;
					this.$ws.send({
						cmd: "idread",
						reqid: "2",
						idcardType: (typeof id_read_type !== "undefined") ? id_read_type : ""
					});
					this.$ws.send({cmd: "readprint", reqid: "10001"}, (res) => {
						this.onWSReadPrint(res);
					});
				})
				.catch(e => {
					this.updatePageLoading(false);
					this.updateSocketState(e.target.readyState);
					//最多重连3次
					if (this.times < 0) return false;
					this.times--;
					this.startUpService();
				});
		},
		startUpService() {
			const setupResult = this.$RemoteService.setupPlatform();
			if (setupResult) {
				this.reConnectWebsocket();
			} else {
				Message.error("重连接失败，请尝试手动启动");
			}
			// if (
			// 	// 开发模式url地址
			// 	remote.shell.openItem(path.resolve(__dirname, '../../../../extra/service/PFT.Platform.exe')) ||
			// 	// 打包后
			// 	remote.shell.openItem(path.resolve(__dirname, '../../../app.asar.unpacked/extra/service/PFT.Platform.exe'))
			// ) {
			// 	if (this.times <= 0) {
			// 		Message.error("云服务连接失败，请尝试手动启动");
			// 		setTimeout(() => {
			// 			remote.shell.showItemInFolder(path.resolve(__dirname, '../../../app.asar.unpacked/extra/service/PFT.Platform.exe'));
			// 		}, 1000);
			// 		return
			// 	}
			// 	this.times--;
			// 	return setTimeout(() => {
			// 		this.reConnectWebsocket({noMessage: this.$route.name === 'Login'})
			// 	}, 300);
			// }
		},
		updatePageLoading(val) {
			this.$store.dispatch("updatePageLoading", !!val);
		},
		updateSocketState(val) {
			this.$store.dispatch("updateSocketState", val);
		},
		settingChange(command) {
			if (command === "changeSettingStatusAction") {
				this.$store.dispatch('changeSettingStatusAction', true)
			} else if (command === "switchAccount") {
				this.logoutToClear();
				this.$RemoteService.setWinSize({width: winWH.width, height: winWH.height})
			} else if (command === "checkForUpdate") {
				this.$RemoteService.checkForUpdate();
			} else if (command === 'receiptTemplateConfig' || command === 'invoiceTemplateConfig') {
				this.$router.push({path: '/' + command})
			} else if (command === 'reload') {
				win.reload();
			}
		},
		checkUpdateMsg(type, data) {
			if (type == "update-available") {
				const releaseNotes = data.releaseNotes ? data.releaseNotes.split("|") : [];
				const updatesInfo = releaseNotes.map((info, index) => `<dd>${index + 1}、${info}</dd>`);
				const str = `<dl style="margin-left:20px;"><dt>本次更新内容：</dt>${updatesInfo.join("")}</dl>`;
				return this.$confirm(str, `发现新版本 - ${data.version}，是否立即更新？`, {
					closeOnClickModal: false,
					closeOnPressEscape: false,
					confirmButtonText: "立即更新",
					cancelButtonText: "以后再说",
					dangerouslyUseHTMLString: true
				})
			} else if (type == "update-downloaded") {
				return this.$confirm('新版本安装包下载完毕，是否立即安装？', '安装提示', {
					closeOnClickModal: false,
					closeOnPressEscape: false,
					confirmButtonText: "立即安装",
					cancelButtonText: "以后再说"
				})

			}
		}
	}
};
