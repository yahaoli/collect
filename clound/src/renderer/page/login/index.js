import "./index.scss";
import {Login, getSite} from "@/service";
import Message from "@/util/message";
import Storage, {KEY} from "@/util/storage";
import * as Types from "@/store/mutation-types";

export default {
	template: require("./index.xtpl"),
	data() {
		return {
			isSavePwd: false,
			loading: false,
			account: "",
			password: "",
			lastTimeStamp: '',
			lastTime: '',
			siteId: '',
			siteList: []
		}
	},
	mounted() {
		//isSavePwd==0 不记住   isSavePwd==1记住
		let isSavePwd = Storage.get(KEY.LOGIN_SAVE_PWD);
		if (isSavePwd === "true") {
			isSavePwd = true
		} else {
			//用户第一次使用时，默认不记住密码
			isSavePwd = false;
		}
		this.isSavePwd = isSavePwd;
		if (this.isSavePwd) {
			let account = Storage.get(KEY.LOGIN_ACCOUNT_NAME);
			let pwd = Storage.get(KEY.LOGIN_ACCOUNT_PWD);
			if (account) this.account = account;
			if (pwd) this.password = pwd;
		}
		this.$refs.input.$refs.input.focus();
		this.$nextTick(() => {
			this.$refs.input.$refs.input.select();
		});
		let account = $.trim(this.account);
		if (account !== '' && account !== undefined) {
			this.getSiteList()
		}
	},
	methods: {
		accountChange(event) {
			//标记当前事件函数的时间戳
			let that = this;
			this.lastTimeStamp = event.timeStamp;
			let account = $.trim(this.account);
			if (account === '' || account === undefined) {
				this.siteList = [];
				that.siteId = '';
				return;
			}
			//800ms后比较二者是否还相同（因为只要还有事件触发，lastTimeStamp就会被改写，不再是当前事件函数的时间戳）
			this.lastTime && clearTimeout(this.lastTime);
			this.lastTime = setTimeout(function () {
				if (that.lastTimeStamp === event.timeStamp) {
					that.siteList = [];
					that.siteId = '';
					that.getSiteList()
				}
			}, 600);
		},
		siteFocus(){
			let account = $.trim(this.account);
			if(account && this.siteList.length === 0){
				this.getSiteList();
			}
		},
		getSiteList() {
			let account = $.trim(this.account);
			let that = this;
			getSite({account}).then(res => {
				if (res.code === 200) {
					if (res.data.length) {
						that.siteId = res.data[0].id;
					}
					that.siteList = res.data;
				} else {
					Message.alert("出错", res.msg);
				}
			})
		},
		async onLogin(e) {
			if (this.loading) return false;
			const account = $.trim(this.account);
			const password = $.trim(this.password);
			const siteId = this.siteId;
			if (!account) return this.$message.error("请填写帐号");
			if (!password) return this.$message.error("请填写密码");
			if (siteId === '' || siteId === undefined) return this.$message.error("请选择站点");
			this.loading = true;
			console.log(siteId)
			const res = await Login({account, password, siteId});
			this.loading = false;
			if (res.code == 200) {
				const data = res.data;
				data.siteId = this.siteId;
				Storage.Session.set(KEY.USER_INFO, data);
				Storage.Session.set(KEY.LAST_REQUEST_TIME_KEY, new Date().getTime());
				Storage.set(KEY.LOGIN_SAVE_PWD, this.isSavePwd);
				if (this.isSavePwd) { //如果设置了记住密码
					Storage.set(KEY.LOGIN_ACCOUNT_NAME, account);
					Storage.set(KEY.LOGIN_ACCOUNT_PWD, password);
				} else {
					Storage.remove(KEY.LOGIN_ACCOUNT_NAME);
					Storage.remove(KEY.LOGIN_ACCOUNT_PWD);
				}
				this.$store.commit(Types.UPDATE_USER_INFO, data);
				this.$store.dispatch('getScenicList',{}).catch(e => this.$message.warning(e));
				this.$store.dispatch('checkSettingConfig').catch(e => this.$message.warning(e));
				this.$router.push("/");
				this.$RemoteService.winMax();

			} else {
				Message.alert("出错", res.msg);
			}
		}
	}
}
