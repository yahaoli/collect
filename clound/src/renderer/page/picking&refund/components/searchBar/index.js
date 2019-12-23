import "./index.scss";
require("../../store");

export default {
	template: require("./index.xtpl"),

	data() {
		return {
			queryWord: "",
			scenicValue: "-1"
		};
	},

	props: {
		scenicList: {
			default: [{ id: "-1", title: "所有产品", salerid: "-1" }],
			type: Array
		},
		type: {
			default: "refund",
			type: String
		}
	},

	watch: {
		type() {
			this.queryWord = "";
			this.$store.commit("picking&refund/update_state", {
				orderList: [],
				showEmptyText: false
			});
		}
	},

	methods: {
		searchByCode() {
			this.$emit("search", {
				queryWord: this.queryWord,
				scenicValue: this.scenicValue,
				salerid: this.scenicList.filter(
					item => item.id == this.scenicValue
				)[0].salerid,
				searchType: "code",
				type: this.type
			});
		},
		searchByOther() {
			this.$emit("search", {
				queryWord: this.queryWord,
				scenicValue: this.scenicValue,
				salerid: this.scenicList.filter(
					item => item.id == this.scenicValue
				)[0].salerid,
				searchType: "other",
				type: this.type
			});
		}
	},

	mounted() {
		//身份证读取
		// setTimeout(()=>{
		// this.$ws.send({
		// 	cmd: "idread",
		// 	reqid: "2"
		// });
		if (this.$ws) {
			this.$ws.on("readidcardinfo", (data, e) => {
				/**
				 * 读取系统设置里身份证读卡设置
				 * id_read_type == 0 关闭身份证读卡
				 * id_read_type == 1 采用精伦读卡器
				 * id_read_type == 2 采用新中新读卡器
				 */
				if (this.$store.state.setting.data.id_read_type == 0)
					return false;

				if (data.code == 200) {
					const info = JSON.parse(data.data);
					const idcard = info.Code;
					const name = info.Name;
					if (!idcard) return Message.error("读取不到身份证号码");
					if (!name) return Message.error("读取不到身份证上的姓名");
					this.queryWord = idcard;
				} else {
					Message.error(data.msg || "读取身份证失败");
				}
			});
		}

		// },2000)
	},
	beforeDestroy() {
		// this.$ws.send({cmd:"close_idcard_reader"});
		if (!this.$ws) {
			this.$ws.off("readidcardinfo");
		}
	}
};
