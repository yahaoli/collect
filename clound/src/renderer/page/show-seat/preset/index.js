import "./index.scss";
import moment from "moment";
import * as Service from "@/service";
import {cloneDeep} from "lodash";
import Message from "@/util/message";
const {ShowService} = Service;
const today = moment().format("YYYY-MM-DD");


export default{
	template : require("./index.xtpl"),
	data(){
		return{
			loading : false,
			//dialog中取消预留座位loading
			releaseReserveSeatsLoading : false,
			filter : {
				lid : "",
				date : today,
				roundID : "",
				contactName : "",
				contactMobile : "",
				isIssueTicket : false,
				page : 1,
				size : 15
			},
			selectedRound : null,
			dialogShow : false,
			totalPage : 0,
			productList : [],
			roundList : [],
			yuList : [],
			datePickerOption: {
				disabledDate (time) {
					return (
						time.getTime() <
						new Date().getTime() - 24 * 60 * 60 * 1000
					);
				}
			},
		}
	},
	filters : {
		seatName(seat){
			if(typeof seat!=="string") return "";
			const [row,col] = seat.split("-");
			return `${row}排${col}座`;
		},
		//unix时间戳转化成正常日期格式：YYYY-MM-DD HH:mm:ss
		unixToDate(unix){
			if(!unix) return "";
			return moment.unix(unix).format("YYYY-MM-DD HH:mm:ss");
		},
		itemDisabled(item){
			if(item.seat_list.seat_using.length==0 && item.seat_list.seat_used.length>0) return "disabled";
			return ""
		}
	},
	mounted(){
		//这个页面的路由是设置了keep-alive的，但当从这个路由切出去到其它路由时，不知道为什么会执行这个mounted方法
		//所以这里做一层判断，如果当前路由不是在ShowPreset，就不执行以下代码
		if(this.$route.name!=="ShowPreset") return false;
		const { account, member_id, parent_member_id } = this.$store.state.userInfo;
		Service.getAllProductList({account:parent_member_id,ptype:"H",showDistribution:false}).then((prodRes)=>{
			if(prodRes.code!=200){
				Message.error(prodRes.msg);
				return this.loading = false;
			}
			const productList =  prodRes.data;

			if(productList.length==0){
				this.loading = false;
				failMsg = "暂无可出售产品";
				return Message.error(failMsg);
			}
			const prodID = productList[0].lid;
			this.productList = productList;
			this.filter.lid = prodID;
			this.onProdChange(prodID);
		}).catch((e) => {
			Message.error(e.toString());
		})

	},
	methods : {
		onProdChange(id){
			return this.getRoundZoneList({lid:id,date:this.filter.date}).then((res) => {
				this.onSearchYuList();
			}).catch((error)=>{})
		},
		onRoundChange(roundID){
			this.onSearchYuList()
		},
		onDateChange(date){
			this.getRoundZoneList({lid:this.filter.lid,date}).then((res) => {
				this.onSearchYuList()
			}).catch((e) => {})
		},
		onSearchYuList(){
			this.loading = true;
			const parmas = Object.assign({},this.filter);
			parmas.isIssueTicket =parmas.isIssueTicket ? 1 : 0;

			ShowService.getReserveList(parmas).then((res) => {
				this.loading = false;
				if(res.code!=200) return Message.error(res.msg);
				this.yuList = res.data.list;
				this.filter.page = 1;
				this.totalPage = Math.ceil(res.data.total / this.filter.size);
			}).catch((e)=>{
				this.loading = false;
				Message.error(e.toString());
			})
		},
		//点击出票按钮
		onOrderBtnClick(round){
			const _round = cloneDeep(round);
			_round["count"] = _round.seat_list.seat_using.length;
			_round["resolve"] = true;
			_round["checkedSeat"] = _round.seat_list.seat_using.map((item) => item.seat_id);
			_round.seat_list.seat_using = _round.seat_list.seat_using.map((item) => {
				item["checked"] = true;
				return item;
			})
			this.selectedRound = _round;

			this.dialogShow = true;

		},
		//点击取消按钮，取消预留的座位
		onCancelResBtnClick(round){
			Message.confirm("确定要取消该预留信息吗？").then(()=>{
				this.loading = true;
				const seatID = round.seat_list.seat_using.map((item) => item.seat_id).join(",");
				ShowService.releaseReserveSeats({recordID:round.id,seatID}).then((res) => {
					this.loading = false;
					if(res.code!=200) return Message.error(res.msg);
					Message.success("取消成功");
					this.onSearchYuList();
				}).catch((e) => {
					this.loading = false;
					Message.error(e.toString());
				})
			}).catch(()=>{})
		},
		onDialogCancel(){
			this.selectedRound = null;
			this.dialogShow = false;
		},
		//点击确定购票按钮
		async onSubmitTicket(){
			const {
				checkedSeat,
				seat_list : {seat_using},
				resolve,
				id,  //预留记录ID
				venue_id,zone_id,zone_name,round_id,round_name,
				bt,et
			} = this.selectedRound;
			const {
				lid,
				date
			} = this.filter;
			const seatNameStr = seat_using.filter((item) => checkedSeat.includes(item.seat_id)).map((item) => {
				return item.seat_id + "|" + item.seat_name;
			}).join(",");


			//查看是否有没有勾选的座位，没有勾选即代表不为这个座位购票
			const unBook = seat_using.filter((item) => !checkedSeat.includes(item.seat_id)).map((item) => item.seat_id);

			//如果没有全部的预留座位都购票，并且勾选了 释放剩余座位
			//那就把不购票的座位取消预留(释放座位)
			if(unBook.length>0 && resolve){
				this.releaseReserveSeatsLoading = true;
				try{
					const res = await ShowService.releaseReserveSeats({
						recordID : id,
						seatID : unBook.join(",")
					});
					this.releaseReserveSeatsLoading = false;
					if(res.code!=200) return Message.error(res.msg);
				}catch(e){
					this.releaseReserveSeatsLoading = false;
					Message.error(e.toString());
					return false;
				}
			}

			const venueId = venue_id;
			const roundId = round_id;
			const roundName = `${round_name}（${bt}~${et}）`;
			const zoneId = zone_id;
			const zoneName = zone_name;
			const prodId = lid;
			const prod = this.productList.find((item) => item.lid==lid);
			const prodName = prod.title;
			// const sapplyDid = prod.sapply_did;
			//后端没返回sapply_did,只返回了applyDid，感觉两者是一样的，所以这里暂时用applyDid来替代
			const sapplyDid = typeof prod.apply_did=="undefined" ? prod.applyDid : prod.apply_did;

			//关闭dialog
			this.onDialogCancel();

			this.$router.push({name:"ShowOrder", query : {
				venueId,
				roundId,roundName,
				zoneId,zoneName,
				prodId,prodName,
				date,
				sapplyDid,
				seatId : seatNameStr
			}})



		},
		isDisable(item){
			if(item.seat_list.seat_using.length==0 && item.seat_list.seat_used.length>0) return true
			return false
		},
		onSelectedRoundCountChange(count,oldVal){
			const selectedRound = this.selectedRound;
			if(!selectedRound) return false;
			if(count==oldVal) return false;
			const using = selectedRound.seat_list.seat_using;
			const checkedSeat = cloneDeep(selectedRound.checkedSeat);
			const usingFilter = using.filter((item) => !checkedSeat.includes(item.seat_id));
			const dis = count - oldVal;

			if(dis>0){ //增加
				for(let i=0; i<dis; i++){
					checkedSeat.push(usingFilter[i].seat_id);
				}
			}else{ //减少
				for(let i=0; i<Math.abs(dis); i++){
					checkedSeat.pop();
				}
			}

			selectedRound.checkedSeat = checkedSeat;

		},
		onSeatCheckboxChange(val){
			if(val){
				this.selectedRound.count += 1;
			}else{
				this.selectedRound.count -= 1;
			}
		},
		getRoundZoneList({lid="",date=""}){
			return new Promise((resolve,reject) => {
				ShowService.getRoundZoneList({lid,date}).then((res)=>{
					this.loading = false;
					if(res.code!=200){
						Message.error(res.msg);
						return reject(res.msg)
					}
					const {round_list} = res.data;
					const _fr = round_list[0] || {};
					this.roundList = round_list.map((round) => {
						round.round_name = `${round.round_name} ${round.begin_time}~${round.end_time}`;
						return round;
					}) || [];
					this.filter.roundID = _fr.round_id || "";
					if(round_list.length==0) Message.error("该产品当天没有设置场次");
					resolve(res)
				}).catch((error)=>{
					const msg = error.toString();
					Message.error(msg);
					reject(msg);
				});
			})
		}
	}
}
