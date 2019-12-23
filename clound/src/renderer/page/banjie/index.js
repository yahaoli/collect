require("./index.scss");
import moment from "moment";
import {banjieGetList,banjieSetup,banjieDetail} from "@/service";
import {mapState} from "vuex";
import Message from "@/util/message";
import {cloneDeep,isArray} from "lodash";
import FileSaver from "file-saver";
export default {
	template : require("./index.xtpl"),
	data(){
		const today = moment().format("YYYY-MM-DD")
		return{
			isSearching : false,
			isBanjeLoaing : false,
			curDateTime : [`${today} 00:00:00`,`${today} 23:59:59`],
			list : null,
			errorMsg : "",
			pageSize : 10,
			totalPage : 0,
			totalCount : 0,
			detailTableData : [],
			detailDialogShow : false
		}
	},
	mounted(){
		this.fetchList();
	},
	computed : {
		...mapState(["userInfo"])
	},
	methods : {
		async fetchList(page){
			if(this.isSearching) return false;
			this.isSearching = true;
			const opid = this.userInfo.member_id;
			const begintime = this.curDateTime[0];
			const endtime = this.curDateTime[1];
			const pageSize = this.pageSize;
			const res = await banjieGetList({opid,begintime,endtime,page_num:pageSize});
			this.isSearching = false;
			if(!res) return false;
			if(res.code==200){
				this.list = res.data.recordList.map((item)=>{
					item["loading_excel"] = false;
					item["loading_print"] = false;
					item["loading_detail"] = false;
					return item;
				});
				this.errorMsg = "";
				this.totalPage = Math.ceil(res.data.allNum / pageSize);
				this.totalCount = res.data.allNum * 1;
			}else if(res.code==203){//无数据
				this.list = [];
				this.errorMsg = res.msg || "无数据";
				this.totalPage = 0;
				this.totalCount = 0;
				Message.error(this.errorMsg);
			}else{//出错
				this.list = null;
				this.errorMsg = res.msg || "接口异常";
				this.totalPage = 0;
				this.totalCount = 0;
				Message.error(this.errorMsg);
			}
		},
		onSearchBtnClick(e){
			this.fetchList();
		},
		async onBanjeBtnClick(e){
			if(this.isBanjeLoaing) return false;
			this.isBanjeLoaing = true;
			const opid = this.userInfo.member_id;
			const btime = this.curDateTime[0];
			const etime = this.curDateTime[1];
			const res = await banjieSetup({opid,btime,etime});
			this.isBanjeLoaing = false;
			if(!res) return false;
			if(res.code==200){
				Message.success("发起成功");
			}else{
				Message.error(res.msg || "发起失败");
			}
		},

		async onExportExcel(e,id){
			const target = e.target;
			const classList = target.classList;
			//如果是点击在loading图标上，说明此时正在发请求数据，就不再重复发请求
			if(classList.contains("el-icon-loading")) return false;
			const button = classList.contains("text") ? target.parentNode : target;
			const cls = button.classList;
			if(cls.contains("is-loading")) return false;
			cls.add("is-loading");
			const res = await banjieDetail({id});
			cls.remove("is-loading");
			if(!res) return false;
			if(res.code!=200) return Message.error(res.msg);
			let keys = Object.keys(res.data);
			if(keys.length==0) return false;

			const data = keys.map((item)=>res.data[item]).filter((item)=>isArray(item)).map((item)=>item.join(",")+"\n");

			const list = this.list;
			const item = list.find((item)=>item.id==id);
			if(!item) return false;
			const {btime,etime} = item;

			const blob = new Blob(data,{type: "text/plain;charset=utf-8"});
			const filename = `班结报表 - ${btime}-${etime}.csv`;
			FileSaver.saveAs(blob,filename);

		},
		async onPrint(e,id){
			const target = e.target;
			const classList = target.classList;
			//如果是点击在loading图标上，说明此时正在发请求数据，就不再重复发请求
			if(classList.contains("el-icon-loading")) return false;
			const button = classList.contains("text") ? target.parentNode : target;
			const cls = button.classList;
			if(cls.contains("is-loading")) return false;
			cls.add("is-loading");
			const res = await banjieDetail({id});
			cls.remove("is-loading");
			if(!res) return false;
			if(res.code!=200) return Message.error(res.msg);

			this.$ws.send({cmd:"printBanjiePort",banjieData:res.data},(res)=>{
				if(res.code!=200) return Message.error(res.msg);
			})

		},
		async onDetail(e,id){
			this.detailTableData = [];
			const target = e.target;
			const classList = target.classList;
			//如果是点击在loading图标上，说明此时正在发请求数据，就不再重复发请求
			if(classList.contains("el-icon-loading")) return false;
			const button = classList.contains("text") ? target.parentNode : target;
			const cls = button.classList;
			if(cls.contains("is-loading")) return false;
			cls.add("is-loading");
			const res = await banjieDetail({id});
			cls.remove("is-loading");
			if(!res) return false;
			if(res.code!=200) return Message.error(res.msg);

			let keys = Object.keys(res.data);
			if(keys.length==0) return false;

			keys = keys.slice(2);

			this.detailTableData = keys.map((item)=>res.data[item]).filter((item)=>item.length>0);

			this.detailDialogShow = true;

		},
		onPageChange(page){
			this.fetchList(page);
		}
	}
}
