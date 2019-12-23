import store from "@/store";
import moment from "moment";
import * as Service from "@/service";
import * as TYPES from "./mutationType";
import Message from "@/util/message";
import {cloneDeep} from "lodash";

const {ShowService} = Service;

const today = moment().format("YYYY-MM-DD");

store.registerModule("showSeat_online",{
	namespaced : true,
	state : {
		filter : {
			prodID : "",
			date : today,
			roundID : "",
			zoneID : "",
			venueID : ""
		},
		venueName : "",
		//产品列表
		prodList : [],
		//场次列表
		roundList : [],
		//分区列表
		zoneList : [],
		selectedList : []
	},
	getters : {
		prodName(state){
			if(!state.prodList || state.prodList.length==0) return "";
			const prod = state.prodList.find((prod) => (prod.lid==state.filter.prodID));
			return prod ? prod.title : "";
		},
		roundName(state){
			if(!state.roundList || state.roundList.length==0) return "";
			const round = state.roundList.find((round) => (round.round_id==state.filter.roundID));
			return round ? round.round_name : "";
		},
		zoneName(state){
			if(!state.zoneList || state.zoneList.length==0) return "";
			const zone = state.zoneList.find((zone) => (zone.zone_id==state.filter.zoneID));
			return zone ? zone.zone_name : "";
		},
		sapplyDid(state){
			if(!state.prodList || state.prodList.length==0) return "";
			const prod = state.prodList.find((prod) => (prod.lid==state.filter.prodID));
			//后端这边返回的aid就是指上级供应商id
			return prod ? (prod.aid || "") : "";
		}
	},
	actions : {
		initData({state, commit, dispatch, rootState}){
			const { account, member_id, parent_member_id } = rootState.userInfo;

			dispatch("updatePageLoading",true,{root:true});

			return new Promise((resolve,reject) => {
				Service.getAllProductList({account:parent_member_id,ptype:"H"}).then((prodRes)=>{
					if(prodRes.code!=200) return Message.error(prodRes.msg);
					const productList =  prodRes.data;
					if(productList.length==0) return Message.error("暂无可出售产品");
					const prodID = productList[0].lid;
					commit(TYPES.UPDATE_PRODUCT_LIST,{list:productList});
					dispatch("changeProd",{prodID})
						.then((data) => resolve(data))
						.catch((e) => reject(e));
				}).catch((error) => {
					Message.error(error.toString());
					reject(error);
				}).finally(() => {
					dispatch("updatePageLoading",false,{root:true});
				})
			})


		},
		//切换产品
		changeProd({state,commit,dispatch,rootState},{prodID}){
			commit(TYPES.UPDATE_PRODUCT_ID,{id:prodID});
			return dispatch("changeDate",{date:today});
		},
		//切换日期
		changeDate({state,commit,dispatch,rootState,getters},{date}){
			let failMsg = "请求场次及场管分区信息失败：";
			commit(TYPES.UPDATE_DATE,{date});
			const prodID = state.filter.prodID;
			const accountName = rootState.userInfo.member_name;
			dispatch("updatePageLoading",true,{root:true});
			return new Promise((resolve,reject) => {
				ShowService.getRoundZoneList({lid:prodID,date}).then((res)=>{
					if(res.code==200){
						const {round_list,venue_info,zone_list} = res.data;
						const {venue_id,venue_name} = venue_info || {};
						const {zoneID} = state.filter;
						const zoneIDArr = zone_list.length>0 ? zone_list.map((zone) => zone.zone_id) : [];
						const roundName = getters.roundName;
						const _round = round_list.find((round) => {
							const _roundName = `${round.round_name} ${round.begin_time}~${round.end_time}`;
							return _roundName == roundName
						})
						const _fr = round_list[0] || {};
						const _fz = zone_list[0] || {};
						const _roundID = _round ? _round.round_id : (_fr.round_id || "");
						const _zoneID = zoneIDArr.includes(zoneID) ? zoneID : (_fz.zone_id || "");
						commit(TYPES.UPDATE_ROUND_LIST,{list:round_list});
						commit(TYPES.UPDATE_ROUND_ID,{id:_roundID});
						commit(TYPES.UPDATE_ZONE_LIST,{list:zone_list});
						commit(TYPES.UPDATE_ZONE_ID,{id:_zoneID});
						commit(TYPES.UPDATE_VENUE_ID,{id:venue_id || ""});
						commit(TYPES.UPDATE_VENUE_NAME,{name:venue_name || ""});
						if(round_list.length==0){
							failMsg = "该产品当天没有设置场次";
							Message.error(failMsg);
						}
						if(zone_list.length==0){
							failMsg = "该产品没有设置分区";
							Message.error(failMsg);
						}
						resolve(cloneDeep(state.filter));
					}else{
						if(res.code==301){
							failMsg += `${accountName} 不是该产品所绑定的场管的供应商，无权查看场馆场次信息`;
						}else{
							failMsg += (res.msg || "未知错误");
						}
						Message.alert(failMsg);
						reject(new Error(failMsg));
					}

				}).catch((error)=>{
					Message.error(error.toString());
					reject(error);
				}).finally(()=>{
					dispatch("updatePageLoading",false,{root:true});
				});
			})

		},
		//切换场次
		changeRound({state,commit,dispatch,rootState},{roundID}){
			commit(TYPES.UPDATE_ROUND_ID,{id:roundID});
		},
		//切换分区
		changeZone({state,commit,dispatch,rootState},{zoneID}){
			commit(TYPES.UPDATE_ZONE_ID,{id:zoneID})
		},
		updateSelectedList({state,commit,dispatch,rootState},{type="add",list}){
			commit(TYPES.UPDATE_SELECTED_LIST,{type,list});
		}
	},
	mutations : {
		[TYPES.UPDATE_PRODUCT_LIST](state,{list}){
			state.prodList = list;
		},
		[TYPES.UPDATE_PRODUCT_ID](state,{id}){
			state.filter.prodID = String(id);
		},
		[TYPES.UPDATE_DATE](state,{date}){
			state.filter.date = date;
		},
		[TYPES.UPDATE_ROUND_LIST](state,{list}){
			state.roundList = list.map((round) => {
				round.round_name = `${round.round_name} ${round.begin_time}~${round.end_time}`;
				return round;
			});
		},
		[TYPES.UPDATE_ROUND_ID](state,{id}){
			state.filter.roundID = id;
		},
		[TYPES.UPDATE_ZONE_LIST](state,{list}){
			state.zoneList = list;
		},
		[TYPES.UPDATE_ZONE_ID](state,{id}){
			state.filter.zoneID = id;
		},
		[TYPES.UPDATE_VENUE_ID](state,{id}){
			state.filter.venueID = id;
		},
		[TYPES.UPDATE_VENUE_NAME](state,{name}){
			state.venueName = name;
		},
		/**
		 * 更新用户选中的座位
		 * @param {string} 操作类型：add=="添加" remove=="移除"  empty=="清空"
		 * @param {array}  座位列表
		 *
		 * 添加多个时：[{customNum:"6-15",seatID:32651},..]
		 * 只添加一个时：可以传array，也可以传object
		 *
		 * 移除时多个时：list=[seatID,seatID,seatID..]
		 * 只移降低一个时：可以传array，也可以只传 seatID
		 *
		 */
		[TYPES.UPDATE_SELECTED_LIST](state,{type="add",list}){
			const isArray = (array) => Array.isArray(array);
			if(type=="empty") return state.selectedList = [];
			if(type=="add"){
				const seatIDArr = state.selectedList.map((item) => item.seatID);
				if(isArray(list)){
					//先过滤掉已经被添加了的座位，这些座位不应重复添加
					list = list.filter((item) => !seatIDArr.includes(item.seatID));
					state.selectedList = list.concat(cloneDeep(state.selectedList));
				}else{
					if(!seatIDArr.includes(list.seatID)){//添加之前先判断目标座位是否已经被添加过了
						state.selectedList.unshift(list);
					}
				}
			}else if(type=="remove"){
				if(isArray(list)){
					state.selectedList = state.selectedList.filter((seat) => !list.includes(seat.seatID));
				}else{
					state.selectedList = state.selectedList.filter((seat) => seat.seatID!=list);
				}
			}
		}
	}
})

