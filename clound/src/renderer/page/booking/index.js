import Vue from 'vue';

require('./store');
import * as Service from '@/service';
import allInPay from '@/util/allInPay';
import Message from '@/util/message';
import Storage, { KEY } from '@/util/storage';
import { cloneDeep, trim, debounce } from 'lodash';
import Vuex from 'vuex';
import moment from 'moment';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import travelItinerary from './components/travelItinerary/index';
import pinyinMatch from 'pinyin-match';

const PRINT_UUID_KEY = KEY.PRINT_UUID_KEY;
let _UUID = Storage.get(PRINT_UUID_KEY) || 0;
import './index.scss';

const { mapState, mapActions, mapGetters } = Vuex.createNamespacedHelpers(
	'booking',
);

export default {
	template: require('./index.xtpl'),
	data() {
		return {
			sendPhone: false,
			datePickerOption: {
				disabledDate(time) {
					return (

						time.getTime() <
						new Date().getTime() - 24 * 60 * 60 * 1000

					);
				},
			},
			/**
			 * 订单提交状态(新)
			 * 0   == 还未提交
			 * 100  == 正在提交 loading
			 * 201  == 提交订单成功，正在等待扫码支付
			 * 202  == 提交订单成功，正在支付(在线支付里微信支付、支付宝)loading
			 * 200  == 提交订单成功，支付成功(这一步代表下单跟支付都成功了，即购票成功)
			 * 400  == 整个过程中任务一个环节出错，orderStatus就设为400
			 */
			orderStatus: 0,
			orderStatusPopShow: false,
			//每个状态对应的文字
			orderStatusText: '',
			paycode: '',
			lastKeydownTime: '',
			//两次keyup事件的时间间隔 暂时定50毫秒
			KEYUP_TIME_DISTANCE: 50,
			payMoney: '',
			//标识用户本次提交订单使用的支付方式
			//crash==现金支付  credit==授信   alipay==支付宝  wx==微信  ""==初使状态
			payText: '',
			//下单成功后的订单号，因为扫码付款需要用到，所以需要这里
			ordernum: '',
			//下单成功后的打印发票，所以需要这里
			printOrder: null,
			//下单成功后的打印发票的index，所以需要这里
			printOrderIndex: 0,
			//所购买产品的供应商id
			merchantID: '',
			//记录当前购票方查询字段
			relationQuery: '',
			mainAssnQuery: '',
			changeMoney: '',
			relationText: '',
			recentOrderList: [],
			orderList: [],
			originProps: {
				value: 'area_id',
				label: 'area_name',
				children: '_child',
			},
			townProps: {
				value: 'id',
				label: 'town_name',
			},
			fetchRelationByKeywordLoading: false,
			fetchMainAssnByKeywordLoading: false,
			releationName: '',
			modifyValue: {
				visible: false,
				ordernum: '',
				inputMoney: '',
				inputTitle: '',
				lid: '',
			},
			payTypeDialogs: '',
			//enterStatus: true,//判断enter是否可用
			memberCode: '',
			memberNum: '',
			is_vip: false,
			orderData: [],
			integral: '',
			searchValue: '',
			levelName: '普通游客',
			nickname: '',
			couponValue: 1,
			point: 0,
			inputVisible: false,
			memberDiologVisable: false,
			jifen: '',
			jifenNum: '',
			totalmoney: '',
			pointNum: 0,
			Num: '',
			visibleTicketparty: true,
			pointShow: false,
			IntegralRate: 0,
			shortcutKeysList: {
				keys: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'KEY'],
				keysLetter: ['KEYQ', 'KEYW', 'KEYE', 'KEYR', 'KEYT', 'KEYY', 'KEYU', 'KEYI', 'KEYA', 'KEYS', 'KEYD', 'KEYF', 'KEYG', 'KEYH', 'KEYJ', 'KEYK', 'KEYL', 'KEYZ', 'KEYX', 'KEYC', 'KEYV', 'KEYB', 'KEYN', 'KEYM'],

			},
			//添加旅行社总社相关字段
			mainAssn: '',     //总社
			guideNo: '',      //导游证号
			guideName: '',    //导游姓名
			guideMobile: '',  //导游手机号
			mainAssnList: [], //总社列表
			guideNoList: [],  //导游证列表
			guideNameList: [],//导游姓名列表
			guideMobileList: [],//导游手机号列表
			guideMobileSelectShow: false,
			guideNameSelectShow: false,
			guideNoSelectShow: false,
			guideMobileLoading: false,
			guideNameLoading: false,
			guideNoLoading: false,
			replace_pay: 0,
			posErrTitle: '', //pos支付错误提示
			travelItineraryCode: '',//行程单号
			travelItineraryDetail: '',//行程单详情
			travelItineraryVisible: false,
			travelItineraryInput: { number: '', code: '' }, //行程单手动输入
			travelItinerarySweepCode: true, //是否扫码行程单
		};

	},
	directives: {
		Clickoutside,
	},
	components: {
		travelItinerary,
	},
	beforeRouteEnter(to, from, next) {
		to.meta.keepAlive = from.path !== '/login';
		next(vm => {
			vm.onKeyup = vm.onKeyup.bind(vm);
			vm.onKeydown = vm.onKeydown.bind(vm);
			document.addEventListener('keyup', vm.onKeyup, false);
			document.addEventListener('keydown', vm.onKeydown, false);
			vm.$ws.on('readidcardinfo', (data, e) => {
				/**
				 * 读取系统设置里身份证读卡设置
				 * id_read_type == 0 关闭身份证读卡
				 * id_read_type == 1 采用精伦读卡器
				 * id_read_type == 2 采用新中新读卡器
				 */
				const { id_read_type } = vm.setting.data;
				if (id_read_type == 0) return false;
				Message.success('读取到身份证信息');
				if (data.code == 200) {
					const info = JSON.parse(data.data);
					const idcard = info.Code;
					const name = info.Name;
					if (!idcard) return Message.error('读取不到身份证号码');
					if (!name) return Message.error('读取不到身份证上的姓名');
					vm.enterIDCardInfo({ idcard, name });
				} else {
					Message.error(data.msg || '读取身份证失败');
				}
			});
		});
	},
	beforeRouteLeave(to, from, next) {
		// this.$ws.send({cmd:"close_idcard_reader"});
		this.$ws.off('readidcardinfo');
		document.removeEventListener('keyup', this.onKeyup);
		document.removeEventListener('keydown', this.onKeydown);
		/*this.$store.commit("booking/update_tid", {tid: ""});
		this.$store.commit("booking/update_cart", {cart: []});
		this.$store.commit("booking/update_ticket", {list: []});*/
		next();
	},
	async mounted() {
		await this.loadData();
		this.releationName = this.relationList[0].mid;
		this.relationText = this.relationList[0].dname;
		this.releationName !== '0' && this.getMainAssnList();
		/*const relationList = cloneDeep(this.relationList);
		if (relationList && relationList.filter) {
			this.mainAssnList = relationList.filter((item, index) => {
				if (index == 0 && item.dname == "散客") return false;
				return true;
			})
		}*/

		this.freshRecentOrderList();
		// setTimeout(()=>{
		// 	//获取系统设置里的身份证读卡类型
		// 	const {id_read_type} = this.setting.data;
		// 	//第一次连接上时就启动身份证读卡
		// 	this.$ws.send({cmd:"idread", reqid:"2",idcardType:(typeof id_read_type!=="undefined") ? id_read_type : ""});
		// 	this.$ws.send({cmd:"readprint", reqid:"1000"}, (res) => {
		// 		//当收到ws发回的读取打印机列表
		// 		const error = (text) => `获取打印机名称列表失败，失败原因：${text}`;
		// 		if (!res) return Message.error(error("未知"));
		// 		if (res.code != 200) return Message.error(error(res.msg || "出错"));
		// 		try {
		// 			const data = JSON.parse(res.data);
		// 			if (data && data.length > 0) {
		// 				this.$store.dispatch('updatePrintListAction', data).catch(err => {
		// 					Message.error(err);
		// 				})
		// 			} else {
		// 				Message.error(error("获取数据为空"));
		// 			}
		// 		} catch (e) {
		// 			Message.error(error("转化data数据出错"));
		// 		}
		// 	});
		// },500)

	},
	created() {
		// var that = this;
		// document.onkeydown = function (e) {
		// 	if (!that.enterStatus) {
		// 		return;
		// 	}
		// 	var theEvent = e || window.event;
		// 	var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
		// 	if (code === 13) {
		// 		console.log(document.activeElement)
		// 		if (that.$refs['payInput'].$el.getElementsByTagName('input')[0] === document.activeElement) {
		// 			that.$refs['cashPay'].click()
		// 		} else {
		// 			that.$refs['payInput'].focus()
		// 		}
		// 	}
		// 	return true;
		// };
	},
	destroyed() {
		document.onkeydown = null;
	},
	watch: {
		jifen: function(newVal, oldVal) {
			if (newVal) {
				if (newVal / 100 > 0) {
					// newVal = (newVal-newVal/100);
					newVal = Math.floor(newVal / 100) * 100;
					this.jifen = newVal;
				}
			}
			this.jifenNum = newVal / this.IntegralRate;
			this.totalmoney = ((this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue))).toFixed(2) - this.jifenNum).toFixed(2);
			// console.log(this.Num);
			if (this.totalmoney < 0) {
				this.jifen = '';
				Message.alert('积分使用已超上限，请修改');
				return false;
			}
			if (this.totalmoney < 1) {
				this.point = newVal;
				if (this.totalmoney == 0) {
					return;
				}
				Message.alert('积分使用已达上限');
				this.jifen = this.point;
			} else {
				this.point = this.pointNum;
				this.pointShow = false;
			}
		},
		totalmoney: function(newVal, oldVal) {
			//console.log(newVal);
			// this.totalmoney = (this._subtotal.totalMoney - (this._subtotal.totalMoney*(1-this.couponValue)).toFixed(2)-this.jifenNum).toFixed(2);
		},
		memberCode: function(newVal) {
			if (!this.setting.data.memberSet) return;
			/^1[3-9]\d{9}$/.test(newVal) && this.searchBtn();
		},
		// this.Num = this._subtotal.ticketNum
	},
	updated() {
		if (this.memberCode === '') {
			this.totalmoney = this._subtotal.totalMoney;
		}
	},
	computed: {
		...Vuex.mapState(['pageLoading', 'setting']),
		...mapState([
			'playDate',
			'productID',
			'productList',
			'ticketGroupID',
			'ticketGroupList',
			'relationList',
			'guideList',
			'originList',
			'roundID',
			'venueID',
			'roundList',
			'ticketList',
			'tid',
			'cart',
			'cartAgain',
			'OrderNum',
			'dataAagin',
		]),
		//设置打发票的title

		invoiceTitle: function() {
			return this.printOrder && this.printOrder.length ? '提示(订单号：' + this.printOrder[this.printOrderIndex - 1] + ')' : '提示';
		},
		...mapGetters(['productName', 'roundName', 'ptype']),
		//是否显示票面流水号输入框
		isTicketNoInputShow() {
			const setting = this.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.find((item) => item == 'ticketNumber');
		},
		//是否显示备注输入框
		isMemoInputShow() {
			const setting = this.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.find((item) => item == 'memo');
		},
		//是否显示手机号输入框
		isMobileInputShow() {
			const setting = this.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.find((item) => item == 'mobile');
		},
		_playDate: {
			get() {
				return this.playDate;
			},
			set(date) {
				this.onPlaydateChange(date);
			},
		},
		_subtotal: {
			get() {
				let subtotalText = [];
				let ticketNum = 0;
				let totalMoney = 0;
				this.cart.forEach(prod => {
					prod.ticket.forEach((item) => {
						if (item.count > 0) {
							subtotalText.push(item);
							ticketNum = this.$NP.plus(ticketNum, item.count);
							totalMoney = totalMoney + (item.count * (this.releationName === '0' ? item.tprice : item.jsprice));
						}

					});
				});
				//浮点数精确问题
				totalMoney = this.$NP.strip(totalMoney);
				return { subtotalText, ticketNum, totalMoney };
			},
		},
		_payMoney: {
			set(value) {
				this.payMoney = value;
				this.changeMoney =
					this.$NP.minus(this.payMoney, this._subtotal.totalMoney) > 0
						? this.$NP.minus(
						this.payMoney,
						this._subtotal.totalMoney,
						)
						: 0;
			},
			get() {
				return this.payMoney
					? this.payMoney
					: this._subtotal.totalMoney;
			},
		},
		_changeMoney: {
			set(value) {
				this.changeMoney = value;
			},
			get() {
				return this.$NP.minus(
					this.payMoney,
					this._subtotal.totalMoney,
				) > 0
					? this.$NP.minus(this.payMoney, this._subtotal.totalMoney)
					: 0;
			},
		},
		mobile: {
			set(val) {
				this.$store.commit('booking/update_mobile', { mobile: val });
			},
			get() {
				return this.$store.state.booking.mobile;
			},
		},
		ordername: {
			set(val) {
				this.$store.commit('booking/update_ordername', { ordername: val });
			},
			get() {
				return this.$store.state.booking.ordername;
			},
		},
		tourID: {
			set(val) {
				this.$store.commit('booking/update_tourID', { id: val });
			},
			get() {
				return this.$store.state.booking.tourID;
			},
		},
		guideID: {
			get() {
				return this.$store.state.booking.guideID;
			},
			set(val) {
				console.log(val);
			},
		},
		townID: {
			get() {
				return this.$store.state.booking.townID;
			},

			set(val) {
				this.$store.commit('booking/update_townID', { id: val });
			},
		},
		townList: {
			get() {
				return this.$store.state.booking.townList;
			},
			set(val) {
				console.log(val);
			},
		},
		selectedOrigin: {
			get() {
				return this.$store.state.booking.origin;
			},
			set(val) {
				let that = this;
				if (val) {
					that.$store.commit('booking/update_origin', { origin: val });
					Service.fetchTownList({ superior_id: val[1] }).then(res => {
						if (res.code == 200) {
							if (res.data.length == 0) {
								that.$store.commit('booking/update_townList', { list: [{ id: -1, town_name: '无' }] });
							} else {
								that.$store.commit('booking/update_townList', { list: res.data });
							}
						}
					});
				}
			},
		},
		liushui: {
			set(val) {
				this.$store.commit('booking/update_liushui', { liushui: val });
			},
			get() {
				return this.$store.state.booking.liushui;
			},
		},
		memo: {
			set(val) {
				this.$store.commit('booking/update_memo', { memo: val });
			},
			get() {
				return this.$store.state.booking.memo;
			},
		},
		account() {
			const userInfo = this.$store.state;
			if (userInfo) return userInfo.account;
			return '';
		},
		showGuideSelect() {
			const relationID = this.releationName;
			if (!relationID) return false;
			const setting = this.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.find((item) => item === 'mainAssn') && Number(relationID) !== 0;
		},
		showTravelItinerary() {
			const relationID = this.releationName;
			if (!relationID) return false;
			const setting = this.setting;
			if (!setting) return false;
			const tickets_buy_insert = setting.data.tickets_buy_insert;
			if (!tickets_buy_insert || !Array.isArray(tickets_buy_insert)) return false;
			return tickets_buy_insert.find((item) => item === 'travelItinerary') && Number(relationID) !== 0;
		},
	},
	filters: {
		groupAge(ticket) {
			if (!ticket) return '';
			const max = ticket.group_max_age;
			const min = ticket.group_min_age;
			if (max && min) {
				const maxs = max.split('|');
				const mins = min.split('|');
				const arr = [];
				maxs.forEach((max, index) => {
					const _min = mins[index];
					arr.push(`(${_min}-${max})`);
				});
				return arr.join(' ');
			}
			return '';
		},

	},
	methods: {
		//拼音检索
		pinyinSearch(node, keyword) {
			return pinyinMatch.match(node.text, keyword);
		},
		//行程单操作方法
		travelItineraryClick(type) {
			if (type === 1) {
				let travelItinerarySweepCode = this.travelItinerarySweepCode;
				if (travelItinerarySweepCode && this.$isNull(this.travelItineraryCode)) {
					this.$message.warning('请输入行程单');
					return;
				}
				if (!travelItinerarySweepCode && (this.$isNull(this.travelItineraryInput.number) || this.$isNull(this.travelItineraryInput.code))) {
					this.$message.warning('请输入行程单或验证码');
					return;
				}
				let teamverifycode;
				if (travelItinerarySweepCode) {
					teamverifycode = this.travelItineraryCode;
				} else {
					teamverifycode = this.travelItineraryInput.number + ',' + this.travelItineraryInput.code;

				}
				teamverifycode = teamverifycode.replace(/(^\s*)|(\s*$)/g, '');
				Message.loading('请稍后');
				Service.travelItinerary({ teamverifycode }).then((res) => {
					if (!res) return Message.alert('请求行程单出错！');
					if (res.code !== 200) return Message.alert(res.msg);
					if (res.data) {
						this.travelItineraryDetail = res.data;
					}
				}).catch((e) => {
					console.error(e);
				}).finally(() => {
					Message.closeLoading();
				});
			}
			else if (type === 2) {
				this.travelItineraryDetail = '';
				this.travelItineraryCode = '';
				this.travelItinerarySweepCode = true;
				this.travelItineraryInput = { number: '', code: '' };
			}
			else if (type === 3) {
				this.travelItineraryVisible = !!this.travelItineraryDetail;
			}
			else if (type === 4) {
				this.travelItinerarySweepCode = !this.travelItinerarySweepCode;
			}
		},

		getMainAssnList() {
			let userInfo = this.$store.state.userInfo;
			const { account, member_id } = userInfo
				, aid = member_id
				, did = this.releationName;
			Service.FetchMainAssnList({ account, aid, did }).then((res) => {
				if (!res) return Message.alert('请求总社列表出错！');
				if (res.code !== 200) return Message.alert(res.msg);
				if (res.data && res.data.length) {
					this.mainAssnList = res.data;
					this.mainAssn = res.data[0].mid;
				} else {
					this.mainAssnList = [];
					this.mainAssn = '';
				}

			}).catch((e) => {
				console.error(e);
			});
		},
		onGuideMobileChange: debounce(function() {
			const mobile = trim(this.guideMobile);
			if (mobile.length <= 1) return false;
			this.guideMobileLoading = true;
			Service.queryGuideList({ mobile }).then((res) => {
				if (res.code == 200) {
					this.guideMobileList = res.data.list || [];
				}
			}).catch((e) => {
				console.error(e);
			}).finally(() => this.guideMobileLoading = false);
		}, 200),
		onGuideNameChange: debounce(function() {
			const name = trim(this.guideName);
			if (!name) return false;
			this.guideNameLoading = true;
			Service.queryGuideList({ name }).then((res) => {
				if (res.code == 200) {
					this.guideNameList = res.data.list || [];
				}
			}).catch((e) => {
				console.error(e);
			}).finally(() => this.guideNameLoading = false);
		}, 200),
		onGuideNoChange: debounce(function() {
			const guideNo = trim(this.guideNo);
			if (!guideNo) return false;
			this.guideNoLoading = true;
			Service.queryGuideList({ guideNo }).then((res) => {
				if (res.code == 200) {
					const list = res.data.list || [];
					this.guideNoList = list.filter((item) => !!item.guide_no);
				}
			}).catch((e) => {
				console.error(e);
			}).finally(() => this.guideNoLoading = false);
		}, 200),
		onGuideMobileOptionClick(data) {
			const { name, guide_no, mobile } = data;
			this.guideName = name;
			this.guideNo = guide_no;
			this.guideMobile = mobile;
			this.guideMobileSelectShow = false;
		},
		onGuideNameOptionClick(data) {
			const { name } = data;
			this.guideName = name;
			this.guideNameSelectShow = false;
		},
		onGuideNoOptionClick(data) {
			const { guide_no } = data;
			this.guideNo = guide_no;
			this.guideNoSelectShow = false;
		},
		resetRelation() {
			//重置当前购票方下拉列表
			if (this.relationQuery !== '') {
				this.fetchRelationByKeyword('');
			}
		},
		resetMainAssn() {
			//重置当前购票方下拉列表
			if (this.mainAssnQuery !== '') {
				this.fetchMainAssnByKeyword('');
			}
		},
		onGuideMobileSelectOut() {
			this.guideMobileSelectShow = false;
		},
		onGuideNameSelectOut() {
			this.guideNameSelectShow = false;
		},
		onGuideNoSelectOut() {
			this.guideNoSelectShow = false;
		},
		onGuideSelectFocus(role) {
			const that = this;
			const map = {
				mobile() {
					that.guideMobileSelectShow = true;
				},
				name() {
					that.guideNameSelectShow = true;
				},
				guideNo() {
					that.guideNoSelectShow = true;
				},
			};
			map[role] && map[role]();
		},
		...mapActions([
			'loadData',
			'changeRelation',
			'changeProduct',
			'getTicketGroupList',
			'changePlaydate',
			'changeRound',
			'removeTicket',
			'addCount',
			'minuCount',
			'replaceCount',
			'inputTouristInfo',
			'enterIDCardInfo',
			'checkIDCardAgeLimit',
			'getIDCardArray',
			'addToCart',
			'minuToCart',
			'removeToCart',
			'clearCart',
		]),

		...Vuex.mapActions(['printTicket', 'printInvoice', 'printMergeReceipt', 'printReceipt']),
		//input焦点事件
		inputFocus(event) {
			let current = $(event.target).parent().prev('.flag');
			event.type === 'focus' ? current.addClass('focusColor') : current.removeClass('focusColor');
			if (this.setting.data.memberSet) {
				this.memberCode = this.mobile;
			}
		},
		shortcutKeys(index, type) {
			//这里只匹配票类的筛选
			if (!this.setting.data.shortcutKeys) return '';
			let text;
			if (type === 1) {
				text = this.shortcutKeysList.keysLetter[index];
				if (!text) return '无';
				return text.replace(/KEY/g, '');
			} else {
				text = this.shortcutKeysList.keys[index];
				if (!text) return '';
				return `(${text})`;
			}

		},
		onRelationChange(val) {
			this.releationName = val;
			const relation = this.relationList.find(item => item.mid === val);
			this.relationText = relation.dname;
			this.changeRelation(val);
			if (val === '0') {
				this.visibleTicketparty = true;
			} else {
				this.visibleTicketparty = false;
				this.clearBtn();
				this.getMainAssnList();
				//this.mainAssn = val;
			}
		},
		onProductChange(val) {
			this.changeProduct({ lid: val, relationID: this.releationName });
		},
		onTicketGroupChange(val) {
			this.getTicketGroupList({ ticketGroupID: val, relationID: this.releationName });
		},
		onPlaydateChange(date) {
			this.changePlaydate({ date: date, loading: true, relationID: this.releationName });
		},
		onRoundChange(val) {
			this.changeRound(val);
		},
		onTicketItemClick(e, prodID, tid) {
			this.addToCart({ prodID, tid, count: 1 }).then(() => {
				this.$store.commit('booking/update_tid', { tid: tid });
				const ticketList = cloneDeep(this.ticketList);
				const ticket = ticketList.find((ticket) => ticket.tid == tid);
				if (ticket) {
					ticket.selected = 1;
					this.$store.commit('booking/update_ticket', { list: ticketList });
				}
				this.totalmoney = ((this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue))).toFixed(2) - this.jifenNum).toFixed(2);
				this.point = this.pointNum;
				this.pointShow = false;
				//初始化enter事件
				//this.enterStatus = true;
			}).catch((error) => {
			});
		},
		onAddBtnClick(prodID, tid) {
			this.addToCart({ prodID, tid, count: 1 });
			this.totalmoney = (this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue)).toFixed(2) - this.jifenNum).toFixed(2);

			this.point = this.pointNum;
			this.jifen = 0;
			this.pointShow = false;

		},
		onMinuBtnClick(prodID, tid) {
			this.minuToCart({ prodID, tid, count: 1 });
			this.totalmoney = (this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue)).toFixed(2) - this.jifenNum).toFixed(2);

			this.point = this.pointNum;
			this.jifen = 0;
			this.pointShow = false;

		},
		onDeleteBtnClick(prodID, tid, index) {
			this.removeToCart({ prodID, tid, index });
			this.totalmoney = (this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue)).toFixed(2) - this.jifenNum).toFixed(2);
			this.point = this.pointNum;
			this.jifen = 0;
			this.pointShow = false;

		},
		onClearAllCartBtnClick() {
			if (!this.cart || this.cart.length == 0) return false;
			Message.confirm('确定要清空购物车内容吗？').then(() => {
				this.clearCart();
				this.totalmoney = '';
				this.payMoney = '';
				this.jifen = 0;
			}).catch((e) => {
			});
		},
		onCountInpChange(e, prodID, tid) {
			const target = e.target;
			const valStr = trim(target.value);
			const val = valStr * 1;
			const cart = this.cart || [];
			const prod = cart.find((item) => item.id == prodID);
			if (!prod) return false;
			const ticket = prod.ticket.find((item) => item.tid == tid);
			if (!ticket) return false;
			const oldCount = ticket.count * 1;
			const disCount = oldCount - val;

			if (isNaN(valStr)) {
				target.value = oldCount;
				return Message.error('票数请输入数字');
			}
			if (valStr.indexOf('.') > -1) {
				target.value = oldCount;
				return Message.error('票数请输入整数');
			}
			if (val < 0) {
				target.value = oldCount;
				return Message.error('票数不能为负数');
			}

			// console.log(disCount)

			if (disCount < 0) { //加
				this.addToCart({ prodID, tid, count: Math.abs(disCount) }).catch(() => {
					target.value = oldCount;
				});
			} else if (disCount > 0) { //减
				this.minuToCart({ prodID, tid, count: Math.abs(disCount) }).catch(() => {
					target.value = oldCount;
				});
			}
			this.totalmoney = (this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue)).toFixed(2) - this.jifenNum).toFixed(2);
			this.point = this.pointNum;
			this.jifen = 0;
			this.pointShow = false;

		},
		onNameInpChange(e, prodID, tid, index) {
			const target = e.target;
			const name = trim(target.value);
			this.inputTouristInfo({ prodID, tid, index, name });
		},
		onIDCardInpChange(e, prodID, tid, index) {
			const target = e.target;
			const idcard = trim(target.value);
			this.inputTouristInfo({ prodID, tid, index, idcard }).catch((error) => {
				if (typeof error.idcard !== 'undefined') {
					setTimeout(() => {
						target.value = error.idcard;
					}, 2000);
				}
			});
		},
		getTownList(val) {
			let that = this;
			//console.log(val.length)
			if (val.length == 2) {
				Service.fetchTownList({
					superior_id: val[1],
				}).then(res => {
					if (res.code == 200) {
						that.$store.commit('booking/update_originList', { list: val });
						that.originList.find(item => item.value == val[0]).find(item => item.value == val[1]).children = res.data;

					}
				});
			}

		},
		//点击重打印
		onRePrintBtnClick(ordernum, lid, applyDid) {
			this.printTicket({ type: '2', ordernum, lid, applyDid }).catch((e) => {
				console.log(e);
			});
		},
		// 打印发票
		onInvoicePrintBtnClick(order) {
			this.$set(this.$data, 'modifyValue', {
				visible: true,
				type: 'invoice',
				inputMoney: '',
				inputTitle: '',
				ordernum: order.ordernum,
			});
		},
		// 打印回执单
		onReceiptPrintBtnClick(order) {
			let shopStatus = order.concat_info.concat_id.indexOf(',');
			let merge_receipt = this.setting.data.merge_receipt;
			let that = this;
			if (shopStatus >= 0 && merge_receipt > 0) {
				let num = order.concat_info.concat_tum
					, price = order.concat_info.concat_total_money
					, ordernum = order.concat_info.concat_id.split(',')
					, lid = [];
				let title = `<p>合计人数：${num}人</p><p>合计金额：${price}元</p>`;
				Message.confirm(title, '选择回执单打印模式', {
					confirmButtonText: '购物车订单打印',
					dangerouslyUseHTMLString: true,
					distinguishCancelAndClose: true,
					cancelButtonText: '单笔订单打印',
				}).then(() => {
					this.printMergeReceipt({
						ordernum: ordernum,
						lid: lid,
					});
				}).catch(action => {
					action === 'cancel' && singleReceipt();
				});
			} else {
				singleReceipt();
			}

			//单笔打印
			function singleReceipt() {
				that.$set(that.$data, 'modifyValue', {
					visible: true,
					type: 'receipt',
					inputMoney: '',
					inputTitle: '',
					ordernum: order.ordernum,
					lid: order.lid.id,
				});
			}

		},

		//确认发票/回执单打印
		confirmPrint() {
			if (this.modifyValue.type == 'invoice') {
				this.printInvoice({
					ordernum: this.modifyValue.ordernum,
					inputMoney: this.modifyValue.inputMoney,
					inputTitle: this.modifyValue.inputTitle,
				});
			} else if (this.modifyValue.type == 'receipt') {
				this.printReceipt({
					ordernum: this.modifyValue.ordernum,
					inputMoney: this.modifyValue.inputMoney,
					lid: this.modifyValue.lid,
				});
			}
			this.$set(this.$data.modifyValue, 'visible', false);
		},

		onTrClick(e, ticket) {
			this.$store.commit('booking/update_tid', { tid: ticket.tid });
		},
		onModifyPrice(e, prodID, tid) {
			if (!tid) return false;
			const relationID = this.releationName;
			const cart = cloneDeep(this.cart);
			const prod = cart.find((prod) => prod.id == prodID);
			if (!prod) return Message.error('产品id不匹配');
			const ticket = prod.ticket.find((ticket) => ticket.tid == tid);
			if (!ticket) return Message.error('tid不匹配');
			const price = relationID === '0' ? ticket.tprice * 1 : ticket.jsprice * 1;
			const html = `<div>
				<div>当前售价：${price}<span class="tip">（新单价需大于成本价）</span></div>
				<div class="priceLine">新单价：<input id="yushouPopCon_input" class="yushouPopCon_input" type="number" placeholder="新单价需大于成本价"/></div>
			</div>`;
			Message.confirm(html, '修改单价', {
				dangerouslyUseHTMLString: true,
				closeOnClickModal: false,
				customClass: 'yushouPop_ModifyPrice',
				beforeClose: function(action, instance, done) {
					if (action != 'confirm') return done();
					const input = $('#yushouPopCon_input');
					if (!$.trim(input.val())) return Message.error('请输入新单价');
					const newPrice = $.trim(input.val()) * 1;
					if (newPrice < ticket.cost_price) return Message.error('新单价不能小于成本价');
					done();
				},
			}).then((res) => {
				const input = $('#yushouPopCon_input');
				const newPrice = $.trim(input.val()) * 1;
				if (typeof ticket._modify_origin_price === 'undefined') {
					ticket._modify_origin_price = price;
				}
				if (relationID === '0') {
					ticket.tprice = newPrice;
				} else {
					ticket.jsprice = newPrice;
				}
				this.$store.commit('booking/update_cart', { cart });
			}).catch((e) => {
			});
		},
		onResetPrice(e, prodID, tid) {
			if (!tid) return false;
			const relationID = this.releationName;
			const cart = cloneDeep(this.cart);
			const prod = cart.find((prod) => prod.id == prodID);
			if (!prod) return Message.error('产品id不匹配');
			const ticket = prod.ticket.find((ticket) => ticket.tid == tid);
			if (!ticket) return Message.error('tid不匹配');
			const orignPrice = ticket._modify_origin_price;
			if (relationID === '0') {
				ticket.tprice = orignPrice;
			} else {
				ticket.jsprice = orignPrice;
			}
			this.$store.commit('booking/update_cart', { cart });
		},
		closeStatusPop(code) {
			if (this.orderStatus === 201 || this.orderStatus === 500) {
				_UUID++;
				Storage.set(PRINT_UUID_KEY, _UUID);
				Vue.ws.send({ cmd: 'scanDataStop', reqid: _UUID });
			}
			//this.enterStatus = true;
			this.orderStatusPopShow = false;
			//重新恢复一些相关值到初始状态
			this.orderStatus = 0;
			this.orderList = [];
			this.orderStatusText = '';
			this.paycode = '';
			this.lastKeydownTime = '';
			this.payText = '';
			this.ordernum = '';
			this.merchantID = '';
		},
		//确认是否继续支付
		crossCheck(code) {
			this.orderStatus = 500;
		},
		//再次支付
		payAgain(code) {
			this.orderStatus = 501;
			const cart = this.cartAgain;
			console.log(this.cartAgain);
			this.$store.commit('booking/update_cart', { cart });
			console.log('121');
		},
		//处理快捷键选票
		onKeyup(e) {
			e.stopPropagation();
			e.preventDefault();
			let that = this;
			const key = e.code.toUpperCase();
			console.log(document.activeElement.tagName);
			//防止当前活跃元素是input
			if (!this.setting.data.shortcutKeys || document.activeElement.tagName === 'INPUT') return;
			const keys = this.shortcutKeysList.keys;
			const keysLetter = this.shortcutKeysList.keysLetter;
			const keysIndex = keys.indexOf(key);
			const keysLetterIndex = keysLetter.indexOf(key);
			if (keysIndex === -1 && keysLetterIndex === -1) return false;
			if (keysLetterIndex > -1) {
				if (keysLetterIndex > this.ticketList.length - 1) {
					return;
				}
				this.onTicketItemClick({}, this.productID, this.ticketList[keysLetterIndex].tid);
			} else {
				// let currentPay = document.querySelectorAll('.submitBtn')[keysIndex];
				// currentPay && currentPay.click();
				switch (key) {
					case 'F1':
						that.$store.getters.checkStatus('pay_type', 'cash') && that.onSubmitOrder({}, 1, 'crash');
						break;
					case 'F2':
						that.releationName !== '0' && that.onSubmitOrder({}, 2, 'crash');
						break;
					case 'F3':
						(that.$store.getters.checkStatus('pay_type', 'alipay') || that.$store.getters.checkStatus('pay_type', 'wx') || that.$store.getters.checkStatus('pay_type', 'couldpay')) && that.onSubmitOrder({}, 1, 'alipay');
						break;
					case 'F4':
						that.$store.getters.checkStatus('pay_type', 'tlpos') && that.onSubmitOrder({}, 1, 'tlpos');
						break;
					case 'F5':
						that.$store.getters.navShow('tickets_order_out') && that.onSubmitOrder({}, 1, 'yuyue');
						break;
				}

			}
			/*if (!this.ticketList || this.ticketList.length == 0) return false;
			const ticket = this.ticketList.find((ticket) => ticket.boardKey == key);
			if (!ticket) return false;
			this.addCount({ tid: ticket.tid, count: 1 });*/
		},
		//处理扫描付款码
		async onKeydown(e) {
			console.log('扫码枪');
			const orderStatus = this.orderStatus;
			const KEYUP_TIME_DISTANCE = this.KEYUP_TIME_DISTANCE;
			let paycode = this.paycode;
			console.log('paycode:');
			console.log(paycode);
			let lastKeydownTime = this.lastKeydownTime;
			if (orderStatus != 201) return false;
			console.log(paycode);
			//为xpay支付的提供产品名
			const cart = cloneDeep(this.cart).map((prod) => {
				prod.ticket = prod.ticket.filter((ticket) => ticket.count * 1 >= 1);
				return prod;
			}).filter((prod) => prod.ticket.length > 0);
			let productNameList = cart.map((prod) => {
				return prod.title;
			});
			//如果是按住了ctrl alt shift meta键，则不做任何处理
			if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return false;
			const now = new Date().getTime();
			const KEY_CODE = ['Tab', 'Enter'];
			if (KEY_CODE.includes(e.code) && paycode) { //触发了tab键或回车链 表示扫码结束
				//扫码成功，会得到一个付款码payCode
				const payText = this.payText;
				const payType = payText == 'alipay' ? 1 : 2;
				const ordernum = this.ordernum;
				const merchantID = this.merchantID;
				this.orderStatus = 202;
				const error = (text) => `支付失败，失败原因：${text}`;
				const memberCode = this.memberNum;
				const is_vip = this.is_vip;
				const replace_pay = this.replace_pay;
				try {
					const res = await Service.payOrder({
						pay_type: payType,
						channel: payType,
						auth_code: paycode,
						ordernum: ordernum,
						merchant_id: merchantID,
						memberCode: memberCode,
						is_vip: is_vip,
						subject: productNameList.join(','),
						siteId: this.$store.state.userInfo.siteId,
						replace_pay: replace_pay,
					});
					if (!res || res.code != 200) {
						let msg = '未知错误';
						if (res && res.msg) msg = res.msg;
						this.orderStatus = 500;
						this.orderStatusText = error(msg);
						this.paycode = '';
						return false;
					}
					const productList = this.productList;
					const lid = this.productID;

					const curProd = productList.find((prod) => prod.id == lid);
					const applyDid = curProd.sapply_did;
					this.replace_pay = 0;
					this.paycode = '';
					console.log('最后' + this.paycode);
					this.buySuccess({ ordernum, lid, applyDid, orderList: this.orderList });

				} catch (e) {
					this.closeStatusPop(200);
					Message.alert(error(e));
				}
			} else {
				//如果输入的不是数字，也不做处理
				if (e.code.indexOf('Digit') !== 0) return false;
				//如果这次的输入与上一次输入时间间隔大于50毫秒，也过滤掉，不做处理
				if (lastKeydownTime > 0 && (now - lastKeydownTime > KEYUP_TIME_DISTANCE)) return false;
				lastKeydownTime = now;
				this.paycode += e.key;
				console.log('e.key:');
				console.log(e.key);
			}
		},
		async onRefreshBtnClick(e) {
			const target = $(e.target);
			const orignText = target.html();
			if (target.hasClass('loading')) return false;

			target.addClass('loading').text('刷新中..');
			const result = await this.freshRecentOrderList();
			target.removeClass('loading').html(orignText);
			if (result) Message.success('刷新成功');
		},
		/*
        * @Author: huangzhiyang
        * @Date: 2017-11-15 17:28:58
        * @Last Modified by: huangzhiyang
        * @Last Modified time: 2018-03-011 11:11:55
        *
        * 提交订单
        * 提交给后端的数据字段请参照：PFT_Documents文档，搜索关键字：Terminal_submitOrder
        *
        */
		async onSubmitOrder(e, paymode, payText, replace_pay) {
			//关闭enter事件
			//this.enterStatus = false;
			this.replace_pay = replace_pay;
			const sendPhone = this.sendPhone ? 0 : 1; //云票务上是否发送电子发票短信
			const ticketList = this.ticketList;
			if (!ticketList || ticketList.length === 0) return Message.error('暂无可购买的票类');
			if (!this.cart || this.cart.length === 0) return Message.error('请先选择要购买的票类');
			//过滤掉票数为0的
			const cart = cloneDeep(this.cart).map((prod) => {
				prod.ticket = prod.ticket.filter((ticket) => ticket.count * 1 >= 1);
				return prod;
			}).filter((prod) => prod.ticket.length > 0);
			if (cart.length === 0) return Message.error('票数不能全为0');
			const selectedOrigin = this.selectedOrigin;
			const townID = this.townID;
			if (this.setting.data.tickets_buy_insert.indexOf('touristDestination') > -1 && this.setting.data.originSet && (selectedOrigin.length === 0 || townID.length === 0)) return Message.error('请选择完整的客源地');
			//总价为零时只能现金支付
			if (this.totalmoney == 0) {
				if (payText !== 'crash') {
					Message.alert('总金额为零请走现金支付');
					return false;
				}
			}
			//判断系统设置里面有没有开启现金支付二次确认
			const cash_confirm = this.setting.data.cash_confirm;
			if ((payText == 'crash') && cash_confirm) {
				let result = true;
				try {
					await Message.confirm(`请收现金：${this.totalmoney}元`, '确认收现');
				} catch (e) {
					result = false;
				}
				if (!result) return false;
			}


			const userInfo = this.$store.state.userInfo;
			const account = userInfo.account;
			const curRelationID = this.releationName;
			const aid = userInfo.member_id;
			let mid, submitChannel;
			//7:散客 9：团队购票
			if (curRelationID === '0') {
				mid = userInfo.parent_member_id;
				submitChannel = 7;
			} else {
				mid = curRelationID;
				submitChannel = 9;
			}
			const op = userInfo.member_id;
			const pid = this.productID;
			const token = userInfo.token;
			const is_member = (mid === '' || mid === '0') ? '0' : '1'; //0代表散客，1代表分销商
			const begintime = this.playDate;
			const channel = 4;
			let ordername = this.ordername;
			let ordertel = this.showGuideSelect ? this.guideMobile : this.mobile;
			const memo = this.memo;

			// 团单用的数据
			const guide = this.guideID;
			const tourID = this.tourID;
			const teamInfo = {};
			const siteId = userInfo.siteId;

			//云票务 新增是否发送短信 0 发送 1 不发送
			let is_sms = 1;
			if (this.setting) {
				const tickets_buy_insert = this.setting.data.tickets_buy_insert;
				if (tickets_buy_insert) {
					is_sms = tickets_buy_insert.find((item) => item == 'message') ? 0 : 1;
				}
			}

			const origin = '';  //格式为省市  如 上海黄浦区
			const approver_id = '';  //审批人id
			const physics_no = '';  //物理卡号

			//演出类相关
			const seat_ids = '';


			//手机号跟联系人都不是必填的，如果用户没填联系人姓名，则ordername默认为“云票务”传给后端，
			//而手机号则传随意字符
			//如果有填写手机号
			if (ordertel) {
				if (ordertel.length != 11 || isNaN(ordertel)) {
					return Message.alert('手机号格式错误');
				}
			} else if (payText == 'yuyue') { //如果用户选择预约出票提交订单
				return Message.error('预约出票手机号必填');
			}
			if (!ordername) ordername = '云票务现场购票';


			//判断最后是否可以提交
			let canSubmit = true;
			let canSubmitErrorText = '';
			const sapply_did_array = [];
			const lid_array = []; //景区id
			const priceInfo = [];
			const idCardInfo = [];
			const ticketsInfo = [];
			//演出类相关
			const round_id = [];  //场次id
			const venus_id = [];  //场馆id
			const funOption = this.setting.data ? this.setting.data.option : [];
			const tickets_order_out = funOption.includes('tickets_order_out');
			/**
			 * 判断一个票类下的身份证，是否可以下单
			 * 关于身份证填写的需求是这样的：
			 * 购买某个票类，如果票类属性里设置了需要填写身份证信息，
			 * 平台端、微信端在下单时都是要填写完整才能下单的。但云票务可以跳过这个规则，
			 * 例如，我买了5张成人票，那么我不填写任务身份证直接提交订单，
			 * 但如果我填写了身份证，就要填满5张才行。
			 * 即身份证要么全填，要么全不填
			 */
			const _checkIDCard = (cart) => {
				const idcardList = [];
				cart.forEach((prod) => {
					prod.ticket.forEach((ticket) => {
						if (ticket.tourist_info != 0) {
							ticket.idcardInfo.forEach((info) => {
								idcardList.push(cloneDeep(info));
							});
						}
					});
				});
				if (idcardList.length == 0) return true;
				//全部都填
				const allFilled = idcardList.every((info) => (info.name && info.idcard));
				//全部都不填
				const allNnFilled = idcardList.every((info) => (!info.name && !info.idcard));
				//如果全部都填或全部都不填,都可以提交订单
				if (allFilled || allNnFilled) {
					return true;
				} else {
					return false;
				}
			};

			if (!_checkIDCard(cart)) {
				return Message.error('身份证信息要么全部不填，要么全部填写，请检查');
			}
			let logDetail = [], productNameList = [],coutPtypeH=0;//xpay平台需要产品名
			cart.forEach((prod, index) => {
				if (!canSubmit) return false;
				const { id, sapply_did, ptype, ticket } = prod;
				sapply_did_array.push(sapply_did);
				lid_array.push(prod.id);
				if (prod.ptype == 'H') { //演出类产品要把场次id(round_id)跟场管id(venus_id)加进去
					round_id.push(prod.roundID);
					venus_id.push(prod.venueID);
				} else { //不是演出类产品  默认为空
					round_id.push('');
					venus_id.push('');
				}
				/**
				 * 如果系统设置里开启了预约出票的功能：
				 * 先判断cart里的票，价格有没有被修改，如果被修改了，则只能点击预约出票按钮购票，
				 * 不能现金支付或微信支付宝支付,且提交订单的数据需要加入priceInfo字段，
				 * priceInfo={"tid":count}里面包含的是有修改过价格的票
				 * 如果价格没有被修改过，则允许以任何支付方式购票
				 */
				priceInfo[index] = null;
				if (tickets_order_out) {
					//判断价格有没有被修改过
					ticket.forEach((ticket) => {
						const { tid } = ticket;
						const price = curRelationID === '0' ? ticket.tprice : ticket.jsprice;
						const _price = ticket._modify_origin_price;
						if ((typeof _price !== 'undefined') && (price * 1 !== _price * 1)) {
							const _priceInfo = priceInfo[index] || (priceInfo[index] = {});
							_priceInfo[tid] = price;
						}
					});
				}

				idCardInfo[index] = null;

				//身份证及票数相关逻辑
				prod.ticket.forEach((ticket) => {
					const { count, pid, tid, tourist_info, zone_id, p_type } = ticket;
					const prodItemInfo = ticketsInfo[index] || (ticketsInfo[index] = {});
					const item = prodItemInfo[pid] || (prodItemInfo[pid] = {});
					item['count'] = count;
					item['aid'] = aid;
					if (p_type === 'H') {//演出类产品
						item['area_id'] = zone_id;
						count > coutPtypeH && (coutPtypeH = count);
					}

					if (tourist_info != 0) {
						//如果身份证信息都为空的，那这张票的idcardInfo就不传给后端了
						const list = ticket.idcardInfo.filter((info) => (info.name && info.idcard));
						if (list.length > 0) {
							const _idCardInfo = idCardInfo[index] || (idCardInfo[index] = {});
							_idCardInfo[tid] = cloneDeep(list);
						}
					}
					console.log(ticket);
					let roundName = (prod.roundName || '') + (prod.roundTime || '');

					logDetail.push(`${prod.title}*${ticket.title}${roundName ? '*' + roundName : ''}*${ticket.count}人*${ticket.tprice}元`);
				});
				productNameList.push(prod.title);
			});
			if(coutPtypeH>200){
				return Message.error("选座单笔订单最大人数不得超过200人，请自动排座购票或分笔购票。");
			}
			//如果priceInfo数组里的item不全都是null，就说明某些票的价格被修改过
			//如果价格被修改过，则只能使用预约出票方式购票，
			//如果使用了其它方式购票，则提示错误，不允许下单
			const priceInfoSize = priceInfo.filter((item) => !!item).length;
			if (priceInfoSize > 0 && payText != 'yuyue') {
				canSubmit = false;
				canSubmitErrorText = '含有修改后的价格只能预约出票';
			}


			if (!canSubmit) return Message.error(canSubmitErrorText);

			const memberCode = '';
			const integral = '';
			const is_vip = '';
			const Force = 0; //0 为正常提交 1不管提交订单中用户是否存在未使用订单
			let submitData = {
				account, aid, mid, op,
				ordername, physics_no,
				pid, //据后端说这个pid目前已经没用了
				sapply_did: sapply_did_array,
				lid_arr: lid_array,
				begintime, paymode,
				channel, ordertel, is_member,
				memo, is_sms, origin, approver_id,
				ticketsInfo, idCardInfo,
				round_id, venus_id, seat_ids,
				priceInfo,
				sendPhone,
				memberCode,
				siteId,
				is_vip,
				integral,
				Force,
				submitChannel,
			};
			submitData.memberCode = this.memberNum;
			submitData.integral = this.jifen;
			submitData.is_vip = this.is_vip;
			if (this.$store.state.setting.data.tickets_buy_insert.includes('touristDestination')) {
				submitData.team_province = selectedOrigin ? selectedOrigin[0] : '';
				submitData.team_city = selectedOrigin ? selectedOrigin[1] : '';
				submitData.team_county = townID ? (townID[0] == -1 ? '' : townID[0]) : '';
			}

			if (this.$store.state.setting.data.group_tour == 1 && this.releationName !== '0') {
				submitData.is_team = true;
				submitData.team_order = tourID;
				submitData.team_guide = guide;
				submitData.teamInfo = teamInfo;
			}

			if (paymode == 2) {
				submitData.verify = this.$store.state.setting.data.ticket_buy;
			}

			//从系统设置里取出买即验参数，带到下单接口里传给后端
			const { ticket_buy } = this.setting.data;
			submitData['now_check'] = ticket_buy;

			//添加旅行社总社相关提交字段(共4个字段)
			if (this.showGuideSelect) {
				const mainAssn = this.mainAssn;
				const guideMobile = trim(this.guideMobile);
				const guideName = trim(this.guideName);
				const guideNo = trim(this.guideNo);
				// if(!guideMobile) return Message.error("请填写导游手机号");
				// if(!guideName) return Message.error("请填写导游姓名");
				// if(!guideNo) return Message.error("请填写导游证号");
				Service.addGuide({ name: guideName, mobile: guideMobile, guideNo });
				//添加总社字段
				submitData['main_assn'] = mainAssn;
				//添加导游电话跟联系人、导游证号
				submitData['guide_mobile'] = guideMobile;  //导游电话
				submitData['guide_name'] = guideName;      //导游姓名
				submitData['guide_no'] = guideNo;          //导游证号
			}
			//添加行程单编号
			if (this.showTravelItinerary && !this.$isNull(this.travelItineraryDetail)) {
				submitData['travelId'] = this.travelItineraryDetail.travel_id;
				if (this._subtotal.ticketNum < this.travelItineraryDetail.team_num) {
					let result = true;
					try {
						await Message.confirm(`团队人数${this.travelItineraryDetail.team_num}人，当前购票人数（${this._subtotal.ticketNum}人）小于团队人数，是否确认提交`, '行程单确认');
					} catch (e) {
						result = false;
					}
					if (!result) return false;
				}
			}

			// console.log(this.selectedOrigin);
			// console.log(submitData);
			// return false;


			/**
			 * 订单提交状态(新)
			 * 0   == 还未提交
			 * 100  == 正在提交 loading
			 * 201  == 提交订单成功，正在等待扫码支付
			 * 202  == 提交订单成功，正在支付(在线支付里微信支付、支付宝)loading
			 * 200  == 提交订单成功，支付成功(这一步代表下单跟支付都成功了，即购票成功)
			 * 400  == 整个过程中任何一个环节出错，orderStatus就设为400
			 */

			this.payTypeDialogs = payText;
			this.orderStatusPopShow = true;
			this.orderStatus = 100;
			let res = null;
			if (payText === 'yuyue') {
				submitData.memo = '预约订单';
			}
			//插入本地下单操作记录
			this.$dbs('log').then(db => {
				let logData = {
					ordername: submitData.ordername,
					relationText: this.relationText,
					payText: payText,
					totalMoney: this.totalmoney,
					ordertel: submitData.ordertel,
					productName: this.productName,
					detail: logDetail,
					begintime: submitData.begintime,
				};
				db.insert(logData, function(err, docs) {
					console.log(docs);
				});
			});
			if (this.replace_pay) {
				res = this.dataAagin;
			} else {
				try {
					res = await this.submitOrderData(submitData);
				} catch (e) {
					console.log(e);
					return false;
				}
			}
			this.$store.commit('booking/update_res', { res: res });
			//submitData.mid = '0';
			//submitData.is_member = "0";
			if (!res || res.code != 200) {
				this.orderStatus = 400;
				this.orderStatusText = (res && res.msg) ? res.msg : this.$AJAX_ERROR_TEXT;
				return false;
			}

			if (payText == 'yuyue') {
				this.closeStatusPop(200);
				const ticketList = cloneDeep(this.ticketList);
				ticketList.forEach((ticket) => (ticket.selected = 0));
				this.$store.commit('booking/update_tid', { tid: '' });
				this.$store.commit('booking/update_cart', { cart: [] });
				this.$store.commit('booking/update_ticket', { list: ticketList });
				Message.alert('预约出票成功！');
				//setting里购票成功后，是否把搜索项重置到默认状态
				const isTurnToDefault = this.setting.data.tickets_buy_return_tourist_status;
				let window_property = userInfo.siteInfo.window_property;
				if (window_property.indexOf('2') > -1 && isTurnToDefault && this.releationName !== '0') {//切换回散客
					this.changeRelation('0');
				}
				this.changePlaydate({ date: moment().format('YYYY-MM-DD'), relationID: this.releationName });
				return;
			}


			let ordernum = res.data.tradeId;
			if (this.replace_pay == 1) {
				console.log('666');
				ordernum = this.OrderNum;
			}
			this.$store.commit('booking/update_ordernum', { orderNum: ordernum });
			const orderList = res.data.data;

			//把orderList存入data
			this.orderList = orderList;
			this.ordernum = ordernum;
			const totalMoney = this._subtotal.totalMoney;
			const orderTel = orderList[0]['data']['ordertel'];
			const SendPhone = orderList[0]['data']['sendPhone'];
			const membercode = submitData.memberCode;
			const isvip = submitData.is_vip;
			// const lid = curProd.id;
			// const applyDid = curProd.sapply_did;
			if (payText == 'crash') { //现金支付
				let payOfflineRes;
				try {
					payOfflineRes = await this.changeOrderStatus({
						ordernum,
						total_fee: totalMoney * 1000,
						orderTel,
						SendPhone,
						memberCode: membercode,
						is_vip: isvip,
						siteId: siteId,
					});
				} catch (e) {
					console.log(e);
					return false;
				}
				/**
				 * 成功时
				 * payOfflineRes = {
				 *   code : 200,
				 *   data : {
				 *      "1238231231" : { //订单号
				 *          code : 200,
				 *          msg : ""
				 *      },
				 *      "18472232" : { //订单号
				 *          code : 400,
				 *          msg : "失败原因"
				 *      }
				 *   }
				 * }
				 *
				 * 失败时
				 * payOfflineRes = {
				 *    code : 300 (非200，具体看后端返回)
				 *    msg : "失败原因"
				 * }
				 *
				 */
				if (!payOfflineRes || payOfflineRes.code != 200) {
					this.orderStatus = 400;
					this.orderStatusText = payOfflineRes ? (payOfflineRes.msg || this.$AJAX_ERROR_TEXT) : this.$AJAX_ERROR_TEXT;
					return false;
				}
				this.buySuccess({ orderList });
			} else if (payText == 'credit') { //授=信支付
				this.buySuccess({ orderList });
			} else if (payText == 'tlpos') {
				this.$store.commit('booking/again_cart', { againCart: this.cart });
				this.orderStatus = 201;
				this.payText = payText;
				this.merchantID = this.$store.state.userInfo.parent_member_id;
				//let that = this;
				let totalMoney = this.totalmoney;
				let money = [totalMoney, orderList[0].data.ordernum];
				//调起pos支付
				this.PromiseposPay(money, orderList, ordernum, totalMoney);
			} else {//在线支付  支付宝或微信
				this.orderStatus = 201;
				this.payText = payText;
				this.$store.commit('booking/again_cart', { againCart: this.cart });
				this.merchantID = this.$store.state.userInfo.parent_member_id;
				if (this.setting.data.mobile_pay_checked === 'barCodeBox') {
					console.log('扫码盒子');
					_UUID++;
					Storage.set(PRINT_UUID_KEY, _UUID);
					Vue.ws.send({ cmd: 'scanData', reqid: _UUID, data: [60000] }, res => {
						if (Number(res.code) === 200 && res.data !== null) {
							const payText = this.payText;
							const payType = payText == 'alipay' ? 1 : 2;
							const ordernum = this.ordernum;
							const merchantID = this.merchantID;
							this.orderStatus = 202;
							const error = (text) => `支付失败，失败原因：${text}`;
							const memberCode = this.memberNum;
							const is_vip = this.is_vip;
							try {
								Service.payOrder({
									pay_type: payType,
									channel: payType,
									auth_code: res.data.replace(/[\r\n]/g, ''),
									ordernum: ordernum,
									merchant_id: merchantID,
									memberCode: memberCode,
									siteId: siteId,
									is_vip: is_vip,
									subject: productNameList.join(','),
								}).then(res => {
									if (!res || res.code != 200) {
										let msg = '未知错误';
										if (res && res.msg) msg = res.msg;
										this.orderStatus = 400;
										this.orderStatusText = error(msg);
										return false;
									}
									const productList = this.productList;
									const lid = this.productID;
									const curProd = productList.find((prod) => prod.id == lid);
									const applyDid = curProd.sapply_did;

									this.buySuccess({ ordernum, lid, applyDid, orderList: this.orderList });
								});

							} catch (e) {
								this.closeStatusPop(200);
								Message.alert(error(e));
							}
						}

					});
				}
			}

		},

		submitOrderData(submitData) {
			var that = this;
			return new Promise((resolve, reject) => {
				function okOrder() {
					if (submitData.Force === 1) {
						that.orderStatus = 100;
						that.orderStatusPopShow = true;
					}
					that.PromisesubmitOrderData(submitData).then(res => {
						if (!res || res.code != 200) {
							if (res.code == 2300) {
								that.orderStatusPopShow = false;
								const h = that.$createElement;
								var idcardArray = [];
								var idcardstring = '';
								idcardArray = res.msg.substr(1).split(','); //字符分割
								for (var i = 0; i < idcardArray.length; i++) {
									idcardstring += '<p style=\'color:teal\'>' + idcardArray[i] + '</p>';
								}
								var content = '<p>以下身份证有未使用订单，请在汇总中查询订单详情：</p>' + idcardstring;
								Message.confirm(content, '购票提示', {
									showCancelButton: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									dangerouslyUseHTMLString: true,
								}).then(action => {
									submitData.Force = 1;
									okOrder();
								}).catch((err) => {
									reject(err);
								});
							} else {
								that.orderStatus = 400;
								that.orderStatusText = (res && res.msg) ? res.msg : '请求出错，请稍后重试';
								resolve(res);
							}
						} else {
							that.orderStatusPopShow = true;
							resolve(res);
						}
					}).catch(error => {
						Message.confirm('网络故障，订单提交失败，请重新提交订单', '订单提示', {
							showCancelButton: true,
							confirmButtonText: '确定',
							cancelButtonText: '取消',
						}).then(() => {
							okOrder();
						}).catch(() => {
							that.closeStatusPop(200);
							reject(error);
						});
					});
				}

				okOrder();
			});
		},


		//回调提交订单
		PromisesubmitOrderData(submitData) {
			return new Promise((resolve, reject) => {
				Service.submitOrder(submitData).then(res => {
					resolve(res);
				}).catch(err => {
					reject(err);
				});
			});
		},

		//调起pos支付
		PromiseposPay(money, orderList, ordernum, totalMoney) {
			var that = this;
			this.pospay(money, totalMoney, ordernum).then(res => {
				if (!res || res.code != 200) {
					that.orderStatus = 400;
					that.orderStatusText = res ? (res.msg || that.$AJAX_ERROR_TEXT) : that.$AJAX_ERROR_TEXT;
					return false;
				}
				that.buySuccess({ orderList });
			}).catch(error => {
				console.log(error);
				console.log(this.dataAagin);
				if (error.code === 203) {
					that.closeStatusPop(221);
				} else if (error.code === 202 && error.code === 201) {
					that.closeStatusPop(res.code);
				}
				Message.error(`支付失败，失败原因：${error.msg}`);
				var errMessage = error.msg.split('：');
				var posErrTitle = `${errMessage[1]}`;
				that.orderStatusPopShow = true;
				this.orderStatus = 500;
				this.payText = 'tlpos';
				this.posErrTitle = posErrTitle;
				/*Message.confirm(errTitle, '刷卡失败', {
					confirmButtonText: '确定',
					dangerouslyUseHTMLString: true,
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					that.orderStatusPopShow = true;
					this.orderStatus = 500;
					this.payText = 'tlpos';
					// that.PromiseposPay(money,orderList,ordernum,totalMoney)
				}).catch(() => {
				});*/
			});
		},
		//封装改变订单状态的方法只针对现金支付和pos机支付(1.下单先创建订单2.支付完成更改订单状态)
		changeOrderStatus(data) {
			return new Promise((resolve, reject) => {
				function changeOrder() {
					Service.payOrderOffline(data).then((payOfflineRes) => {
						resolve(payOfflineRes);
					}).catch(() => {
						Message.confirm('网络故障，订单状态更新失败，请手动更新。', '订单提示', {
							showCancelButton: false,
							showClose: false,
							confirmButtonText: '手动更新',
							cancelButtonText: '取消',
						}).then(() => {
							changeOrder();
						}).catch((err) => {
							this.closeStatusPop();
							reject(err);
						});
					});
				}

				changeOrder();
			});

		},
		//封装pos支付
		pospay(money, totalMoney, ordernum) {
			console.log('cart:');
			console.log(this.cart);
			var _this = this;
			return new Promise((resolve, reject) => {
				allInPay({ cmd: 'allinpayPos', data: money }).then(res => {
					if (res.code == 200) {
						_this.changeOrderStatus({
							ordernum,
							total_fee: totalMoney * 100,
							tradeno: res.data,
							siteId: _this.$store.state.userInfo.siteId,
							sorceT: 16,
						}).then(res => {
							if (!res || res.code != 200) {
								resolve({ 'code': 2002, 'msg': res.msg });
								return false;
							}
							resolve({ 'code': 200, 'msg': `支付成功！` });

						}).catch(err => {
								reject({ 'code': 201, 'msg': `${err}` });
							},
						);
					} else {
						reject({ 'code': 202, 'msg': `${msg}` });
					}
				}).catch(err => {
					reject({ 'code': 203, 'msg': `${err}` });
				});
			});
		},

		/**
		 * 购票成功后的接下来流程
		 * @orderList {Array}  成功的订单列表
		 */
		async buySuccess({ orderList = [] }) {
			this.changePlaydate({ date: moment().format('YYYY-MM-DD'), relationID: this.releationName });
			const ticketList = cloneDeep(this.ticketList);
			ticketList.forEach((ticket) => (ticket.selected = 0));
			this.$store.commit('booking/update_tid', { tid: '' });
			this.$store.commit('booking/update_ticket', { list: ticketList });
			//清空pos支付错误信息
			if (this.posErrTitle) {
				this.posErrTitle = '';
			}
			this.clearBtn();
			//清空找零参数
			this.setting.data.changeMoney === 1 && (this.payMoney = '');
			// 清空手机号和取票人
			this.$store.commit('booking/update_mobile', { mobile: '' });
			this.$store.commit('booking/update_ordername', { ordername: '' });
			this.$store.commit('booking/update_memo', { memo: '' });
			this.$store.commit('booking/update_liushui', { liushui: '' });
			this.$store.commit('booking/update_origin', { origin: [] });
			this.$store.commit('booking/update_townID', { id: [] });
			//清空总社导游信息
			if (this.showGuideSelect) {
				this.mainAssn = '';   //总社
				this.guideNo = '';     //导游证号
				this.guideName = '';    //导游姓名
				this.guideMobile = ''; //导游手机号
			}
			//清空行程单信息
			this.showTravelItinerary && this.travelItineraryClick(2);
			if (!orderList || orderList.length <= 0) return false;

			//提交身份证信息不打门票
			//id_no_ticket==true时,如果用户有填写身份证则不打印门票
			//id_no_ticket==false时,不管用户有没有填写身份证，打印门票流程按既定的规则走
			const id_no_ticket = this.setting.data.id_no_ticket;
			//ordernum="1231231,12313123,12312313";
			//lid="112,35,6958,32484,154";
			//applyDid="112,35,6958,32484,154"
			let ordernumArr = [];
			//发票打印的订单
			let printInvoiceOrder = [];
			let lidArr = [];
			let applyDidArr = [];
			orderList.forEach((order) => {
				//如果系统设置里设置了提交身份证信息不打门票，
				//并且此订单有填写了身份证,则需要把这个订单过滤掉，不需要打印这个订单
				if (!(id_no_ticket && order.data.hasIdCard)) {
					const { ordernum, lid, sapply_did } = order.data;
					ordernumArr.push(ordernum);
					lidArr.push(lid);
					applyDidArr.push(sapply_did);
				}
				order.data.is_print_invoice === '0' && printInvoiceOrder.push(order.data.ordernum);
			});
			//发票打印的订单
			this.printOrder = printInvoiceOrder;
			const ordernum = ordernumArr.join(',');
			const lid = lidArr.join(',');
			const applyDid = applyDidArr.join(',');

			//setting里购票成功后是否询问打印门票
			const isTicketPrint = this.setting.data.ticket_print;
			const mainAssnSearch = this.setting.data.mainAssnSearch;
			//setting里购票成功后，是否把搜索项重置到默认状态
			const isTurnToDefault = this.setting.data.tickets_buy_return_tourist_status;

			//setting里购票成功是否需要打印发票
			const isTicketBuyPrint = this.setting.data.ticket_buy_print;

			const msg = (isTicketPrint || !ordernum) ? '购票成功！' : '购票成功！正在为您打印门票，请稍后..';
			Message.success(msg);
			//下单成功后清空store里的cart列表
			this.$store.commit('booking/update_cart', { cart: [] });
			this.closeStatusPop(200);

			//下单成功后如果马上去查订单，后端可能会有延迟
			setTimeout(() => {
				this.freshRecentOrderList();
			}, 1000);
			let window_property = this.$store.state.userInfo.siteInfo.window_property;
			if (window_property.indexOf('2') > -1 && isTurnToDefault && this.releationName !== '0') {
				//切换回散客
				this.releationName = '0';
				this.relationText = '散客';
				this.changeRelation('0');
			}
			if (mainAssnSearch === 1) {
				this.mainAssnList = [];
				this.mainAssn = '';
				this.getMainAssnList();
			}

			/*//打印发票
			if (isTicketBuyPrint) {
				this.printInvoiceList()
			} else {
				//如果未开启自动打印发票就清空当前打印发票队列
				this.printOrder = null
			}*/
			//如果没有订单需要打印，则以下的打印逻辑就不执行
			//if (!ordernum) return false;

			//从setting里取参数，用来判断打印门票前是否要询问用户是否要打印门票
			if (ordernum) {
				if (isTicketPrint) {
					Message.confirm('购票成功，是否立即打印门票？', '提示').then((resolve) => {
						//setTimeout(() => {
						this.printTicket({ type: '1', ordernum, lid, applyDid }).catch((e) => {
						});
						//}, 3000);
					}).catch(() => {
					});
				} else {
					//setTimeout(() => {
					this.printTicket({ type: '1', ordernum, lid, applyDid }).then((res) => {
						console.log(res);
						Message.success('打印成功');
					}).catch((e) => {
					});

					//}, 3000);
				}
			}

			//打印发票
			if (isTicketBuyPrint) {
				this.printInvoiceList();
			} else {
				//如果未开启自动打印发票就清空当前打印发票队列
				this.printOrder = null;
			}

		},
		// 依次打印发票
		printInvoiceList(index) {
			//判断是自动打印还是单个打印
			if (!this.printOrder || this.printOrder.length === this.printOrderIndex) {
				this.printOrder = null;
				this.printOrderIndex = 0;
				return;
			}
			this.$set(this.$data, 'modifyValue', {
				visible: true,
				type: 'invoice',
				inputMoney: '',
				inputTitle: '',
				ordernum: this.printOrder[this.printOrderIndex],
			});
			this.$nextTick(function() {
				this.$refs.invoiceInput.focus();
			});
			this.printOrderIndex = this.printOrderIndex + 1;
		},
		/**
		 * 更新最新购票模块
		 */
		async freshRecentOrderList() {
			const { account } = this.$store.state.userInfo;
			const res = await Service.queryOrderList({
				account,
				action: 4,
				page: 1,
				size: 10,
				time_type: 0,
				is_ten: true,
				search_type: 3,
			});
			if (!res) {
				Message.error('请求最新订单信息出错');
				return false;
			}
			if (res.code != 200) {
				Message.error(res.msg || '请求最新订单信息出错');
				return false;
			}

			//按购物车归类订单
			function groupBy(array, f) {
				let groups = {};
				array.forEach(function(o) {
					let group = JSON.stringify(f(o));
					groups[group] = groups[group] || [];
					groups[group].push(o);
				});
				return Object.keys(groups).map(function(group) {
					return groups[group];
				});
			}

			Storage.set(KEY.RECENT_ORDER, JSON.stringify(res.data.list));
			this.recentOrderList = groupBy(res.data.list, function(item) {
				return [item.concat_info.concat_id];
			});
			return res.data.list;
		},
		async fetchRelationByKeyword(query) {
			this.fetchRelationByKeywordLoading = true;
			const { account, member_id, siteId, siteInfo } = this.$store.state.userInfo;
			let window_property = siteInfo.window_property.split(',');
			let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
			//记录当前查询关键字判断是否需要重置购票方列表
			this.relationQuery = query;
			const res = await Service.FetchRelationList({ account, siteId, siteType, aid: member_id, keyword: query });
			this.fetchRelationByKeywordLoading = false;
			if (res.code != 200) return false;
			this.$store.commit('booking/update_relationList', { list: res.data });
		},
		async fetchMainAssnByKeyword(query) {
			this.fetchMainAssnByKeywordLoading = true;
			const { account, member_id, siteId, siteInfo } = this.$store.state.userInfo;
			let window_property = siteInfo.window_property.split(',');
			let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
			//记录当前查询关键字判断是否需要重置总社列表
			this.mainAssnQuery = query;
			const res = await Service.FetchRelationList({ account, siteId, siteType, aid: member_id, keyword: query });
			this.fetchMainAssnByKeywordLoading = false;
			if (res.code != 200) return false;
			this.mainAssnList = res.data || [];
		},
		//使用积分input触发显示
		showInput() {
			this.inputVisible = true;
			this.$nextTick(_ => {
				this.$refs.saveTagInput.$refs.input.focus();
			});
		},
		//会员信息查询
		async searchBtn() {
			const mobile = this.memberCode;
			const req = await Service.getIntegralRate({});
			this.IntegralRate = req.data.proportion;
			// console.log(mobile)
			if (mobile !== '') {
				if (!this.checkPhone(mobile)) return;
				const res = await Service.getMemberCode({ mobile: mobile });
				// console.log(res)
				if (!res || res.status !== 200) {
					//Message.error(res ? res.message : '会员信息不存在');
					this.clearBtn(true);
					return false;
				}
				const memberCode = res.data.memberCode;
				//存会员码
				this.memberNum = memberCode;
				if (memberCode) {
					this.is_vip = true;
				} else {
					this.is_vip = false;
				}
				// const recode =await Service.getMemberInfo({memberCode: memberCode});
				if (res.data !== '') {
					this.memberDiologVisable = true;
				}
				this.levelName = res.data.levelName;
				this.nickname = res.data.nickname;
				this.ordername = this.nickname;
				this.mobile = mobile;
				const rights = await Service.getRightsInterests({ memberCode: memberCode });
				const Point = await Service.getpoint({ memberCode: memberCode });
				this.couponValue = rights.data[0].couponValue;
				this.point = Point.data.point;
				this.pointNum = Point.data.point;
				this.totalmoney = (this._subtotal.totalMoney - (this._subtotal.totalMoney * (1 - this.couponValue)).toFixed(2) - this.jifenNum).toFixed(2);
				this.point = this.pointNum;
				this.pointShow = false;
			} else {
				Message.error('请输入手机号');
			}

		},
		//清除会员信息
		async clearBtn(retain) {
			this.memberNum = '';
			this.levelName = '普通游客';
			this.nickname = '';
			this.couponValue = 1;
			this.point = 0;
			this.pointNum = 0;
			this.inputVisible = false;
			this.memberDiologVisable = false;
			this.is_vip = false;
			this.jifen = 0;
			this.jifenNum = 0;
			this.totalmoney = 0;
			this.ordername = '';
			if (!retain) {
				this.mobile = '';
				this.memberCode = '';
			}
			//this._subtotal.totalMoney = 0;
			//this._subtotal.subtotalText = [];
			//this.clearCart();
		},
		//验证手机号
		checkPhone(phone) {
			if (!(/^1[3-9]\d{9}$/.test(phone))) {
				Message.error('手机号码有误，请重填');
				return false;
			}
			return true;
		},
	},
};
