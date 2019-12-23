import moment from 'moment';
import store from '@/store';
import * as Service from '@/service';
import Message from '@/util/message';
import fetchTicketAndRound from './fetchTicketAndRound';
import { isArray, isPlainObject, cloneDeep } from 'lodash';
import checkAgeLimit from '@/util/idcard-age-limit';
import ValidateRule from '@/util/validateRule';


const today = moment().format('YYYY-MM-DD');

/**
 * 取出购物车内所有已填写的身份证
 * @param {array} cart 购物车数组
 * @return {array} 身份证数组
 */
function getIDCardArray(cart) {
	const result = [];
	if (!cart || cart.length == 0) return result;
	cart.forEach((prod) => {
		prod.ticket.forEach((ticket) => {
			ticket.idcardInfo.forEach((info) => {
				const { idcard } = info;
				if (idcard) result.push(idcard);
			});
		});
	});
	return result;
}

/**
 * 校验给定的身份证是否在给定的年龄限制范围内
 * @param {string} idcard  身份证
 * @param {array}  ageLimit  身份证的年龄限制
 * @return {object}
 * {code:200,msg:""} => 校验通过，在年龄限制内
 * {code:0,msg:"错误信息"} => 校验不通过，不在年龄限制内
 */
function checkIDCardInAgeLimit({ idcard, ageLimit }) {
	if (!ageLimit || ageLimit.length == 0) return { code: 200, msg: '' };
	const result = ageLimit.some((limit) => {
		const min = limit.low;
		const max = limit.high;
		return checkAgeLimit({ idcard, ageMin: min, ageMax: max });
	});
	const ageLimitToText = (ageLimit) => ageLimit.map((limit) => {
		return `${limit.low}-${limit.high}周岁`;
	}).join('或');

	return {
		code: result ? 200 : 0,
		msg: result ? '' : `限制游客年龄在 ${ageLimitToText(ageLimit)} 内`,
	};

}

/**
 * 检查给定的身份证在现有购物车内是否可用
 * 按顺序分3步检查：
 * 1、身份证格式是否正确
 * 2、身份证是否重复
 * 3、身份证是否在给定的年龄限制范围内
 * @param  {array}  cart   购物车数组
 * @param  {string} idcard 身份证
 * @param  {string} prodID 产品id
 * @param  {string} tid    票id
 * @return {object}
 *    {code:200,msg:""}    => 身份证在年龄段内，校验通过
 *  {code:0,msg:"错误"}   => 身份证格式正确，且不重复，但不在年龄段内，校验不通过
 *  {code:-1,msg:"错误"}  => 其它错误，校验不通过
 */
function validIDCardAvaibable({ cart, prodID, tid, idcard }) {

	if (!cart || cart.length == 0) return { code: -1, msg: 'cart参数有误' };
	if (!prodID) return { code: -2, msg: 'prodID参数有误' };
	if (!tid) return { code: -3, msg: 'tid参数有误' };
	if (!idcard) return { code: -4, msg: 'idcard参数有误' };

	//判断格式是否正确
	const valid = ValidateRule.idcard(idcard);
	if (!valid.isOk) return { code: -5, msg: valid.errMsg };
	//判断是否重复
	const idcardArray = getIDCardArray(cart);
	if (idcardArray.includes(idcard)) return { code: -6, msg: '身份证重复，请检查' };

	//判断是否在给定的年龄段内
	const prod = cart.find((item) => item.id == prodID);
	if (!prod) return { code: -2, msg: 'prodID参数有误' };
	const ticket = prod.ticket.find((item) => item.tid == tid);
	if (!ticket) return { code: -3, msg: 'tid参数有误' };
	const ageLimit = ticket.ageLimit;
	const ageLimitCheck = checkIDCardInAgeLimit({ idcard, ageLimit });
	return {
		code: ageLimitCheck.code == 200 ? 200 : -7,
		msg: ageLimitCheck.code == 200 ? '' : `【${ticket.title}】${ageLimitCheck.msg}`,
	};

}

/**
 * 获取一个票类列表里，在指定分组里年龄限制符合传入的身份证的
 * @param {array}  ticketList  票类列表
 * @param {string} groupID     分组id
 * @param {string} idcard      年龄限制
 */
function getTicketByGroupID({ ticketList, groupID, idcard }) {
	if (!ticketList || ticketList.length == 0) return false;
	let ticketsInGroup = ticketList.filter((ticket) => ticket.group_id == groupID);
	if (ticketsInGroup.length == 0) return false;
	let ticketsInGroupLimit = ticketsInGroup.filter((ticket) => { //过滤出同组里面有年龄限制的
		const { ageLimit } = ticket;
		if (ageLimit && ageLimit.length > 0) {
			if (checkIDCardInAgeLimit({ idcard, ageLimit }).code == 200) {
				return true;
			}
		}
		return false;
	});
	if (ticketsInGroupLimit[0]) return cloneDeep(ticketsInGroupLimit[0]);

	//如果同组里有年龄限制的都不满足条件，则找同组里没有年龄限制的
	let ticketsInGroupNoLimit = ticketsInGroup.filter((ticket) => (!ticket.ageLimit || ticket.ageLimit.length == 0));
	if (ticketsInGroupNoLimit[0]) return cloneDeep(ticketsInGroupNoLimit[0]);

	return false;

}

store.registerModule('booking', {
	namespaced: true,
	state: {
		loading: false,
		relationList: null,
		guideList: [],
		townList: [],
		originList: [],
		guideID: '',
		origin: [],
		townID: [],
		tourID: '',
		productList: [],
		productID: '',
		ticketGroupList: [], //票类分组列表
		ticketGroupID: '',     //票类分组
		today: today,
		playDate: today,
		roundList: null,
		//当前场次id
		roundID: '',
		//当前场管id
		venueID: '',
		ticketList: null,
		//标识当前选中的哪张票
		tid: '',
		//当前选中要购买的所有票类(相当于购物车内的数据)
		mobile: '',
		ordername: '',
		liushui: '',
		memo: '',

		//20180524 huangzhiyang
		//新增购物车功能
		cart: [],
		cartAgain: [],
		OrderNum: 0,
		dataAagin: null,
	},
	getters: {
		//产品名称
		productName(state) {
			const { productList, productID } = state;
			if (!productList || productList.length == 0) return '';
			if (productID === '') return '';
			const product = productList.find(item => item.id === productID);
			if (!product) return '';
			return product.title;
		},
		//场次名称
		roundName(state) {
			const { roundList, roundID } = state;
			if (!roundList || roundList.length == 0) return '暂无场次';
			if (roundID == '') return '暂无场次';
			const round = roundList.find(item => item.id == roundID);
			if (!round) return '暂无场次';
			const { round_name, id, bt, et } = round;
			return `${round_name}（${bt} - ${et}）`;
		},
		ptype(state) {
			const { productList, productID } = state;
			if (!productList || productList.length == 0) return 'A';
			if (productID === '') return 'A';
			const product = productList.find(item => item.id === productID);
			if (!product) return 'A';
			return product.ptype;
		},
	},

	actions: {
		//页面初始化时，加载所需数据
		async loadData({ state, commit, dispatch, rootState }) {

			Message.loading('请稍后');
			const date = state.today;
			//let fid = "0";  //页面初始化时默认为散客，所在这里分销商id为0
			const userInfo = cloneDeep(rootState.userInfo);
			const { account, member_id, parent_member_id, siteId, siteInfo } = userInfo;
			let window_property = siteInfo.window_property.split(',');
			let siteType = window_property.length === 2 ? 3 : Number(window_property[0]);
			let aid = member_id;
			const res = await Promise.all([
				Service.FetchRelationList({ account, aid, siteId, sourceType: 1, siteType }),
				Service.FetchProductListForPerson({ account, aid: parent_member_id, siteId, sourceType: 1 }),
			]);
			const relationRes = cloneDeep(res[0]);
			let prodRes = cloneDeep(res[1]);
			if (!relationRes) return Message.alert('请求购票方数据出错！');
			if (!prodRes) return Message.alert('请求产品列表数据出错！');
			if (relationRes.code != 200) return Message.alert(relationRes.msg);
			//prodRes.code==400代表产品列表数据为空
			if (prodRes.code != 200 && prodRes.code != 400) return Message.alert(prodRes.msg);
			let prodList = prodRes.data.list || [];
			//第一个产品的id
			const firstProd = prodList[0];
			let relationList = relationRes.data;

			if (firstProd) {
				const lid = firstProd.id;
				const ptype = firstProd.ptype;
				let fid = relationList[0].mid || '0';
				let channel = 7;
				if (fid == 0) {//如果是散客  aid传产品列表里的sapply_did  fid传登陆者的主帐号ID
					fid = userInfo.parent_member_id;
					aid = firstProd.sapply_did;
				} else {
					channel = 9;
				}
				const ticketRound = await fetchTicketAndRound({ aid, lid, fid, ptype, date, channel, siteId });
				commit('initPageData', {
					relationList: relationList,
					productList: prodList,
					roundList: ticketRound.roundList,
				});
				dispatch('getTicketGroupList').catch(() => {
				});
				commit('update_ticket', { list: ticketRound.ticketList });
				commit('update_venueID', { id: ticketRound.venueID });
				if (ptype == 'H') {
					commit('update_round', { list: ticketRound.roundList || [] });
				}
				Message.closeLoading();
				if (ticketRound.code !== 200) return Message.alert(ticketRound.msg);

			} else {
				Message.alert('暂无可预订的产品');
				commit('initPageData', {
					relationList: relationList,
					productList: prodList,
				});
				Message.closeLoading();
			}

			// 获取客源地选项
			if (rootState.setting.data.tickets_buy_insert.includes('touristDestination')) {
				const originRes = await Service.fetchSecondLevelArea({});
				if (originRes.code == 200) {
					commit('update_originList', { list: originRes.data });
				}
			}

		},
		//获取票类分组列表
		async getTicketGroupList({ state, commit, dispatch, rootState }, params) {
			let userInfo = rootState.userInfo
				, { parent_member_id } = userInfo, aid = parent_member_id
				, lid = state.productID, ticketGroupList = [];
			if (rootState.setting.data.ticketGroup !== 1) return;
			if (!params) {
				Service.FetchTicketGroupList({ aid, lid }).then((res) => {

					if (!res) return Message.alert('请求票类分组列表出错！');
					if (res.code !== 200) return;
					if (res.data && res.data.length) {
						ticketGroupList = res.data;
					}
					commit('update_ticketGroupList', ticketGroupList);
				}).catch((e) => {
					console.error(e);
				});
			} else {
				Message.loading('请稍后');
				const prod = state.productList.find(item => item.id == lid);
				const userInfo = rootState.userInfo;
				const { account, member_id, parent_member_id, siteId } = userInfo;
				let aid = parent_member_id;
				const date = state.today;
				let fid = params.relationID;
				const ptype = prod.ptype;
				let channel = 9; //团队窗口，购票方为分销商

				commit('update_ticketGroupID', params.ticketGroupID);
				commit('update_ticket', { list: [] });
				if (fid === '0') {
					fid = userInfo.parent_member_id;
					aid = prod.sapply_did;
					channel = 7;
				}
				const ticketRoundRes = await fetchTicketAndRound({
					account,
					aid,
					date,
					lid,
					fid,
					ptype,
					channel,
					siteId,
					groupId: params.ticketGroupID,
				});

				commit('update_loading', false);
				commit('update_ticket', { list: ticketRoundRes.ticketList });

				commit('update_round', { list: ticketRoundRes.roundList });
				commit('update_venueID', { id: ticketRoundRes.venueID });
				if (ticketRoundRes.code != 200) Message.alert(ticketRoundRes.msg);
				Message.closeLoading();
			}

		},
		//切换购票方
		async changeRelation({ state, commit, dispatch, rootState }, fid) {
			const userInfo = cloneDeep(rootState.userInfo);
			const { account, member_id, parent_member_id, siteId } = userInfo;
			let aid = parent_member_id;
			const date = state.today;
			let channel = 9; //团队窗口，购票方为分销商

			Message.loading('请稍后');

			commit('update_playDate', date);
			commit('update_ticket', { list: [] });
			commit('update_cart', { cart: [] });
			commit('update_ticketGroupList', []);

			const prodRes = fid === '0' ?
				await Service.FetchProductListForPerson({ account, aid }) :
				await Service.FetchProductListForDis({ fid, sid: aid });

			if (!prodRes) return Message.error(Message.AJAX_ERROR_TEXT);
			if (prodRes.code != 200 && prodRes.code != 400) return Message.alert(prodRes.msg);
			const prodList = prodRes.data.list;


			//切换分销商时重置一些信息
			commit('update_guideID', { id: '' });
			commit('update_origin', { id: [] });
			commit('update_townID', { id: [] });
			commit('update_tourID', { id: '' });
			commit('update_mobile', { mobile: '' });
			commit('update_ordername', { ordername: '' });


			if (!prodList || prodList.length == 0) {
				Message.closeLoading();
				commit('update_product', { list: [] });
				Message.alert('暂无可预订的产品');
				return;
			}
			//第一个产品的id
			const firstProd = prodList[0];
			const lid = firstProd.id;
			//第一个产品的产品类型 ptype
			const ptype = firstProd.ptype;

			commit('update_product', { list: prodList });
			dispatch('getTicketGroupList').catch(() => {
			});
			if (fid === '0') {//散客
				fid = userInfo.parent_member_id;
				aid = firstProd.sapply_did;
				channel = 7;
			}

			const ticketRoundRes = await fetchTicketAndRound({ aid, date, lid, fid, ptype, channel, siteId });

			Message.closeLoading();

			if (ticketRoundRes.code != 200) return Message.alert(ticketRoundRes.msg);

			commit('update_ticket', { list: ticketRoundRes.ticketList });
			commit('update_round', { list: ticketRoundRes.roundList });
			commit('update_venueID', { id: ticketRoundRes.venueID });


		},
		//切换产品
		async changeProduct({ state, commit, dispatch, rootState, getters }, { lid, relationID }) {
			Message.loading('请稍后');
			const prod = state.productList.find(item => item.id == lid);
			if (!prod) return Message.error('产品id有误');
			const userInfo = cloneDeep(rootState.userInfo);
			const { account, member_id, parent_member_id, siteId } = userInfo;
			let aid = parent_member_id;
			const date = state.today;
			let fid = relationID;
			const ptype = prod.ptype;
			let channel = 9; //团队窗口，购票方为分销商

			commit('update_product_id', lid);
			commit('update_ticket', { list: [] });
			commit('update_ticketGroupList', []);
			dispatch('getTicketGroupList').catch(() => {
			});
			if (fid === '0') {
				fid = userInfo.parent_member_id;
				aid = prod.sapply_did;
				channel = 7;
			}
			const ticketRoundRes = await fetchTicketAndRound({ account, aid, date, lid, fid, ptype, channel, siteId });

			commit('update_loading', false);
			commit('update_ticket', { list: ticketRoundRes.ticketList });

			commit('update_round', { list: ticketRoundRes.roundList });
			commit('update_venueID', { id: ticketRoundRes.venueID });
			if (ticketRoundRes.code != 200) Message.alert(ticketRoundRes.msg);
			Message.closeLoading();
		},
		//切换游玩时间
		async changePlaydate({ state, commit, dispatch, rootState, getters }, { date, loading = false, relationID }) {
			const userInfo = cloneDeep(rootState.userInfo);
			const { account, parent_member_id, siteId } = userInfo;
			let aid = parent_member_id;
			let fid = relationID;
			const ptype = getters.ptype;
			const lid = state.productID;
			let channel = 9; //团队窗口，购票方为分销商

			commit('update_playDate', date);
			loading && Message.loading('请稍后');
			commit('update_ticket', { list: [] });
			commit('update_cart', { cart: [] });
			commit('update_tid', { tid: '' });
			if (fid === '0') {
				const prod = state.productList.find((item) => item.id == lid);
				fid = userInfo.parent_member_id;
				aid = prod.sapply_did;
				channel = 7;
			}
			const ticketRoundRes = await fetchTicketAndRound({ account, aid, date, lid, fid, ptype, channel, siteId });
			loading && Message.closeLoading();

			commit('update_ticket', { list: ticketRoundRes.ticketList });
			commit('update_round', { list: ticketRoundRes.roundList });
			commit('update_venueID', { id: ticketRoundRes.venueID });
			if (ticketRoundRes.code != 200 && ticketRoundRes.code != 400) Message.alert(ticketRoundRes.msg);

		},
		//切换场次
		changeRound({ state, commit, dispatch, rootState }, id) {
			const roundList = cloneDeep(state.roundList);
			const ticketList = cloneDeep(state.ticketList);
			if (!roundList || roundList.length == 0 || !ticketList || ticketList.length == 0) return false;
			const round = roundList.find(item => item.id == id);
			if (!round) return false;
			//areaStorage = "2218,37|2219,36|2220,36"
			const areaStorage = round.area_storage.split('|');
			ticketList.forEach((item) => {
				const zoneID = item.zone_id;
				if (zoneID == 0) return false;
				areaStorage.forEach((storageItem) => {
					const _item = storageItem.split(',');
					const zone_id = _item[0];
					const storage = _item[1];
					if (zone_id == zoneID) {
						item.storage = storage;
					}
				});
				if (typeof item.selected != 'undefined') item.selected = 0;
			});

			commit('update_round_id', { id });
			commit('update_ticket', { list: ticketList });

			dispatch('removeToCart', { prodID: state.productID }).catch(() => {
			});

		},


		//身份证读卡录入身份证号及姓名
		enterIDCardInfo({ state, commit, dispatch, getters, rootState }, { idcard, name }) {


			const tid = state.tid;
			if (!tid) return Message.error('请先指定要录入身份信息的票');
			let cart = cloneDeep(state.cart);
			if (!cart || cart.length == 0) return Message.error('请先指定要录入身份信息的票');
			let prod = cart.find((prod) => prod.ticket.find((ticket) => ticket.tid == tid));
			let ticket = prod.ticket.find((ticket) => ticket.tid == tid);
			if (!ticket) return Message.error('tid不匹配');

			const needID = ticket.tourist_info;
			const groupID = ticket.group_id;
			if (needID == 0) return Message.error(`${ticket.title}不需要填写身份信息`);
			const ageLimit = ticket.ageLimit;
			//首先判断身份证是否重复
			const idcardArray = [];
			prod.ticket.forEach((ticket) => {
				if (ticket.tourist_info == 2) {
					ticket.idcardInfo.forEach((info) => {
						if (info.idcard) {
							idcardArray.push(info.idcard);
						}
					});
				}
			});
			if (idcardArray.length > 0 && idcardArray.includes(idcard)) {
				return Message.error('此身份证已存在，请更换');
			}

			const isInAgeLimit = checkIDCardInAgeLimit({ idcard, ageLimit: ticket.ageLimit });

			//如果身份证不重复，接着判断要录入的目标票类是否有年龄限制
			//如果目标票类不限制购买的年龄段 或者(票类有限制购买年龄，但刚好所刷的身份证就在此年龄段内)
			if (!ageLimit || ageLimit.length == 0 || isInAgeLimit.code == 200) {
				if (needID == 1) {
					ticket.idcardInfo = [{ name, idcard }];
					if (ticket.count == 0) ticket.count = 1;
					commit('update_cart', { cart });
				} else {
					let idcardInfo = ticket.idcardInfo;
					//看看有没有姓名跟身份证两个都没填的
					let bothBlank = idcardInfo.find(item => (!item.idcard && !item.name));
					if (bothBlank) {
						bothBlank.idcard = idcard;
						bothBlank.name = name;
						if (ticket.count == 0) ticket.count = 1;
					} else {
						//加之前要先判断是否超出库存
						if (ticket.storage != -1 && ticket.storage < ticket.count + 1) {
							return Message.error('库存不足');
						}
						idcardInfo.unshift({ idcard, name });
						ticket.count = ticket.count + 1;
					}
					commit('update_cart', { cart });
				}
			} else { //如果目标票类有限制购买的年龄段 但所刷的身份证年龄不在限制的年龄段内

				//首先判断目标票类是否有分组
				//如果是没分组的，就提示用户年龄段不符合，其它的什么都不做
				//如果有分组，再查找对应分组里，是否有票类的年龄段符合所刷身份证
				//如果有符合的，就把身份证写到符合的票里，如果都不符合，就提示用户

				//如果没有分组
				if (groupID == 0) return Message.error('此身份证对应的年龄不符合该票类的购买年龄要求');

				//如果有分组
				let t = getTicketByGroupID({
					ticketList: prod.id == state.productID ? state.ticketList : prod.ticket,
					groupID, idcard,
				});
				if (!t) return Message.error('此身份证对应的年龄不符合该票类的购买年龄要求');

				ticket = prod.ticket.find((ticket) => ticket.tid == t.tid);
				if (ticket) {//如果找出来的这张票刚好就在cart里
					const idcardInfo = ticket.idcardInfo;
					const bothBlank = idcardInfo.filter((info) => (!info.name && !info.idcard));
					if (bothBlank[0]) {//如果有存在身份证跟姓名都留空的
						bothBlank[0]['name'] = name;
						bothBlank[0]['idcard'] = idcard;
						if (ticket.count == 0) ticket.count = 1;
					} else {
						//加之前要先判断是否超出库存
						if (ticket.storage != -1 && ticket.storage < ticket.count + 1) {
							return Message.error('库存不足');
						}
						idcardInfo.unshift({ idcard, name });
						ticket.count = idcardInfo.length;
					}
				} else {
					//加之前要先判断是否超出库存
					if (t.storage = 0) {
						return Message.error('库存不足');
					}
					t['idcardInfo'] = [{ idcard, name }];
					t['count'] = 1;
					prod.ticket.unshift(t);
				}

				commit('update_cart', { cart });

			}
		},
		/**
		 * 将某个产品下的某个票类添加到购物车
		 * @param {string} prodID   产品id
		 * @param {string} tid      票id
		 * @param {number} count    要添加到购物车的票数
		 * @param {string} idcard   游客身份证(如果需要填写的话)
		 * @param {string} name     游客姓名(如果需要填写的话)
		 */
		addToCart({ state, commit, dispatch, getters, rootState }, { prodID, tid, count = 1 }) {
			//console.log(state.roundList);
			return new Promise((resolve, reject) => {
				const cart = cloneDeep(state.cart);
				let prod = cart.find((item) => item.id == prodID);
				let errorMsg = '';
				if (!prod) {
					let curProd = state.productList.find((item) => item.id == prodID);
					prod = {
						id: prodID,
						ptype: curProd.ptype,
						title: curProd.title,
						sapply_did: curProd.sapply_did,
						ticket: [],
					};
					if (curProd.ptype == 'H') {
						if (!state.roundList || state.roundList.length == 0) {
							errorMsg = `当天暂无场次安排`;
							Message.error(errorMsg);
							return reject(errorMsg);
						}
						const venueID = state.venueID;
						const roundID = state.roundID;
						//console.log("roundID",roundID)
						const curRound = state.roundList.find((item) => item.id == roundID);
						const roundName = curRound.round_name;
						const roundTime = `${curRound.bt} - ${curRound.et}`;
						prod['venueID'] = venueID;
						prod['roundID'] = roundID;
						prod['roundName'] = roundName;
						prod['roundTime'] = roundTime;
					}
					cart.unshift(prod);
				}
				let ticket = prod.ticket.find((item) => item.tid == tid);
				let newCount = 0;
				let needID = ticket ? ticket.tourist_info : 0;
				if (!ticket) {
					ticket = cloneDeep(state.ticketList.find((item) => item.tid == tid));
					ticket['count'] = 0;
					ticket['idcardInfo'] = [];
					prod.ticket.unshift(ticket);
					needID = ticket.tourist_info;
					if (needID != 2) {
						newCount = (ticket.count + count) * 1;
					} else { //一票一证
						if (ticket.group_id != 0) { //如果是分组的门票，第一次点击加入购物车时，票数为0
							newCount = 0;
						} else {
							newCount = (ticket.count + count) * 1;
						}
					}
				} else {
					newCount = (ticket.count + count) * 1;
				}
				const storage = ticket.storage * 1;
				if (newCount < 0) {
					errorMsg = `购买票数不能为负数`;
					Message.error(errorMsg);
					return reject(errorMsg);
				}

				//如果超出库存
				if (storage != -1 && newCount > storage) {
					errorMsg = `当前库存：${storage}，库存不足`;
					Message.error(errorMsg);
					return reject(errorMsg);
				}

				ticket.count = newCount;

				if (needID == 2) {
					let _num = newCount != 0 ? (newCount - ticket.idcardInfo.length) : 1;
					while (_num--) {
						ticket.idcardInfo.unshift({ name: '', idcard: '' });
					}
				} else if (ticket.idcardInfo.length == 0) {
					ticket.idcardInfo.unshift({ name: '', idcard: '' });
				}

				commit('update_cart', { cart });
				return resolve(cloneDeep(cart));

			});
		},

		/**
		 * 从购物车减掉某个票的票数
		 * @param {string} prodID   产品id
		 * @param {string} tid      票id
		 * @param {number} count    要减少的票数
		 */
		minuToCart({ state, commit, dispatch, getters, rootState }, { prodID, tid, count = 1 }) {
			return new Promise((resolve, reject) => {
				let errorMsg = '';
				const cart = cloneDeep(state.cart);
				if (!cart || cart.length == 0) {
					errorMsg = 'cart为空';
					Message.error(errorMsg);
					return reject(errorMsg);
				}
				const prod = cart.find((item) => item.id == prodID);
				if (!prod) {
					errorMsg = '产品不匹配';
					Message.error(errorMsg);
					return reject(errorMsg);
				}
				const ticket = prod.ticket.find((item) => item.tid == tid);
				if (!ticket) {
					errorMsg = '票类不匹配';
					Message.error(errorMsg);
					return reject(errorMsg);
				}

				const needID = ticket.tourist_info;
				const newCount = ticket.count - count;

				let idcardInfo = ticket.idcardInfo;
				if (newCount < 0) {
					errorMsg = '票数不能为负数';
					Message.error(errorMsg);
					return reject(errorMsg);
				}

				if (needID == 2) {//如果是一票一证的票
					while (count--) {
						idcardInfo.pop();
					}

					if (newCount == 0) {
						idcardInfo.unshift({ idcard: '', name: '' });
					}
				}

				ticket.count = newCount;


				commit('update_cart', { cart });
				console.log(cloneDeep(cart));
				resolve(cloneDeep(cart));

			});
		},

		/**
		 * 从购物车中移除某个票类
		 * @param {string} prodID   产品id
		 * @param {string} tid      票id
		 * @param {number} index    用于删除某张身份证
		 */
		removeToCart({ state, commit, dispatch, getters, rootState }, { prodID, tid, index = 0 }) {
			return new Promise((resolve, reject) => {
				let errorMsg = '';
				let cart = cloneDeep(state.cart);
				if (!cart || cart.length == 0) {
					errorMsg = 'cart为空';
					if (tid) Message.error(errorMsg);
					return reject(errorMsg);
				}
				const prod = cart.find((item) => item.id == prodID);
				if (!prod) {
					errorMsg = '产品不匹配';
					if (tid) Message.error(errorMsg);
					return reject(errorMsg);
				}

				//如果不传tid或tid为空，则删除这个产品下的全部票类
				if (!tid) {
					//取出目标产品下的所有票id
					const tids = prod.ticket.map((ticket) => ticket.tid);
					const newTicketList = cloneDeep(state.ticketList).map((ticket) => {
						if (tids.includes(ticket.tid) && ticket.selected) {
							ticket.selected = 0;
						}
						return ticket;
					});
					if (tids.includes(state.tid)) commit('update_tid', { tid: '' });
					commit('update_ticket', { list: newTicketList });
					const prodIndex = cart.findIndex((prod) => prod.id == prodID);
					cart.splice(prodIndex, 1);
					commit('update_cart', { cart });
					return resolve(cloneDeep(cart));
				}


				const ticket = prod.ticket.find((item) => item.tid == tid);
				if (!ticket) {
					errorMsg = '票类不匹配';
					Message.error(errorMsg);
					return reject(errorMsg);
				}
				const needID = ticket.tourist_info;
				let idcardInfo = ticket.idcardInfo;
				idcardInfo.splice(index, 1);

				if (needID == 2) {
					ticket.count = ticket.count - 1;
				} else {
					if (tid == state.tid) commit('update_tid', { tid: '' });
				}

				if (idcardInfo.length == 0) {
					prod.ticket = prod.ticket.filter((item) => item.tid != tid);
					const ticketList = cloneDeep(state.ticketList);
					const ticket = ticketList.find((ticket) => ticket.tid == tid);
					if (ticket) {
						ticket.selected = 0;
						commit('update_ticket', { list: ticketList });
					}
					if (tid == state.tid) commit('update_tid', { tid: '' });
					if (prod.ticket.length == 0) {
						cart = cart.filter((item) => item.id != prodID);
						if (cart.length == 0) commit('update_tid', { tid: '' });

					}
				}

				commit('update_cart', { cart });
				resolve(cloneDeep(cart));
			});
		},
		/**
		 * 清空购物车
		 */
		clearCart({ state, commit, dispatch, getters, rootState }) {
			commit('update_cart', { cart: [] });
			commit('update_tid', { tid: '' });
			const ticketList = cloneDeep(state.ticketList);
			ticketList.forEach((ticket) => ticket.selected = 0);
			commit('update_ticket', { list: ticketList });

		},
		/**
		 * 手动在input框里输入身份证或姓名
		 */
		inputTouristInfo({ state, commit, dispatch, getters, rootState }, { prodID, tid, index = 0, idcard, name }) {
			return new Promise((resolve, reject) => {
				let errorMsg = '';
				if (typeof idcard == 'undefined' && typeof name == 'undefined') {
					errorMsg = '出错';
					Message.error(errorMsg);
					return reject({ errorMsg });
				}
				const cart = cloneDeep(state.cart);
				if (!cart || cart.length == 0) {
					errorMsg = 'cart为空';
					Message.error(errorMsg);
					return reject({ errorMsg });
				}
				const prod = cart.find((item) => item.id == prodID);
				if (!prod) {
					errorMsg = '产品不匹配';
					Message.error(errorMsg);
					return reject({ errorMsg });
				}
				const ticket = prod.ticket.find((item) => item.tid == tid);
				if (!ticket) {
					errorMsg = '票类不匹配';
					Message.error(errorMsg);
					return reject({ errorMsg });
				}
				const idcardInfo = ticket.idcardInfo[index];
				if (!idcardInfo) {
					errorMsg = '身份证信息不匹配';
					Message.error(errorMsg);
					return reject({ errorMsg });
				}
				if (typeof name == 'string') { //更新姓名
					idcardInfo.name = name;
				} else if (typeof idcard == 'string') { //更新身份证
					if (idcard == '') {
						idcardInfo.idcard = '';
					} else {
						const valid = validIDCardAvaibable({ cart, prodID, tid, idcard });
						if (valid.code != 200) {
							errorMsg = valid.msg;
							Message.error(errorMsg);
							return reject({ errorMsg, idcard: idcardInfo.idcard });
						}
						idcardInfo.idcard = idcard;
					}
				}
				commit('update_cart', { cart });
				commit('update_tid', { tid });
				resolve(cloneDeep(cart));
			});
		},


	},
	mutations: {
		initPageData(state, { relationList, productList, roundList }) {
			const firstProd = productList[0];
			const productID = firstProd ? firstProd.id : '';


			state.relationList = relationList;
			state.productList = productList;
			state.productID = productID;
			state.roundList = roundList;

		},
		update_ticketGroupList(state, ticketGroupList) {
			state.ticketGroupList = ticketGroupList;
			state.ticketGroupID = '';
		},
		update_loading(state, val) {
			state.loading = !!val;
		},
		update_relationList(state, { list }) {
			state.relationList = list;
		},
		update_product(state, { list }) {
			state.productList = list;
			state.productID = list[0] ? list[0].id : '';
		},
		update_product_id(state, lid) {
			state.productID = lid;
		},
		update_ticketGroupID(state, ticketGroupID) {
			state.ticketGroupID = ticketGroupID;
		},
		update_playDate(state, date) {
			state.playDate = date;
		},
		update_ticket(state, { list }) {
			const keys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
			list.forEach && list.forEach((ticket, index) => {
				const key = keys[index] || '';
				ticket['boardKey'] = key;
			});
			state.ticketList = list;
		},
		update_round(state, { list }) {
			state.roundList = list;
			state.roundID = list[0] ? list[0].id : '';
		},
		update_round_id(state, { id }) {
			state.roundID = id;
		},
		update_venueID(state, { id }) {
			state.venueID = id;
		},
		update_guideID(state, { id }) {
			state.guideID = id;
		},
		update_guideList(state, { list }) {
			state.guideList = list;
		},
		update_originList(state, { list }) {
			state.originList = list;
		},
		update_townID(state, { id }) {
			state.townID = id;
		},
		update_townList(state, { list }) {
			state.townList = list;
		},
		update_tid(state, { tid }) {
			state.tid = tid;
		},
		update_mobile(state, { mobile }) {
			state.mobile = mobile;
		},
		update_ordername(state, { ordername }) {
			state.ordername = ordername;
		},
		update_liushui(state, { liushui }) {
			state.liushui = liushui;
		},
		update_memo(state, { memo }) {
			state.memo = memo;
		},
		update_origin(state, { origin }) {
			state.origin = origin;
		},
		update_tourID(state, { id }) {
			state.tourID = id;
		},
		update_cart(state, { cart }) {
			state.cart = cart;
		},
		again_cart(state, { againCart }) {
			state.cartAgain = againCart;
		},
		update_ordernum(state, { orderNum }) {
			state.OrderNum = orderNum;
		},
		update_res(state, { res }) {
			state.dataAagin = res;
		},
	},
});


export default store;
