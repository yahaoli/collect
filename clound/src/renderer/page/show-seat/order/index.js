import "./index.scss";
import Vuex from "vuex";
import * as Service from "@/service";
import Message from "@/util/message";
import {cloneDeep} from "lodash";
import ValidateRule from "@/util/validateRule";
import checkIDCardInAgeLimit from "@/util/checkIDCardInAgeLimit"
import Bus from "@/util/eventBus";
import {uniq, trim} from "lodash";
import Storage, {KEY} from "@/util/storage";

const PRINT_UUID_KEY = KEY.PRINT_UUID_KEY;
let _UUID = Storage.get(PRINT_UUID_KEY) || 0;
import Vue from "vue";

const {ShowService} = Service;

export default {
	template: require("./index.xtpl"),
	props: {
		prodId: {
			type: [String, Number],
			default: "",
			required: true
		},
		prodName: {
			type: String,
			default: "",
			required: true
		},
		roundId: {
			type: [String, Number],
			default: "",
			required: true
		},
		roundName: {
			type: String,
			default: "",
			required: true
		},
		zoneId: {
			type: [String, Number],
			default: "",
			required: true
		},
		zoneName: {
			type: String,
			default: "",
			required: true
		},
		venueId: {
			type: [String, Number],
			default: "",
			required: true
		},
		seatId: {
			type: String,
			default: "",
			required: true
		},
		date: {
			type: String,
			default: "",
			required: true
		},
		sapplyDid: {
			type: [String, Number],
			default: "",
			required: true
		}
	},
	data() {
		return {

			//标识是从哪个页面跳进来的
			fromPage: null,

			//标识是否已经解锁座位   true==已解锁  还未解锁==false
			hasUnlock: false,
			loading: true,
			headTopDesc: `${this.prodName}，${this.date}，${this.roundName}，${this.zoneName}`,
			seatList: [],
			seatID: this.seatId.split(",").map((item) => item.split("|")[0]).join(","),
			curSelectedSeatID: 0,  //标识当前选中的是哪个座位，如果都没选中，则值为0

			relationId: "0",
			relationList: [],

			ordername: "",
			mobile: "",
			liushui: "",
			memo: "",

			//客源地
			originList: [],
			originProps: {
				value: 'area_id',
				label: 'area_name',
				children: '_child',
			},
			originSelected: [],


			//总收款钱数
			vTotalMoney: 0,

			paycodeDialogShow: false,
			paycodePopShow: false,
			orderList: [],
			ordernum: "",
			merchantID: "",
			paycode: "",
			lastKeydownTime: "",
			//两次keyup事件的时间间隔 暂时定50毫秒
			KEYUP_TIME_DISTANCE: 50,
			//标识用户本次提交订单使用的支付方式
			//crash==现金支付  credit==授信   alipay==支付宝  wx==微信  ""==初使状态
			payText: "",

			submitChannel: 7, //提交的销售渠道 7：散客  9 ：团队
			fetchRelationByKeywordLoading: false
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {

			vm.fromPage = from.name;
			/*
                        vm.onKeydown = vm.onKeydown.bind(vm);
                        document.addEventListener("keyup", vm.onKeyup, false)
                        document.addEventListener("keydown", vm.onKeydown, false)*/

			vm.$ws.on("readidcardinfo", (data, e) => {
				/**
				 * 读取系统设置里身份证读卡设置
				 * id_read_type == 0 关闭身份证读卡
				 * id_read_type == 1 采用精伦读卡器
				 * id_read_type == 2 采用新中新读卡器
				 */
				const {id_read_type} = vm.$store.state.setting.data;
				if (id_read_type == 0) return Message.error("身份证读卡器已关闭，请到个人设置里开启");
				Message.success("读取到身份证信息");
				if (data.code == 200) {
					const info = JSON.parse(data.data);
					const idcard = info.Code;
					const name = info.Name;
					if (!idcard) return Message.error("读取不到身份证号码");
					if (!name) return Message.error("读取不到身份证上的姓名");
					vm.onReadCard(name, idcard);
				} else {
					Message.error(data.msg || "读取身份证失败");
				}
			})

			Bus.on("switchAccount", () => {
				vm.hasUnlock = true;
				vm.$ws.off("readidcardinfo");
				ShowService.unlockSeats({
					venueID: vm.venueId,
					roundID: vm.roundId,
					zoneID: vm.zoneId,
					seatID: vm.seatID
				})
			})

		})
	},
	beforeRouteLeave(to, from, next) {


		document.removeEventListener("keydown", this.onKeydown);

		if (!this.hasUnlock) {
			const seatID = this.seatID;
			ShowService.unlockSeats({
				venueID: this.venueId,
				roundID: this.roundId,
				zoneID: this.zoneId,
				seatID
			}).then((res) => {
				if (![200, 205].includes(res.code)) return Message.error(res.msg);
				this.$ws.off("readidcardinfo");
				next();
			}).catch((error) => {
				Message.error(error.toString());
			})
		} else {
			this.$ws.off("readidcardinfo");
			next();
		}
	},
	created() {
		this.loading = true;
		const {account, member_id, parent_member_id, siteId, siteInfo} = this.$store.state.userInfo;

		//处理位座列表
		this.seatList = this.seatId.split(",").map((seat) => {
			const [seatID, seatNum] = seat.split("|");
			const [row, col] = seatNum.split("-");
			return {
				id: seatID,
				row, col,
				seat: `${row}排${col}座`,
				idcard: "",
				name: "",
				selectedTicket: null,
				ticketList: []
			}
		}).sort((a, b) => (a.row * 1 - b.row * 1));
		let window_property = siteInfo.window_property.split(',');
		let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
		//拉取购票方列表及客源地数据(如果系统设置里有设置显示客源地的话)
		const all = [Service.FetchRelationList({account, aid: member_id, siteId, siteType})];
		if (this.isOriginInputShow) {
			all.push(Service.fetchSecondLevelArea());
		}
		Promise.all(all).then((res) => {
			const relationRes = res[0];
			const orignRes = res[1];
			if (orignRes) {
				if (orignRes.code == 200) {
					this.originList = orignRes.data.map((item) => {
						item._child = item._child.map((area) => Object.assign({}, area, {_child: []}));
						return item;
					})
				} else {
					Message.error(`请求客源地接口出错：${orignRes.msg}`);
				}
			}
			if (relationRes.code != 200) {
				this.loading = false;
				Message.error(relationRes.msg);
				return false;
			}
			const relationList = relationRes.data;
			const f = relationList[0];
			const relationId = f.mid;
			this.relationId = relationId;
			this.relationList = relationList;
			this.fetchTicketList(relationId)
		}).catch((e) => {
			this.loading = false;
			Message.error(e.toString());
		})

	},
	computed: {
		totalMoney() {
			const relationID = this.relationId;
			const total = this.seatList.reduce((prev, next) => {
				const selectedTicket = next.selectedTicket || {};
				const tprice = selectedTicket.tprice || 0;
				const jsprice = selectedTicket.jsprice || 0;
				const price = relationID == 0 ? tprice : jsprice;
				return prev + price;
			}, 0);
			return this.$NP.strip(total);
		},
		totalCount() {
			return this.seatList.length;
		},
		absMoney() {
			let money = this.$NP.strip(this.vTotalMoney - this.totalMoney);
			if (money < 0) money = 0;
			return money;
		},
		// seatID(){
		// 	return this.seatId.split(",").map((item)=>item.split("|")[0]).join(",")
		// },
		//是否显示票面流水号输入框
		isTicketNoInputShow() {
			const setting = this.$store.state.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.includes("ticketNumber")
		},
		//是否显示备注输入框
		isMemoInputShow() {
			const setting = this.$store.state.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.includes("memo")
		},
		//是否显示手机号输入框
		isMobileInputShow() {
			const setting = this.$store.state.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.includes("mobile")
		},
		//是否显示客源地
		isOriginInputShow() {
			const setting = this.$store.state.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.includes("touristDestination");
		}
	},
	methods: {
		...Vuex.mapActions(["printTicket"]),
		//处理扫描付款码
		/*async onKeydown(e){
			console.log('扫码枪');
			const KEYUP_TIME_DISTANCE = this.KEYUP_TIME_DISTANCE;
			const paycodeDialogShow = this.paycodeDialogShow;
			let paycode = this.paycode;
			let lastKeydownTime = this.lastKeydownTime;
			const payText = this.payText;
			const payType = payText == "alipay" ? 1 : 2;
			const ordernum = this.ordernum;
			const merchantID = this.merchantID;
			const prodID = this.prodId;
			const sapplyDid = this.sapplyDid;
			if (!paycodeDialogShow) return false;
			//如果是按住了ctrl alt shift meta键，则不做任何处理
			if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return false;
			const now = new Date().getTime();
			const KEY_CODE = ["Tab", "Enter"];
			console.log(paycode);
			if (KEY_CODE.includes(e.code) && paycode) { //触发了tab键或回车链 表示扫码结束
				//扫码成功，会得到一个付款码payCode
				const error = (text) => `支付失败，失败原因：${text}`;
				this.loading = true;
				this.paycodeDialogShow = false;
				try {
					const res = await Service.payOrder({
						pay_type: payType,
						channel: payType,
						auth_code: paycode,
						ordernum: ordernum,
						merchant_id: merchantID
					})
					this.loading = false;
					if (!res || res.code != 200) {
						let msg = "未知错误";
						if (res && res.msg) msg = res.msg;
						Message.error(msg);
						return false;
					}
					this.buySuccess({ ordernum, lid:prodID, applyDid:sapplyDid, orderList: cloneDeep(this.orderList) });
				}catch(e){
					this.loading = false;
					Message.alert(error(e.toString()));
				}
			} else {
				//如果输入的不是数字，也不做处理
				if (e.code.indexOf("Digit") !== 0) return false;
				//如果这次的输入与上一次输入时间间隔大于50毫秒，也过滤掉，不做处理
				if (lastKeydownTime > 0 && (now - lastKeydownTime > KEYUP_TIME_DISTANCE)) return false;
				lastKeydownTime = now;
				this.paycode += e.key;
			}
		},*/
		//切换购票方时
		onRelationChange(val) {
			if (val == 0) {
				this.submitChannel = 7;
			} else {
				this.submitChannel = 9;
			}
			this.fetchTicketList(val);
		},
		onOriginChange(parents) {
			if (parents.length <= 1) return false;
			const [provID, cityID] = parents;
			const error = (text) => `请求地区列表数据失败：${text || '未知错误'}`;
			const originList = cloneDeep(this.originList);
			const prov = originList.find((item) => item.area_id == provID);
			if (!prov) return false;
			const city = prov._child.find((item) => item.area_id == cityID);
			if (!city) return false;
			const _child = city._child;
			if (_child && _child.length > 0) return false;
			Service.fetchTownList({superior_id: cityID}).then((res) => {
				if (res.code == 200) {
					const list = res.data.map((item) => {
						return {
							area_id: item.id,
							area_name: item.town_name
						}
					});
					if (list.length == 0) {
						delete city._child;
					} else {
						city._child = list;
					}

					this.originList = originList;

				} else {
					Message.error(error(res.msg))
				}
			}).catch((e) => {
				Message.error(error(e.toString()));
			})
		},
		onTicketChange(tid, seatID) {
			this.seatList = this.seatList.map((item) => {
				item = cloneDeep(item);
				if (item.id == seatID) {
					const selectedTicket = item.selectedTicket = item.ticketList.find((ticket) => ticket.tid == tid);
					const {tourist_info, ageLimit} = item.selectedTicket;
					const idcard = item.idcard;
					if (tourist_info != 0 && idcard) {
						const validor = checkIDCardInAgeLimit(idcard, ageLimit);
						if (validor.code != 200) {
							item.idcard = "";
						}
					}
				}
				return item;
			})
		},

		onTicketChangeList(tid) {
			this.seatList = this.seatList.map((item) => {
				item = cloneDeep(item);
				const selectedTicket = item.selectedTicket = item.ticketList.find((ticket) => ticket.tid == tid);
				const {tourist_info, ageLimit} = item.selectedTicket;
				const idcard = item.idcard;
				if (tourist_info != 0 && idcard) {
					const validor = checkIDCardInAgeLimit(idcard, ageLimit);
					if (validor.code != 200) {
						item.idcard = "";
					}
				}
				return item;
			})
		},

		onRemoveSeat(seatID, seat) {
			this.$confirm(`确定要删除${seat}吗？`).then(() => {
				this.loading = true;
				ShowService.unlockSeats({
					venueID: this.venueId,
					roundID: this.roundId,
					zoneID: this.zoneId,
					seatID
				}).then((res) => {
					this.loading = false;
					if (res.code != 200) return Message.error(res.msg);
					this.seatList = this.seatList.filter((item) => item.id != seatID);
					this.seatID = this.seatID.split(",").filter((id) => id != seatID).join(",");
					if (this.fromPage == "ShowOnline") {
						this.$store.dispatch("showSeat_online/updateSelectedList", {type: "remove", list: seatID})
					}
					if (this.seatList.length == 0) this.hasUnlock = true;
					if (this.curSelectedSeatID == seatID) this.curSelectedSeatID = 0;
				}).catch((error) => {
					this.loading = false;
					Message.error(error.toString());
				})
			}).catch(() => {
			})
		},
		onCartItemClick(item) {
			if (this.curSelectedSeatID == item.id) { //取消选中
				this.curSelectedSeatID = 0;
			} else {
				this.curSelectedSeatID = item.id;
			}
		},
		onGoBackClick() {
			if (this.seatList.length == 0) return this.goBack();
			const seatID = this.seatID;
			ShowService.unlockSeats({
				venueID: this.venueId,
				roundID: this.roundId,
				zoneID: this.zoneId,
				seatID
			}).then((res) => {
				if (![200, 205].includes(res.code)) return Message.error(res.msg);
				this.goBack()
			}).catch((error) => {
				Message.error(error.toString());
			})
		},
		//读卡服务读取到身份证信息时
		onReadCard(name, idcard) {
			let seatList = cloneDeep(this.seatList);
			const curSelectedSeatID = this.curSelectedSeatID;

			//算出刷入的身份证信息要填入哪个座位里
			const getCurSeat = (exceptID) => {
				//先过滤掉不符合条件的
				const _list = seatList.filter((item) => {
					const {id, tourist_info, idcard, selectedTicket} = item;
					const {ageLimit} = selectedTicket;
					//过滤掉要排除的项
					if (id == exceptID) return false;
					//过滤掉不需要填写身份证的
					if (tourist_info == 0) return false;
					//过滤掉已经填写了身份证的
					if (idcard) return false;
					//过滤掉身份证年龄限制不符合的
					if (checkIDCardInAgeLimit(idcard, ageLimit).code != 200) return false;
					return true;
				})
				if (_list.length == 0) return null;
				//如果只有一个符合条件上的，那就是它了
				if (_list.length == 1) return _list[0];

				//如果有大于1项符合条件的，那就需要再判断优先权
				//有年龄限制且录入的身份证刚好在此限制范围内的，优先权最大
				const _list2 = _list.filter((item) => {
					const {ageLimit} = item.selectedTicket;
					return (ageLimit.length > 0 && checkIDCardInAgeLimit(idcard, ageLimit).code == 200)
				})

				if (_list2[0]) return _list2[0];

				return _list[0];

			};


			const hasInputed = seatList.find((item) => item.idcard === idcard);
			if (hasInputed) return Message.error("此身份证已录入，请更换");


			if (curSelectedSeatID) {
				const curSeatItem = seatList.find((seat) => seat.id == curSelectedSeatID);
				const ticket = curSeatItem.selectedTicket;
				const {tourist_info, ageLimit} = ticket;
				if (tourist_info != 0 && checkIDCardInAgeLimit(idcard, ageLimit).code == 200) {
					curSeatItem.idcard = idcard;
					curSeatItem.name = name;
				} else {
					const other = getCurSeat(curSelectedSeatID);
					if (other) {
						other.idcard = idcard;
						other.name = name;
					}
				}
			} else {
				const other = getCurSeat();
				if (other) {
					other.idcard = idcard;
					other.name = name;
				}
			}

			this.seatList = seatList;

		},
		//当点击了付款码扫码弹窗的取消按钮时
		onPaycodeDialogCancel() {
			this.paycodeDialogShow = false;
			this.loading = false;
		},
		fetchTicketList(relationID) {
			this.loading = true;
			const {parent_member_id} = this.$store.state.userInfo;
			let aid = relationID == 0 ? this.sapplyDid : parent_member_id;
			let fid = relationID == 0 ? parent_member_id : relationID;
			//9==团队窗口，购票方为分销商
			//7==散客窗口，购票方为散客
			let channel = relationID == 0 ? 7 : 9;
			const onError = (seatList, errorMsg) => {
				seatList = seatList.map((item) => {
					item.selectedTicket = null;
					item.ticketList = [];
				})
				Message.error(errorMsg);
			};
			Service.FetchTicketList({aid, lid: this.prodId, fid, date: this.date, channel}).then((res) => {
				this.loading = false;
				if (res.code != 200) return onError(this.seatList, res.msg);
				if (!res.data.list) return onError(this.seatList, "请求票类接口出错，未返回票类数据")
				if (res.data.list.length == 0) return onError(this.seatList, "请求票类接口出错，票类列表为空");
				const ticketList = res.data.list.filter((ticket) => ticket.zone_id == this.zoneId);
				if (ticketList.length == 0) return onError(this.seatList, `该 ${this.zoneName} 里没有可售票类`);
				this.seatList = this.seatList.map((seat) => {
					if (seat.selectedTicket) {
						const newSelectedTicket = ticketList.find((item) => item.tid == seat.selectedTicket.tid);
						if (newSelectedTicket) {
							seat.selectedTicket = cloneDeep(newSelectedTicket);
						} else {
							seat.selectedTicket = cloneDeep(ticketList[0]);
						}
					} else {
						seat.selectedTicket = cloneDeep(ticketList[0]);
					}
					seat.ticketList = cloneDeep(ticketList)
					return seat;
				});
			}).catch((error) => {
				this.loading = false;
				onError(this.seatList, error.toString())
			});
		},

		/**
		 * 判断身份证是否合法，是否在年龄限制范围内
		 * @param {string} idcard  身份证号
		 * @param {array} ageLimit 限制范围
		 * @return {object} {code:"",msg:""}
		 */
		checkIDCard(idcard, ageLimit) {
			const result = {
				code: 200,
				msg: ""
			};
			if (!idcard) {
				result.code = -1;
				result.msg = "身份证不能为空";
				return result;
			}
			//判断身份证是否合法
			const valid = ValidateRule.idcard(idcard);
			if (!valid.isOk) {
				result.code = -2;
				result.msg = valid.errMsg;
				return result;
			}
			//判断身份证是否在年龄限制范围内
			const ageLimitCheck = checkIDCardInAgeLimit({idcard, ageLimit});
			if (ageLimitCheck.code != 200) {
				result.code = -3;
				result.msg = ageLimitCheck.msg;
				return result;
			}
			return result;
		},
		/**
		 * 判断身份证是否重复
		 * @return  false==不重复  true==重复
		 */
		checkIDCardEqual(seatList) {
			if (!seatList || seatList.length == 0) return false;
			seatList = cloneDeep(seatList).filter((item) => item.selectedTicket && item.selectedTicket.tourist_info != 0);

			//过滤出可用的(格式正确的且在年龄限制范围内的)
			const _seatList = seatList.filter((seat) => {
				const {idcard, selectedTicket} = seat;
				if (!idcard || !selectedTicket) return false;
				const ageLimit = selectedTicket.ageLimit;
				if (!ageLimit) return false;
				if (this.checkIDCard(idcard, ageLimit).code != 200) return false;
				return true;
			});


			const idcards = _seatList.map((seat) => seat.idcard);

			if (idcards.length == 0) return false;

			//得到去重后不重复的数组
			const uniqIDCards = uniq(idcards);


			if (idcards.length > uniqIDCards.length) return true;

			return false;

		},


		async submitOrder(e, paymode, payText) {
			//防止焦点按钮enter事件提交click
			if (this.paycodePopShow) {
				return;
			}
			const $state = this.$store.state;
			const {userInfo, setting} = $state;
			const {account} = userInfo;
			const settingData = setting.data;
			const curRelationID = this.relationId;
			const seatList = this.seatList;
			let ordername = this.ordername;
			const ordertel = this.mobile;
			const liushui = this.liushui;
			const memo = this.memo;

			const aid = userInfo.member_id;
			let mid = curRelationID == 0 ? userInfo.parent_member_id : curRelationID;
			const op = userInfo.member_id;
			const pid = this.prodId;
			const sapplyDid = this.sapplyDid;
			const token = userInfo.token;
			const is_member = (mid == "" || mid == "0") ? "0" : "1"; //0代表散客，1代表分销商
			const begintime = this.date;
			const channel = 4;
			const approver_id = "";  //审批人id
			const physics_no = "";   //物理卡号
			//演出类座位id
			const venueID = this.venueId;
			const roundID = this.roundId;


			//是否发送短信  0 发送 1 不发送
			const is_sms = settingData.tickets_buy_insert.find((item) => item == "message") ? 0 : 1;
			//从系统设置里取出买即验参数，带到下单接口里传给后端
			const now_check = settingData.ticket_buy;

			//客源地
			const originSelected = this.originSelected
			let team_province = originSelected[0] || ""; //省
			let team_city = originSelected[1] || "";     //市
			let team_county = originSelected[2] || "";   //区

			const sapply_did_array = [sapplyDid];
			const lid_array = [pid]; //景区id
			const priceInfo = [];
			let idCardInfo = [];
			const ticketsInfo = [];
			//演出类相关
			const round_id = [roundID];  //场次id
			const venus_id = [venueID];  //场馆id


			if (!seatList || seatList.length == 0) return Message.error("请选择座位");
			const ticketList = seatList[0].ticketList;
			if (!ticketList || ticketList.length == 0) return Message.error("票类列表为空，无法预订");

			//手机号跟联系人都不是必填的，如果用户没填联系人姓名，则ordername默认为“云票务”传给后端，
			//而手机号则传随意字符
			//如果有填写手机号
			if (ordertel) {
				if (ordertel.length != 11 || isNaN(ordertel)) {
					return Message.error("手机号格式错误");
				}
			} else if (payText == "yuyue") { //如果用户选择预约出票提交订单
				return Message.error("预约出票手机号必填");
			}
			if (!ordername) ordername = "云票务现场购票";


			//判断系统设置里面有没有开启现金支付二次确认
			const cash_confirm = setting.data.cash_confirm;
			if ((payText == "crash") && cash_confirm) {
				try {
					await this.$confirm(`请收现金：${this.totalMoney}元`, "确认收现")
				} catch (e) {
					return false;
				}
			}

			let serials_letter = "";  //流水号(开头的英文字字母)
			let serials_number = "";  //流水号(字母后面的数字)
			if (liushui) {
				const prefix = "流水号格式错误，"
				const reg = /^([A-Za-z]+)([-|_])*([0-9]+)$/;
				const _liushui = liushui.match(reg);
				if (!_liushui) return Message.error(prefix + "请以英文字母开头，以数字结尾");
				serials_letter = _liushui[1];
				if (_liushui[2]) serials_letter += _liushui[2];
				serials_number = _liushui[3];
			}

			//标识身份证有误或没填写身份证的座位
			const errorSeats = [];
			//这个在线选座页面，只能单个产品的，所以seat_ids.length只能==1
			const seat_ids = [{}];
			seatList.forEach((seat) => {
				const {selectedTicket, name, idcard} = seat;
				const seatName = seat.seat;
				const {
					tid, tourist_info, pid, p_type, zone_id, ageLimit
				} = selectedTicket;
				ticketsInfo[0] = ticketsInfo[0] || {};
				if (ticketsInfo[0][pid]) {
					ticketsInfo[0][pid].count += 1;
				} else {
					ticketsInfo[0][pid] = {
						count: 1,
						aid: userInfo.member_id
					}
				}

				ticketsInfo[0][pid]["area_id"] = zone_id;
				if (seat_ids[0][pid]) {
					seat_ids[0][pid] = seat_ids[0][pid] + `,${seat.id}`;
				} else {
					seat_ids[0][pid] = seat.id;
				}


				if (tourist_info != 0) {
					const valid = this.checkIDCard(idcard, ageLimit);
					if (!name) {
						errorSeats.push({
							seat: seatName,
							msg: "姓名不能为空"
						})
					} else if (valid.code != 200) { //身份证格式错误或不满足年龄限制
						errorSeats.push({
							seat: seatName,
							msg: valid.msg
						})
					} else {
						//这里因为只可能是单一产品购买，不可能多产品同时购买，所以index写死为0
						idCardInfo[0] = idCardInfo[0] || {}
						if (!idCardInfo[0][tid]) idCardInfo[0][tid] = [];
						idCardInfo[0][tid].push({name, idcard})
					}
				}
			})

			if (errorSeats.length > 0) return Message.error(`身份证信息填写错误：${errorSeats[0].seat} ${errorSeats[0].msg}`);

			//判断身份证是否重复
			if (this.checkIDCardEqual(this.seatList)) return Message.error(`身份证信息重复，请核对无误后再提交`);

			const Force = 0; //0 为正常提交 1不管提交订单中用户是否存在未使用订单
			const submitChannel = this.submitChannel; //7:散客 9：团队购票


			let submitData = {
				account, aid, mid, op,
				ordername, physics_no,
				pid, //据后端说这个pid目前已经没用了
				sapply_did: sapply_did_array,
				lid_arr: lid_array,
				begintime, paymode,
				channel, ordertel, is_member,
				memo, is_sms, approver_id,
				ticketsInfo, idCardInfo,
				round_id, venus_id, seat_ids,
				priceInfo,
				now_check,
				team_province, team_city, team_county,
				serials_letter, serials_number,
				Force,
				submitChannel
			};


			Message.loading("正在提交订单，请稍后...");
			console.log(submitData);
			//const res = await Service.submitOrder(submitData);
			const res = await this.submitOrderData(submitData);

			Message.closeLoading();
			if (!res || res.code != 200) return Message.alert(res.msg);

			//提交订单成功后，即订单已生成，这时上一个页面的已选座位要清空掉
			if (this.fromPage == "ShowOnline") {
				this.$store.dispatch("showSeat_online/updateSelectedList", {type: "empty"})
			}

			const tradeId = res.data.tradeId;
			const orderList = cloneDeep(res.data.data);


			if (payText == 'crash') { //现金支付
				const payOfflineRes = await Service.payOrderOffline({
					ordernum: tradeId,
					total_fee: this.totalMoney * 1000
				});
				if (!payOfflineRes || payOfflineRes.code != 200) return Message.alert(payOfflineRes.msg);
				this.buySuccess({orderList});
			} else if (payText == 'credit') { //授信支付
				this.buySuccess({orderList});
			} else {//在线支付  支付宝或微信
				// this.payText = payText;
				// this.merchantID = userInfo.parent_member_id;
				// this.paycodeDialogShow = true;
				this.openPaycodePop(tradeId, payText).then((payData) => { //支付成功
					this.buySuccess({orderList});
				}).catch((e) => { //支付失败
					Message.alert(`支付失败：${e.toString()}`);
				})

			}
		},


		submitOrderData(submitData) {
			var that = this;
			return new Promise((resolve, reject) => {
				function okOrder() {
					that.PromisesubmitOrderData(submitData).then(res => {
						Message.closeLoading();
						if (!res || res.code != 200) {
							if (res.code == 2300) {
								const h = that.$createElement;
								var idcardArray = new Array();
								var idcardstring = '';
								idcardArray = res.msg.substr(1).split(","); //字符分割
								for (var i = 0; i < idcardArray.length; i++) {
									idcardstring += "<p style='color:teal'>" + idcardArray[i] + "</p>";
								}
								var content = '<p>以下身份证有未使用订单，请在汇总中查询订单详情：</p>' + idcardstring;
								that.$confirm(content, '', {
									title: '购票提示',
									showCancelButton: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									dangerouslyUseHTMLString: true,
								}).then(action => {
									Message.loading("正在提交订单，请稍后...");
									submitData.Force = 1;
									okOrder(submitData);
								}).catch(() => {

								});
							} else {
								resolve(res);
								// that.orderStatus = 400;
								// that.orderStatusText = (res && res.msg) ? res.msg : this.$AJAX_ERROR_TEXT;
							}
						} else {
							resolve(res);
						}
					}).catch(error => {
						reject(error);
					})
				}

				okOrder()
			})

		},


		//回调提交订单
		PromisesubmitOrderData(submitData) {
			return new Promise((resolve, reject) => {
				Service.submitOrder(submitData).then(res => {
					resolve(res);
				}).catch(err => {
					reject(err);
				})
			})
		},


		/**
		 * 购票成功后的接下来流程
		 * @orderList {Array}  成功的订单列表
		 */
		async buySuccess({orderList = []}) {

			this.ordernum = "";
			this.orderList = [];
			this.merchantID = "";
			this.paycode = "";
			this.lastKeydownTime = "";
			this.payText = "";

			this.hasUnlock = true;
			this.loading = false;
			this.closePaycodePop();

			if (!orderList || orderList.length <= 0) return false;

			const settingData = this.$store.state.setting.data;
			//提交身份证信息不打门票
			//id_no_ticket==true时,如果用户有填写身份证则不打印门票
			//id_no_ticket==false时,不管用户有没有填写身份证，打印门票流程按既定的规则走
			const id_no_ticket = settingData.id_no_ticket;
			let ordernumArr = [];
			let lidArr = [];
			let applyDidArr = [];
			orderList.filter((item) => {
				//如果系统设置里设置了提交身份证信息不打门票，
				//并且此订单有填写了身份证,则需要把这个订单过滤掉，不需要打印这个订单
				if (id_no_ticket && item.data.hasIdCard) {
					return false;
				}
				return true;
			}).forEach((order) => {
				const {ordernum, lid, sapply_did} = order.data;
				ordernumArr.push(ordernum);
				lidArr.push(lid);
				applyDidArr.push(sapply_did);
			})

			const ordernum = ordernumArr.join(",");
			const lid = lidArr.join(",");
			const applyDid = applyDidArr.join(",");

			//如果没有订单需要打印，则以下的打印逻辑就不执行
			if (!ordernum) return this.goBack();

			//setting里购票成功后是否询问打印门票
			const isTicketPrint = settingData.ticket_print;
			//setting里购票成功后，是否把搜索项重置到默认状态
			const isTurnToDefault = settingData.tickets_buy_return_tourist_status;

			const msg = (isTicketPrint || !ordernum) ? "购票成功！" : "购票成功！正在为您打印门票，请稍后..";
			Message.success(msg);


			//从setting里取参数，用来判断打印门票前是否要询问用户是否要打印门票
			if (isTicketPrint) {
				Message.confirm("购票成功，是否立即打印门票？", "提示").then((resolve) => {
					setTimeout(() => {
						this.printTicket({type: "1", ordernum, lid, applyDid}).then((res) => {
							Message.success("打印成功");
						}).catch(() => {
						});
						this.goBack();
					}, 1500);

				}).catch(() => {
					this.goBack();
				});
			} else {
				setTimeout(() => {
					this.printTicket({type: "1", ordernum, lid, applyDid}).then((res) => {
						Message.success("打印成功");
					}).catch((e) => {
					});
					this.goBack();
				}, 1500);

			}
		},
		getPrice(item) {
			if (!item) return 0;
			if (!item.selectedTicket) return 0;
			return this.relationId == 0 ? item.selectedTicket.tprice : item.selectedTicket.jsprice;
		},
		async fetchRelationByKeyword(query) {
			this.fetchRelationByKeywordLoading = true;
			const {account, member_id, siteId, siteInfo} = this.$store.state.userInfo;
			let window_property = siteInfo.window_property.split(',');
			let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
			Service.FetchRelationList({account, aid: member_id, siteId, siteType, keyword: query}).then((res) => {
				this.fetchRelationByKeywordLoading = false;
				if (res.code != 200) return false;
				this.relationList = res.data;
			}).catch((error) => {
				this.fetchRelationByKeywordLoading = false;
				Message.error(error.toString())
			});
		},
		//返回到上一页
		goBack() {
			this.hasUnlock = true;
			const {name} = this.$route;
			if (name === "ShowOnline" || name === "ShowPreset") return false;
			this.$router.go(-1);
		},
		//打开扫码支付弹窗
		openPaycodePop(tradeId, payText) {
			const settingData = this.$store.state.setting.data;
			return new Promise((resolve, reject) => {
				this.paycodePopShow = true;
				const {userInfo, setting} = this.$store.state;
				const merchantID = userInfo.parent_member_id;
				const ticketBuy = setting.data.ticket_buy;
				//如果是团单下单要记录操作员，用来报表统计
				const payTrackOpId = setting.data.group_tour == 1 ? userInfo.member_id : "";
				const payType = payText == "alipay" ? 1 : 2;
				const KEYUP_TIME_DISTANCE = this.KEYUP_TIME_DISTANCE;
				const KEY_CODE = ["Tab", "Enter"];
				let paycode = '', prodName = this.prodName;
				let lastKeydownTime = 0;
				if (settingData.mobile_pay_checked === 'barCodeBox') {
					console.log('扫码盒子');
					_UUID++;
					Storage.set(PRINT_UUID_KEY, _UUID);
					Vue.ws.send({cmd: 'scanData', reqid: _UUID, data: [60000]}, res => {
						if (Number(res.code) === 200 && res.data !== null) {
							Message.loading("正在支付，请稍后...");
							const payData = {
								pay_type: payType,
								channel: payType,
								auth_code: res.data.replace(/[\r\n]/g, ''),
								ordernum: tradeId,
								merchant_id: merchantID,
								verify: ticketBuy,
								subject: prodName,
								pay_track_op_id: payTrackOpId
							};
							Service.payOrder(payData).then((res) => {
								Message.closeLoading();
								if (!res || res.code != 200) {
									let msg = "未知错误";
									if (res && res.msg) msg = res.msg;
									reject(new Error(msg));
								} else {
									resolve(payData);
								}
							}).catch((e) => {
								Message.closeLoading();
								reject(e);
							})
						}

					})
				} else {
					this.onKeydown = function (e) {
						//如果是按住了ctrl alt shift meta键，则不做任何处理
						if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return false;
						const now = new Date().getTime();
						if (KEY_CODE.includes(e.code) && paycode) { //触发了tab键或回车链 表示扫码结束
							//扫码成功，会得到一个付款码payCode
							Message.loading("正在支付，请稍后...");

							const payData = {
								pay_type: payType,
								channel: payType,
								auth_code: trim(paycode),
								ordernum: tradeId,
								merchant_id: merchantID,
								verify: ticketBuy,
								subject: prodName,
								pay_track_op_id: payTrackOpId
							};
							Service.payOrder(payData).then((res) => {
								Message.closeLoading();
								if (!res || res.code != 200) {
									let msg = "未知错误";
									if (res && res.msg) msg = res.msg;
									reject(new Error(msg));
								} else {
									resolve(payData);
								}
							}).catch((e) => {
								Message.closeLoading();
								reject(e);
							})
						} else {
							//如果输入的不是数字，也不做处理
							if (e.code.indexOf("Digit") !== 0) return false;
							//如果这次的输入与上一次输入时间间隔大于50毫秒，判定是人为去按了键盘按键，这时应该把之前的paycode清掉
							if (lastKeydownTime > 0 && (now - lastKeydownTime > KEYUP_TIME_DISTANCE)) {
								paycode = "";
								lastKeydownTime = 0;
							} else {
								lastKeydownTime = now;
								paycode += String(e.key);
							}
						}
					}.bind(this);
					document.addEventListener("keydown", this.onKeydown);
				}

			})
		},
		//关闭扫码支付弹窗
		closePaycodePop() {
			//Message.confirm("确定要")
			this.paycodePopShow = false;
			document.removeEventListener("keydown", this.onKeydown);
			_UUID++;
			Storage.set(PRINT_UUID_KEY, _UUID);
			Vue.ws.send({cmd: 'scanDataStop', reqid: _UUID});
		}
	}

}
