import "./index.scss";
import {
	selectSrc,
	unSelectSrc,
	hasSaleSrc,
	disableSrc,
	unableSaleSrc,
	yunliuSrc,
	seatWidth,
	seatHeight,
	seatDistance,
	mapStatusToImg
} from "./config";
import Vuex from "vuex";
import zrender from "zrender";
import { ShowService } from "@/service";
import $ from "jquery";
import { cloneDeep, throttle, isObject, isArray } from "lodash";
import { transformSeatList, transformRowList, getMaxColNum } from "./transformSeatList";
import Message from "@/util/message";
import XScroll from "xscroll/dist/xscroll";
import ScalePlugin from "xscroll/dist/plugins/scale.js";

const { mapState, mapActions, mapGetters } = Vuex.createNamespacedHelpers("showSeat_online");

let _throttle = null;

export default {
	template: require("./index.xtpl"),
	data() {
		return {
			loading: false,
			rowNum: 0,
			colNum: 0,
			rowHead: [],
			maxColNum: 0,
			selectSrc,
			unSelectSrc,
			hasSaleSrc,
			disableSrc,
			unableSaleSrc,
			yunliuSrc,
			maxSelectedShowCount: 0,  //底部最多显示已选座位的个数，超出这个个数时隐藏

			selectedBoxWidth: 95,

			yuliuDialogShow: false,
			yuliuLoading: false,

			computedTotal: null,

			form: {
				name: "",
				mobile: "",
				memo: ""
			},
			formRules: {
				name: [
					{ required: true, message: "联系人必填", trigger: "blur" }
				],
				mobile: [{
					trigger: "blur",
					validator(rule, value, callback) {
						if (!value) return callback(new Error("手机号不能为空"));
						//判断是否为纯数字
						const _tel = value.replace("-", ""); //防止以后需求变更，可以输入座机电话号码
						if (isNaN(_tel)) return callback(new Error("手机号格式错误"));
						callback();
					}
				}]
			}
		};
	},
	computed: {
		...mapState(["prodList", "roundList", "zoneList", "filter", "venueName", "selectedList"]),
		...mapGetters(["prodName", "roundName", "zoneName", "sapplyDid"]),
		prodId() {
			return this.filter.prodID;
		},
		roundId() {
			return this.filter.roundID;
		},
		zoneId() {
			return this.filter.zoneID;
		},
		venueId() {
			return this.filter.venueID;
		},
		date() {
			return this.filter.date;
		},
		/**
		 * 判断是否允许预留
		 * 自供应的产品才有权预留座位，转分销的产品不行
		 */
		enAbleYuliu() {
			const { parent_member_id } = this.$store.state.userInfo || {};
			if (parent_member_id == this.sapplyDid) { //自供应
				return true;
			} else {//转分销
				return false;
			}
		}
	},
	mounted() {
		_throttle = throttle(this.onWinResize, 200);
		window.addEventListener("resize", _throttle);

	},
	beforeDestroy() {
		this.destroy();
		window.removeEventListener("resize", _throttle);
	},
	filters: {
		seatName(seat) {
			if (!seat) return "";
			const [row, col] = seat.split("-");
			return `${row}排${col}座`;
		}
	},
	watch: {
		selectedList(selectedList, oldSelectedList) {
			setTimeout(() => {
				this.updateMaxSelectedShowCount();
			}, 50);
		}
	},
	methods: {
		...mapActions(["updateSelectedList"]),
		updateMaxSelectedShowCount() {
			const all = $("#stageFootBar_LeftCol").width();
			const seatWrapWidth = all - ($("#stageFootBar_LeftCol_leftText").outerWidth() + 21);
			const seatWidth = this.selectedBoxWidth;
			this.maxSelectedShowCount = Math.floor(seatWrapWidth / seatWidth);
		},
		onSeatStageUpdate(data) {
			if (!data || data.code != 200) return this.computedTotal = null;
			const seatList = data.data.seat_list;
			const computedTotal = {
				saled: 0, //已售
				unAbleSale: 0, //不可售
				lock: 0,  //锁定
				yu: 0,   //预留
				store: 0  //实时库存 (空闲+已退)
			};
			seatList.forEach((item) => {
				const status = item.status;
				//0=空闲 1=预留 2=锁定 3=已售出 4=已退 5=不可售
				if (status == 3) {
					computedTotal.saled += 1;
				} else if (status == 5) {
					computedTotal.unAbleSale += 1;
				} else if (status == 2) {
					computedTotal.lock += 1;
				} else if (status == 1) {
					computedTotal.yu += 1;
				} else if (status == 0 || status == 4) {
					computedTotal.store += 1;
				}
			});
			this.computedTotal = computedTotal;
		},
		onWinResize(e) {
			if (!this.ZR) return false;
			this.refreshScroll();
		},
		//点击预留按钮
		onYuliuClick(formName) {
			this.$refs[formName].validate((valid) => {
				if (!valid) return false;
				this.yuliuLoading = true;
				const venueID = this.venueId;
				const roundID = this.roundId;
				const zoneID = this.zoneId;
				const seatIDArr = this.selectedList.map((item) => item.seatID);
				const seatID = seatIDArr.join(",");
				const { name, mobile, memo } = this.form;

				ShowService.reserveSeats({
					venueID, roundID, zoneID, seatID,
					name, mobile, memo
				}).then((res) => {
					this.yuliuLoading = false;
					if (res.code != 200) return Message.alert(res.msg);
					this.yuliuDialogShow = false;
					Message.success("预留座位成功");
					this.update({ venueID, roundID, zoneID });
				}).catch((error) => {
					this.yuliuLoading = false;
					Message.error(error.toString());
				});

			});
		},
		//点击提交按钮
		onSubmitClick(e) {
			let seatLenght = this.selectedList.length;
			if (seatLenght > 200) {
				Message.error("选座单笔订单最大人数不得超过200人，请自动排座购票或分笔购票。");
				return false;
			}

			const venueId = this.venueId;
			const roundId = this.roundId;
			const roundName = this.roundName;
			const zoneId = this.zoneId;
			const zoneName = this.zoneName;
			const prodId = this.prodId;
			const prodName = this.prodName;
			const sapplyDid = this.sapplyDid;
			const seatIDArr = [];
			const seatIDNumArr = [];
			this.selectedList.forEach((item) => {
				seatIDArr.push(item.seatID);
				seatIDNumArr.push(item.seatID + "|" + item.customNum);
			});
			const date = this.date;
			ShowService.lockSeats({
				venueID: venueId,
				roundID: roundId,
				zoneID: zoneId,
				seatID: seatIDArr.join(",")
			}).then((res) => {
				if (res.code != 200) return Message.error(res.msg);
				this.$router.push({
					name: "ShowOrder", query: {
						venueId,
						roundId, roundName,
						zoneId, zoneName,
						prodId, prodName,
						date,
						sapplyDid,
						seatId: seatIDNumArr.join(",")
					}
				});
			}).catch((error) => {
				Message.error(error.toString());
			});

		},
		//刷新实时库存
		refreshStore() {
			const venueID = this.venueId;
			const roundID = this.roundId;
			const zoneID = this.zoneId;
			this.update({ venueID, zoneID, roundID });
		},
		//为舞台上各种鼠标交互绑定事件
		bindStageEvent() {
			const zr = this.ZR;
			if (!zr) return false;
			let _startX = 0;
			let _startY = 0;
			let _shiftKey = false;
			let hoverRectMask = null;

			zr.on("click", (e) => {
				this.selectSeat(e.target);
			});
			zr.on("mousedown", (e) => {
				const shiftKey = e.event.shiftKey;
				const ctrlKey = e.event.ctrlKey;
				if (shiftKey || ctrlKey) {
					this.lockScroll();
					_startX = e.offsetX;
					_startY = e.offsetY;
					hoverRectMask = new zrender.Rect({
						shape: {
							x: _startX,
							y: _startY,
							width: 0,
							height: 0
						},
						style: {
							fill: "#ffe7d6",
							stroke: "#d5600b",
							opacity: 0.2
						}
					});
					zr.add(hoverRectMask);
				} else {
					this.refreshLockScroll();
				}
			});
			zr.on("mousemove", (e) => {
				const shiftKey = e.event.shiftKey;
				const ctrlKey = e.event.ctrlKey;
				_shiftKey = shiftKey;
				if (!shiftKey && !ctrlKey) return false;
				if (!hoverRectMask) return false;
				e.event.preventDefault();
				this.lockScroll();
				const { offsetX, offsetY } = e;
				hoverRectMask.attr({
					shape: {
						width: offsetX - _startX,
						height: offsetY - _startY
					}
				});
			});
			zr.on("mouseup", (e) => {
				this.refreshLockScroll();
				if (hoverRectMask) {
					let hoverRect = hoverRectMask.getBoundingRect()
						, hoverX = [hoverRect.x, hoverRect.x + hoverRect.width]
						, hoverY = [hoverRect.y, hoverRect.y + hoverRect.height];
					const seatContain = this.ZR.storage.getDisplayList().filter((seat) => {
						//判断图形四个角得坐标点在就代表选中
						let [x, y] = seat.position
							, containX = false
							, containY = false
							, seatX = [x, x + seatWidth]
							, seatY = [y, y + seatHeight];
						if (seatX[1] >= hoverX[1]) {
							containX = (seatX[0] >= hoverX[0] && seatX[0] <= hoverX[1])||(hoverX[0]>=seatX[0]&&hoverX[1]<=seatX[1]);
						} else {
							containX = seatX[1] >= hoverX[0] && seatX[1] <= hoverX[1];
						}
						if (seatY[1] >= hoverY[1]) {
							containY = (seatY[0] <= hoverY[0] && hoverY[0] <= seatY[1]) || (seatY[0] <= hoverY[1] && seatY[0] >= hoverY[0]);
						} else {
							containY = seatY[1] >= hoverY[0] && seatY[1] <= hoverY[1];
						}
						return containX && containY;
					});
					if (seatContain && seatContain.length > 0) {
						this.groupSwitchSeat(seatContain, _shiftKey);
					}
					zr.remove(hoverRectMask);
					hoverRectMask = null;
				}
				_shiftKey = false;
			});

			let _hoverTimer = null;
			zr.on("mouseover", (e) => {
				const target = e.target;
				if (!target) return false;
				if (target.type !== "image") return false;
				clearTimeout(_hoverTimer);
				this.showHoverTip(e);
			});
			zr.on("mouseout", (e) => {
				const target = e.target;
				if (!target) return false;
				if (target.type !== "image") return false;
				_hoverTimer = setTimeout(() => {
					this.hideHoverTip(e);
				}, 100);
			});

		},
		containSeat() {

		},
		update({ venueID = "", zoneID = "", roundID = "", clearSelectedList = true } = {}) {
			this.loading = true;
			this.destroy();
			if (clearSelectedList) this.updateSelectedList({ type: "empty" });
			return new Promise((resolve, reject) => {
				ShowService.getVenueSeatMergeStatus({
					venue_id: venueID,
					zone_id: zoneID,
					round_id: roundID
				}).then((res) => {
					this.loading = false;
					if (res.code == 200) {
						const { row_num, col_num, col_head, row_head, seat_list } = res.data;

						if (!seat_list || seat_list.length == 0) {
							const msg = "分区没有设置座位";
							this.onSeatStageUpdate(null);
							this.renderFailStage(msg);
							reject(msg);
							return false;
						}

						this.rowNum = row_num;
						this.colNum = col_num;
						const seatList = transformSeatList(seat_list, row_num, col_num);
						this.maxColNum = getMaxColNum(seatList);
						this.rowHead = transformRowList(row_num);
						this.renderLeftBar(this.rowHead);
						this.renderStage(seatList);
						setTimeout(() => {
							resolve(this.ZR.storage.getDisplayList());
						}, 300);
						setTimeout(() => {
							this.initXScroll();
						}, 500);
					} else {
						this.renderFailStage(res.msg);
						reject(res.msg);
					}
					this.$emit("update", res);
					this.onSeatStageUpdate(res);
				}).catch((error) => {
					this.$emit("update", null);
					this.onSeatStageUpdate(null);
					this.loading = false;
					this.renderFailStage(error.toString());
					reject(error);
				});
			});

		},
		renderStage(seatList) {
			const wh = this.computeStageWH();
			const zr = this.ZR = zrender.init(document.getElementById("seatStageMainContainer"), {
				width: wh.width,
				height: wh.height,
				renderer: "svg"
			});
			$("#seatStageMainContainer").width(wh.width);

			seatList.forEach((item, index) => {
				const { col_id, status } = item;
				const row_id = typeof item._v_row_id === "undefined" ? item.row_id : item._v_row_id;
				let x = col_id == 1 ? 0 : ((col_id - 1) * (seatWidth + seatDistance));
				let y = row_id == 1 ? (seatDistance / 2) : ((row_id - 1) * (seatHeight + seatDistance)) + seatDistance / 2;
				const orignData = cloneDeep(item);
				orignData["target"] = "seatImage";
				const seat = new zrender.Image({
					style: {
						width: seatWidth,
						height: seatHeight,
						image: mapStatusToImg[status] || ""
					},
					selected: false,
					orignData: orignData,
					position: [x, y]
				});
				zr.add(seat);
			});

			const hoverRect = this.hoverRect = new zrender.Rect({
				shape: {
					r: [3, 3, 3, 3],
					x: 0,
					y: 0,
					width: 0,
					height: 0
				},
				style: {
					fill: "#000",
					opacity: 0.7
				}
			});
			const hoverText = this.hoverText = new zrender.Text({
				style: {
					textFill: "#fff",
					text: "5排3座"
				},
				position: [0, 0]
			});
			hoverRect.hide();
			hoverText.hide();
			zr.add(hoverRect);
			zr.add(hoverText);

			this.bindStageEvent();

		},

		renderFailStage(failMsg) {
			this.destroy();
			const msg = `<div class="stageFailWrap" flex="cross:center main:center"><i class="el-icon-warning"></i><span class="t">${failMsg}</span></div>`;
			$("#seatStageMainContainer").html(msg);
		},
		renderLeftBar(rowArray) {
			const wrap = $("#seatStageLeftBar");
			let html = "";
			rowArray.forEach((item) => {
				html += "<li>" + item + "</li>";
			});
			wrap.html(html);
		},
		showHoverTip(e) {
			const zr = this.ZR;
			if (!zr) return false;
			const target = e.target;
			const { custom_num, entrance } = target.orignData;
			if (typeof custom_num !== "string" || custom_num == "") return false;
			const stageWidth = zr.getWidth();
			const [row, col] = custom_num.split("-");
			const seatText = entrance ? `${row}排${col}座（${entrance}）` : `${row}排${col}座`;
			const _computSeatHeightWidth = (seatText) => {
				let span = document.createElement("span");
				span.innerHTML = seatText;
				span.style.opacity = 0;
				document.body.appendChild(span);
				const width = span.offsetWidth;
				const height = span.offsetHeight;
				document.body.removeChild(span);
				span = null;
				return { tipTextWidth: width, tipTextHeight: height };
			};
			const { tipTextWidth, tipTextHeight } = _computSeatHeightWidth(seatText);
			const tipWrapWidth = tipTextWidth + 20;
			const tipWrapHeight = tipTextHeight + 10;
			const [posX, posY] = target.position;
			const hoverRect = this.hoverRect;
			const hoverText = this.hoverText;
			let x = posX - (tipWrapWidth - seatWidth) / 2;
			let y = posY - tipWrapHeight;
			//不要超过边界
			if (x < 0) x = 0;
			if (x + tipWrapWidth > stageWidth) {
				x = stageWidth - tipWrapWidth - 5;
			}
			if (y < 0) y = seatHeight + tipTextHeight;
			hoverRect.show();
			hoverText.show();
			hoverRect.animateTo({
				shape: {
					x: x,
					y: y - 5,
					width: tipWrapWidth,
					height: tipWrapHeight
				}
			}, 100);
			hoverText.attr({ style: { text: seatText } }).animateTo({
				position: [
					x + ((tipWrapWidth - tipTextWidth) / 2),
					y + (tipWrapHeight - tipTextHeight - 6) / 2
				]
			}, 100);
		},
		hideHoverTip(e) {
			const hoverRect = this.hoverRect;
			const hoverText = this.hoverText;
			hoverRect.hide();
			hoverText.hide();
		},

		computeStageWH() {
			const rowHead = this.rowHead;
			const colNum = this.maxColNum;
			const height = (seatHeight + seatDistance) * rowHead.length;
			const width = (seatWidth + seatDistance) * colNum;
			return { width, height };
		},
		initXScroll() {

			if (!document.getElementById("seatScrollWrap") || !document.getElementById("seatStageLeftBarWrap")) return false;


			//座位区域的XScaroll
			const seatScroll = this.seatAreaScroll = new XScroll({
				renderTo: "#seatScrollWrap",
				scrollbarX: false, //横向滚动条
				scrollbarY: false, //竖向滚动条
				lockX: false, //是否锁住横向滚动
				lockY: false,  //是否锁住竖向滚动
				useTransition: true
			});

			const MinScale = this.getMinScale(seatScroll);

			const seatAreaScale = this.seatAreaScale = new ScalePlugin({
				minScale: MinScale,
				maxScale: 1,
				duration: 200
			});
			seatScroll.plug(this.seatAreaScale);
			seatScroll.render();


			//座位排号导航的XScroll
			const rowBarScroll = this.rowBarScroll = new XScroll({
				renderTo: "#seatStageLeftBarWrap",
				scrollbarX: false, //横向滚动条
				scrollbarY: false, //竖向滚动条
				lockX: true, //是否锁住横向滚动
				lockY: false,  //是否锁住竖向滚动
				useTransition: true
			});
			const rowBarScale = this.rowBarScale = new ScalePlugin({
				minScale: MinScale,
				maxScale: 1,
				duration: 200
			});
			rowBarScroll.plug(rowBarScale);
			rowBarScroll.render();

			//初始化缩放，显示整个区域
			// this.seatAreaScale.scaleTo(MinScale, 0, 0);
			// this.rowBarScale.scaleTo(MinScale, 0.5, 0);


			//事件绑定(当座位区域滚动和缩放时，侧边排号导航跟随之)
			//滚动
			seatScroll.on("scroll", (e) => {
				rowBarScroll.scrollTo(0, e.scrollTop);
			});

			seatAreaScale.on("scale", (e) => {
				rowBarScale.scaleTo(e.scale, 0.5, e.origin.y);
			});
		},
		//销毁scroll插件
		destroyScroll() {
			if (this.seatAreaScroll) {
				this.seatAreaScroll.destroy();
				this.seatAreaScroll = null;
			}
			if (this.rowBarScroll) {
				this.rowBarScroll.destroy();
				this.rowBarScroll = null;
			}
		},
		//销毁舞台
		destroyStage() {
			if (this.ZR) {
				this.ZR.dispose();
				this.ZR = null;
			}
		},
		destroy() {
			this.destroyScroll();
			this.destroyStage();
			$("#seatStageMainContainer").html("");
		},
		refreshScroll() {
			if (!document.getElementById("seatScrollWrap") || !document.getElementById("seatStageLeftBarWrap")) {
				return false;
			}
			if (this.seatAreaScroll) {
				this.seatAreaScroll.resetSize();
			}
			if (this.rowBarScroll) {
				this.rowBarScroll.resetSize();
			}
		},
		lockScroll() {
			const seatScroll = this.seatAreaScroll;
			if (!seatScroll) return false;
			seatScroll.userConfig.lockX = true;
			seatScroll.userConfig.lockY = true;
		},
		refreshLockScroll() {
			const seatScroll = this.seatAreaScroll;
			if (!seatScroll) return false;
			seatScroll.userConfig.lockX = false;
			seatScroll.userConfig.lockY = false;
		},
		getMinScale: function(scrollInstance) {
			var $content = $("#seatStageMainContainer");

			var sWidth = scrollInstance.width; //scroll区域宽
			var sHeight = scrollInstance.height;
			var cWidth = $content.width();  //内容宽
			var cHeight = $content.height();

			return Math.min(sWidth / cWidth, sHeight / cHeight);
		},
		/**
		 * 选中/取消某个座位
		 * @param {object} seat
		 */
		selectSeat(seat) {
			if (seat && seat.orignData && seat.orignData.target == "seatImage") { //如果点击的是座位图片
				const orignData = seat.orignData;
				let selected = seat.selected;
				const { status, col_id, row_id, _v_row_id, custom_num, seat_id } = orignData;
				//0=空闲 1=预留 2=锁定 3=已售出 4=已退 5=不可售
				if (this.checkEnable(status)) {
					selected = !selected;
					seat.attr("selected", selected);
					seat.attr("style", { image: selected ? selectSrc : unSelectSrc });

					if (selected) { //选中
						const data = {
							customNum: custom_num,
							seatID: seat_id
						};
						this.updateSelectedList({ type: "add", list: data });
					} else { //取消选择
						this.updateSelectedList({ type: "remove", list: seat_id });
					}
				}
			}
		},
		/**
		 * 批量选中/取消座位
		 * @param {array} seatArr 座位数组
		 * @param {boolean} select  选中: selected==true   取消选择: selected==false
		 */
		groupSwitchSeat(seatArr, select) {
			if (!seatArr || seatArr.length == 0) return false;
			const availSeatArr = seatArr.filter((seat) => seat.orignData);
			const seatIDArr = availSeatArr.map((seat) => {
				return seat.orignData.seat_id;
			});
			this.ZR.storage.getDisplayList().forEach((seat) => {
				const orignData = seat.orignData;
				if (!orignData) return false;
				const { seat_id, custom_num, status, target } = orignData;
				const selected = seat.selected;
				//0=空闲 1=预留 2=锁定 3=已售出 4=已退 5=不可售
				if (!target || target != "seatImage") return false;
				if (!this.checkEnable(status)) return false;
				if (seatIDArr.includes(seat_id)) {
					if (select) { //选择
						if (!selected) {
							seat.attr("selected", true);
							seat.attr("style", { image: selectSrc });
						}
					} else { //取消选择
						if (selected) {
							seat.attr("selected", false);
							seat.attr("style", { image: unSelectSrc });
						}
					}
				}
			});
			const arr = availSeatArr.map((item) => {
				const { custom_num, seat_id } = item.orignData;
				return {
					customNum: custom_num,
					seatID: seat_id
				};
			});
			this.updateSelectedList({
				type: select ? "add" : "remove",
				list: select ? arr : arr.map((item) => item.seatID)
			});
		},
		//点击底部已选区域里的删除按钮
		deleteSelectedSeat(seat) {
			const seatID = seat.seatID;
			const zr = this.ZR;
			if (!zr) return false;
			const seatList = zr.storage.getDisplayList();
			seatList.forEach((item) => {
				const { seat_id } = item.orignData;
				if (seat_id == seatID) {
					item.attr("selected", false);
					item.attr("style", { image: unSelectSrc });
				}
			});
			this.updateSelectedList({ type: "remove", list: seatID });
		},
		//点击底部已选区域里的全部取消按钮
		deleteAllSelectedSeat() {
			this.$confirm("确定要全部取消已选中的位座吗？").then(() => {
				const zr = this.ZR;
				if (!zr) return false;
				const seatIDs = this.selectedList.map((item) => item.seatID);
				const seatList = zr.storage.getDisplayList();
				seatList.forEach((item) => {
					const { seat_id } = item.orignData;
					if (seatIDs.includes(seat_id)) {
						item.attr("selected", false);
						item.attr("style", { image: unSelectSrc });
					}
				});
				this.updateSelectedList({ type: "empty" });
			}).catch(() => {
			});
		},

		/**
		 * 判断某个位置是否可操作
		 * status: 0=空闲 1=预留 2=锁定 3=已售出 4=已退 5=不可售
		 */
		checkEnable(status) {
			if (status == 0 || status == 4) return true;
			return false;
		}
	}
};
