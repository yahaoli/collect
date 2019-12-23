require("./store");
import "./index.scss";
import SeatStage from "./component/seat-stage";

import Vuex from "vuex";
const {
	mapState,
	mapGetters,
	mapActions
} = Vuex.createNamespacedHelpers("showSeat_online");




export default{
	template : require("./index.xtpl"),
	components : {
		SeatStage
	},
	data(){
		return{

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
	computed : {
		...mapState(["prodList","roundList","zoneList","filter","venueName","selectedList"]),
		...mapGetters(["prodName","roundName","zoneName","sapplyDid"]),
		date : {
			get(){
				return this.filter.date;
			},
			set(date){
				this.changeDate({date}).then((data) => this.updateSeatStage());
			}
		},
		prodID(){
			return this.filter.prodID;
		},
		roundID(){
			return this.filter.roundID;
		},
		zoneID(){
			return this.filter.zoneID;
		},
		venueID(){
			return this.filter.venueID;
		}
	},
	mounted(){

		const prodID = this.prodID;
		const roundID = this.roundID;
		const zoneID = this.zoneID;
		const venueID = this.venueID;

		if(!prodID){
			this.initData().then((data) => this.updateSeatStage());
		}else{ //如果是从上一页填写订单页回退回来的，说明store里的prodID是有值的

			/**
			 * 处理从上一页填写订单页回退回来时，把store里用户已选的数据update到视图里
			 */
			if(!roundID || !zoneID) return false;
			const seatIDArr = this.selectedList.map((seat) => seat.seatID);
			this.$refs.seatStage.update({
				venueID,roundID,zoneID,clearSelectedList:false
			}).then((data) => {
				this.$refs.seatStage.updateMaxSelectedShowCount();
				if(this.selectedList.length==0) return false;
				data.forEach((ZImage) => {
					const orignData = ZImage.orignData;
					if(orignData){
						const {seat_id} = orignData;
						if(seatIDArr.includes(seat_id)){
							this.$refs.seatStage.selectSeat(ZImage);
						}
					}
				})
			})
		}



	},
	methods : {
		...mapActions(["initData","changeProd","changeDate","changeRound","changeZone"]),
		onProductChange(prodID){
			this.changeProd({prodID}).then((data) => this.updateSeatStage());
		},
		onRoundChange(roundID){
			if(roundID==this.roundID) return false;
			this.changeRound({roundID}).then((data) => this.updateSeatStage());
		},
		onZoneChange(zoneID){
			if(zoneID==this.zoneID) return false;
			this.changeZone({zoneID}).then((data) => this.updateSeatStage());
		},
		//点击按钮刷新座位
		onRefreshBtnClick(){
			this.updateSeatStage();
		},
		updateSeatStage(){
			const venueID = this.venueID;
			const roundID = this.roundID;
			const zoneID = this.zoneID;
			if(!venueID || !roundID || !zoneID){
				this.$refs.seatStage.destroy();
			}else{
				this.$refs.seatStage.update({venueID,roundID,zoneID})
			}
		}
	}
}
