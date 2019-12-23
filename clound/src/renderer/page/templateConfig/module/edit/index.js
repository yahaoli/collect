
import "./index.scss";

import basePrint from "@/util/basePrint";
import Message from "@/util/message";
import *  as Service from "../../service"
import { cloneDeep, isEqual } from "lodash";

const $ = require('jquery');
const Draggabilly = require('draggabilly');


// 计算电脑PPI
let PPI = { x: 96, y: 96 }
function getPPI () {
	let PPI = { x: 96, y: 96 };
	if (window.screen.deviceXDPI) {
		PPI.x = window.screen.deviceXDPI;
		PPI.y = window.screen.deviceYDPI;
	}
	else {
		var tmpNode = document.createElement("DIV");
		tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
		document.body.appendChild(tmpNode);
		PPI.x = parseInt(tmpNode.offsetWidth);
		PPI.y = parseInt(tmpNode.offsetHeight);
		tmpNode.parentNode.removeChild(tmpNode);
	}
	return PPI;
}
PPI = getPPI()


export default {
	template: require("./index.xtpl"),


	data () {
		return {
			activeList: [],
			draggieList: [],
			copyList: [],
			currentEditPlan: '',
			currentUsePlan: '',
		}
	},

	props: {
		type: {
			type: Number,
			default: 1,
		},
		toolList: {
			type: Array,
			default: () => []
		},
		planList: {
			type: Array,
			default: () => []
		},
		initCurrentUsePlan: {
			type: [Number, String],
			default: ''
		}
	},


	watch: {
		initCurrentUsePlan: function () {
			// 如果有当前采用的方案，将其设置成当前编辑的方案
			if (this.currentEditPlan >= 0) {
				this.currentEditPlan = this.initCurrentUsePlan
				this.currentUsePlan = this.initCurrentUsePlan
				this.loadPlan(this.initCurrentUsePlan)
			}
		},
	},

	mounted () {

		// 初始化容器宽度
		// let containerWidth = Math.floor(PPI.x * 210 / 25.4);
		// let containerHeight = Math.floor(containerWidth / 2);
		// 写死高度和宽度
		let containerWidth = Math.floor(this.mm2px(191));
		let containerHeight = Math.floor(this.mm2px(101));
		console.log(containerWidth,containerHeight)
		let that = this;
		let contentDom = document.getElementById('contentContainer');
		contentDom.style.width = containerWidth + 'px';
		contentDom.style.height = containerHeight + 'px';

		// 监听工具栏
		document.querySelectorAll('#toolContainer .toolItem').forEach((item, index) => {
			let ariaIndex = item.getAttribute('aria-index').split(',')
			let optionItem = that.toolList[parseInt(ariaIndex[0])].data[parseInt(ariaIndex[1])];
			let type = optionItem.type;
			let optionDraggie = new Draggabilly(item, {})	//工具栏的Draggie
			let originDelta;	//初始偏移

			optionDraggie.on('dragStart', function (event, pointer) {
				//样式处理
				item.style.opacity = 0.65;
				item.style.zIndex = 10;
				//计算初始偏移
				originDelta = { y: item.offsetTop - contentDom.offsetTop, x: item.offsetLeft - contentDom.offsetLeft }
			})
			optionDraggie.on('dragEnd', function (event, pointer) {
				//样式处理
				item.style.opacity = 1;
				item.style.zIndex = '';

				//是否可编辑方案
				if (that.planList.length == 0) {
					that.editPlanName()
					// 恢复工具控件的位置
					optionDraggie.setPosition(0, 0)
					return false
				}

				//进入有效区域
				if (that.isOverlap($(item), $('#contentContainer'))) {
					// 只能有一个表格
					if (type == 'table' && that.activeList.some(son => son.type == 'table')) {
						that.$message.error('只允许放入一个销售表单')
						optionDraggie.setPosition(0, 0)
						return false
					}

					// 计算最终偏移的相对坐标
					let finalDelta = { x: optionDraggie.position.x, y: optionDraggie.position.y }
					let relativePosition = {
						x: (finalDelta.x + originDelta.x > 0 && type != 'table') ? finalDelta.x + originDelta.x : 0,
						y: finalDelta.y + originDelta.y > 0 ? finalDelta.y + originDelta.y : 0,
					}
					// 生成初始数据
					let timestamp = new Date().getTime();
					let initData = [...that.activeList, {
						printseat: 1,
						id: timestamp,
						font_size: 12,
						font_type: 0,
						lockDirection: type == 'table' ? 'y' : 'free',
						// x: relativePosition.x,
						// y: relativePosition.y,
						position: {
							x: relativePosition.x,
							y: relativePosition.y,
						},
						...optionItem,
					}]

					if (type == 'table') {
						initData = [...that.activeList, {
							id: timestamp,
							lockDirection: type == 'table' ? 'y' : 'free',
							// x: relativePosition.x,
							// y: relativePosition.y,
							position: {
								x: relativePosition.x,
								y: relativePosition.y,
							},
							...optionItem,
						}]
					} else if (type == 'qrcode') {
						initData = [...that.activeList, {
							id: timestamp,
							codeSize: 4,
							lockDirection: type == 'table' ? 'y' : 'free',
							// x: relativePosition.x,
							// y: relativePosition.y,
							position: {
								x: relativePosition.x,
								y: relativePosition.y,
							},
							qrcodex: 40,
							qrcodey: 40,
							selectList: [{ name: '订单号', value: 'UUordernum' }, { name: '凭证号', value: 'UrlBarcode' }],
							...optionItem,
						}]
					} else if (type == 'barcode') {
						initData = [...that.activeList, {
							id: timestamp,
							codeSize: 4,
							lockDirection: type == 'table' ? 'y' : 'free',
							// x: relativePosition.x,
							// y: relativePosition.y,
							position: {
								x: relativePosition.x,
								y: relativePosition.y,
							},
							selectList: [{ name: '订单号', value: 'UUordernum' }, { name: '凭证号', value: 'UrlBarcode' }],
							qrcodex: 200,
							qrcodey: 40,
							...optionItem,
						}]
					} else if (type == 'dashed') {
						initData = [...that.activeList, {
							id: timestamp,
							dashedLength: 4,
							lockDirection: type == 'table' ? 'y' : 'free',
							// x: relativePosition.x,
							// y: relativePosition.y,
							position: {
								x: relativePosition.x,
								y: relativePosition.y,
							},
							qrcodex: relativePosition.x + 160,
							qrcodey: 0,
							...optionItem,
						}]
					} else if (type == 'text') {
						initData.printseat = '0';
						initData.content = '';
					}

					that.activeList = initData;

					// 对激活的空间进行监听
					that.$nextTick(() => {
						let Dom = document.getElementById(timestamp);
						let activeDraggie = new Draggabilly(Dom, { containment: '#contentContainer' })	//被激活的Draggie
						if (type == 'table') {
							relativePosition.x = 0;
						}
						activeDraggie.setPosition(relativePosition.x, relativePosition.y)
						activeDraggie.on('dragStart', function (event, pointer) {
							document.querySelector('.el-popover').style.display = 'none';
						})
						activeDraggie.on('dragEnd', function (event, pointer) {
							document.querySelector('.el-popover').style.opacity = ''
							let currentIndex = that.activeList.length - 1;		//对于初始化过程中进入区域的永远都是当前的lastIndex
							if (type == 'table') {
								that.$set(that.$data.activeList[currentIndex], 'position', { x: 0, y: activeDraggie.position.y })
								// that.activeList[currentIndex].x = 0
								// that.activeList[currentIndex].y = activeDraggie.position.y
							} else {
								that.$set(that.$data.activeList[currentIndex], 'position', activeDraggie.position)
								// that.activeList[currentIndex].x = activeDraggie.position.x
								// that.activeList[currentIndex].y = activeDraggie.position.y
							}

						})
						that.draggieList.push(activeDraggie)
					})
				}

				// 恢复工具控件的位置
				optionDraggie.setPosition(0, 0)


			})
		})

	},

	methods: {
		isOverlap (objOne, objTwo) {
			var offsetOne = objOne.offset();
			var offsetTwo = objTwo.offset();
			var x1 = offsetOne.left;
			var y1 = offsetOne.top;
			var x2 = x1 + objOne.width();
			var y2 = y1 + objOne.height();

			var x3 = offsetTwo.left;
			var y3 = offsetTwo.top;
			var x4 = x3 + objTwo.width();
			var y4 = y3 + objTwo.height();

			var zx = Math.abs(x1 + x2 - x3 - x4);
			var x = Math.abs(x1 - x2) + Math.abs(x3 - x4);
			var zy = Math.abs(y1 + y2 - y3 - y4);
			var y = Math.abs(y1 - y2) + Math.abs(y3 - y4);
			return (zx <= x && zy <= y);
		},

		// ************************************************选项操作部分**************************************************
		// 二维码、条形码尺寸
		codeSizeChange (index) {
			let item = this.activeList[index];
			if (item.type == 'qrcode') {
				document.getElementById(item.id).querySelector('.content').style.width = `${item.codeSize * 10}px`;
				document.getElementById(item.id).querySelector('.content').style.height = `${item.codeSize * 10}px`;
				this.$set(this.$data.activeList[index], 'qrcodex', item.codeSize * 10)
				this.$set(this.$data.activeList[index], 'qrcodey', item.codeSize * 10)
			} else if (item.type == 'barcode') {
				document.getElementById(item.id).querySelector('.content').style.width = `${item.codeSize * 50}px`;
				document.getElementById(item.id).querySelector('.content').style.height = `${item.codeSize * 10}px`;
				this.$set(this.$data.activeList[index], 'qrcodex', item.codeSize * 50)
				this.$set(this.$data.activeList[index], 'qrcodey', item.codeSize * 10)
			}

		},
		//虚线 长度
		dashedLengthChange (index) {
			let item = this.activeList[index];
			document.getElementById(item.id).querySelector('.content').style.width = `${item.dashedLength * 40}px`;
			this.$set(this.$data.activeList[index], 'qrcodex', item.dashedLength * 40)
		},

		// 字体大小
		fontSizeChange (index) {
			let item = this.activeList[index];
			document.getElementById(item.id).style.fontSize = `${item.font_size}px`;
		},

		// 字体样式
		fontTypeChange (index) {
			let item = this.activeList[index];
			switch (item.font_type) {
				case 0:
					document.getElementById(item.id).style.fontWeight = 'normal';
					document.getElementById(item.id).style.fontStyle = 'normal';
					document.getElementById(item.id).style.textDecoration = 'none';
					break;
				case 1:
					document.getElementById(item.id).style.fontWeight = 'bold';
					document.getElementById(item.id).style.fontStyle = 'normal';
					document.getElementById(item.id).style.textDecoration = 'none';
					break;
				case 2:
					document.getElementById(item.id).style.fontWeight = 'normal';
					document.getElementById(item.id).style.fontStyle = 'italic';
					document.getElementById(item.id).style.textDecoration = 'none';
					break;
				case 4:
					document.getElementById(item.id).style.fontWeight = 'normal';
					document.getElementById(item.id).style.fontStyle = 'normal';
					document.getElementById(item.id).style.textDecoration = 'underline';
					break;
				case 8:
					document.getElementById(item.id).style.fontWeight = 'normal';
					document.getElementById(item.id).style.fontStyle = 'normal';
					document.getElementById(item.id).style.textDecoration = 'line-through';
					break;
				default:
					document.getElementById(item.id).style.fontWeight = 'normal';
					document.getElementById(item.id).style.fontStyle = 'normal';
					document.getElementById(item.id).style.textDecoration = 'none';
			}
		},

		// 移动方向锁定
		lockDirectionChange (index) {
			this.draggieList[index].options.axis = this.activeList[index].lockDirection == 'free' ? '' : this.activeList[index].lockDirection
		},

		// 删除
		deleteItem (index) {
			this.activeList.splice(index, 1)
			this.draggieList[index].destroy()
			this.draggieList.splice(index, 1)
		},


		// ************************************************方案操作部分**************************************************
		// 载入方案
		loadPlan (index) {
			let that = this;
			// 清空画布
			that.draggieList.forEach(item => {
				item.destroy()
			});
			that.draggieList = [];
			that.activeList = this.planList[index].content;
			// 生成新的实例
			this.$nextTick(function () {
				that.activeList.forEach((item, index) => {
					let Dom = document.getElementById(item.id);
					let activeDraggie = new Draggabilly(Dom, { containment: '#contentContainer' })	//被激活的Draggie
					activeDraggie.setPosition(item.position.x, item.position.y)
					// activeDraggie.setPosition(item.x, item.y)
					activeDraggie.on('dragStart', function (event, pointer) {
						document.querySelector('.el-popover').style.display = 'none';
					})
					activeDraggie.on('dragEnd', function (event, pointer) {
						document.querySelector('.el-popover').style.opacity = ''
						if (item.type == 'table') {
							that.$set(that.$data.activeList[index], 'position', { x: 0, y: activeDraggie.position.y })
							// that.activeList[index].x = 0
							// that.activeList[index].y = activeDraggie.position.y
						} else {
							that.$set(that.$data.activeList[index], 'position', activeDraggie.position)
							// that.activeList[index].x = activeDraggie.position.x
							// that.activeList[index].y = activeDraggie.position.y
						}
					})

					that.draggieList.push(activeDraggie)

					//选项重新组装
					that.lockDirectionChange(index)
					if (item.type == 'qrcode' || item.type == 'barcode') {
						that.codeSizeChange(index)
					} else if (item.type == 'dashed') {
						that.dashedLengthChange(index)
					} else {
						that.fontSizeChange(index);
						that.fontTypeChange(index);
					}

				})
				that.currentEditPlan = index
			})

		},

		// 清空画布
		clear () {
			let that = this;
			this.$confirm('确认要清空画布?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				that.draggieList.forEach(item => {
					item.destroy()
				});
				that.draggieList = [];
				that.activeList = [];
			}).catch((err) => {
			});
		},

		// 保存方案
		save () {
			let that = this;
			if (this.currentEditPlan !== '') {
				this.$store.dispatch("updatePageLoading", true);
				Service.savePlan({
					sid: this.$store.state.userInfo.parent_member_id,
					mid: this.$store.state.userInfo.member_id,
					id: this.planList[this.currentEditPlan].id,
					type: this.type,
					title: this.planList[this.currentEditPlan].title,
					content: this.activeList,
				}).then(res => {
					this.$store.dispatch("updatePageLoading", false);
					if (res.code == 200) {
						let newPlanList = cloneDeep(that.planList);
						newPlanList[this.currentEditPlan].title = that.planList[that.currentEditPlan].title;
						newPlanList[this.currentEditPlan].content = that.activeList;
						that.modifyPlanList(newPlanList)
						Message.success('保存成功！')
						// 重新渲染一次视图来使用户发现修改过程中没有成功的选项
						that.$nextTick(function () {
							that.loadPlan(that.currentEditPlan)
						})
					} else {
						Message.alert(res.msg, '保存失败')
					}
				}).catch(err => {
					this.$store.dispatch("updatePageLoading", false);
					Message.alert('请求出错', '失败')
				})


			} else {
				Message.alert('没有正在编辑的方案', '提示')
			}

		},

		// 方案另存为
		anotherSave () {
			this.editPlanName('anotherSave')
		},

		// 新增加方案名
		planNameChange () {
			let that = this;
			if (this.currentEditPlan === '') {
				Message.alert('没有可以编辑的方案，请先选择方案后重试', '提示')
				return false
			}
			this.$prompt('请输入新的方案名', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputValidator: this.ifRepeatCheck,
				inputErrorMessage: '当前方案名已经存在，请更换'
			}).then(({ value }) => {
				that.$store.dispatch("updatePageLoading", true);
				Service.savePlan({
					sid: that.$store.state.userInfo.parent_member_id,
					mid: that.$store.state.userInfo.member_id,
					id: that.planList[that.currentEditPlan].id,
					type: that.type,
					title: value,
					content: that.activeList,
				}).then(res => {
					that.$store.dispatch("updatePageLoading", false);
					if (res.code == 200) {
						let newPlanList = cloneDeep(that.planList);
						newPlanList[that.currentEditPlan].title = value;
						newPlanList[that.currentEditPlan].content = that.planList[that.currentEditPlan].content;
						that.modifyPlanList(newPlanList)
					} else {
						Message.alert(res.msg || '更改失败')
					}
				}
				).catch(err => {
					that.$store.dispatch("updatePageLoading", false)
					Message.alert('请求出错')

				})

			}).catch((err) => {
				this.$message({
					type: 'info',
					message: '取消输入'
				});
			});
		},

		// 新建方案
		create () {
			let that = this;
			if (this.currentEditPlan !== '' && !isEqual(this.activeList, this.planList[this.currentEditPlan].content)) {
				this.$confirm('当前方案有变动尚未保存，是否要为您保存？', '提示', {
					showClose: false,
					confirmButtonText: '保存',
					cancelButtonText: '不保存',
					type: 'warning'
				}).then((res) => {
					that.save();
					that.editPlanName();
				}).catch((err) => {
					that.editPlanName();
				});
			} else {
				that.editPlanName();
			}
		},

		// 更改当前使用方案
		usePlanChange (index) {
			console.log(index)
			let that = this;
			if (index !== this.currentUsePlan) {
				this.$store.dispatch("updatePageLoading", true);
				Service.usePlanChange({
					fid: this.$store.state.userInfo.member_id,
					id: this.planList[index].id,
					type: this.type
				}).then(res => {
					this.$store.dispatch("updatePageLoading", false);
					if (res.code == 200) {
						that.currentUsePlan = index
						Message.success('变更成功')
					} else {
						Message.alert(res.msg || '变更失败')
					}
				}).catch(err => {
					this.$store.dispatch("updatePageLoading", false);
					console.log(err)
					Message.alert(err || '变更失败')
				})
			}
		},

		// 更改当前编辑方案
		changeCurrentEditPlan (index) {
			console.log(index)
			let that = this;
			if (this.currentEditPlan !== '' && !isEqual(this.activeList, this.planList[this.currentEditPlan].content)) {
				this.$confirm('当前方案有变动尚未保存，是否要为您保存？', '提示', {
					showClose: false,
					confirmButtonText: '保存',
					cancelButtonText: '不保存',
					type: 'warning'
				}).then(() => {
					that.save();
					that.loadPlan(index)
				}).catch((err) => {
					that.loadPlan(index)
				});
			} else {
				that.loadPlan(index)
			}


		},

		// 编辑方案名
		editPlanName (type = 'create') {
			let that = this;
			let text = '请输入方案名';
			if (this.planList.length == 0) {
				text = '您没有可以编辑的方案，将为您新建一个方案，请输入名称'
			}
			this.$prompt(text, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputValidator: this.ifRepeatCheck,
				inputErrorMessage: '当前方案名已经存在，请更换'
			}).then(({ value }) => {
				let fixValue = value.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
				if (type == 'create') {
					this.$store.dispatch("updatePageLoading", true);
					Service.addNewPlan({
						sid: this.$store.state.userInfo.parent_member_id,
						mid: this.$store.state.userInfo.member_id,
						type: this.type,
						title: fixValue,
						content: [],
					}).then(res => {
						this.$store.dispatch("updatePageLoading", false);
						if (res.code == 200) {
							//清空示例监听
							that.draggieList.forEach(item => {
								item.destroy()
							});
							that.draggieList = [];
							that.activeList = [];
							//新建
							let newPlanList = cloneDeep(that.planList);
							newPlanList.push({ title: fixValue, id: res.data.id, content: [] })
							that.currentEditPlan = newPlanList.length - 1
							that.modifyPlanList(newPlanList)
						} else {
							Message.alert(res.msg || '新建失败')
						}
					}).catch(err => {
						Message.alert('请求出错', '错误')
						this.$store.dispatch("updatePageLoading", false)
					})

				} else if (type == 'anotherSave') {
					this.$store.dispatch("updatePageLoading", true);
					Service.addNewPlan({
						sid: this.$store.state.userInfo.parent_member_id,
						mid: this.$store.state.userInfo.member_id,
						type: this.type,
						title: fixValue,
						content: this.activeList,
					}).then(res => {
						this.$store.dispatch("updatePageLoading", false);
						if (res.code == 200) {
							let newPlanList = cloneDeep(that.planList);
							newPlanList.push({ title: fixValue, id: res.data.id, content: that.activeList })
							that.currentEditPlan = newPlanList.length - 1
							that.modifyPlanList(newPlanList)
						} else {
							that.$message.error(res.msg || '新建失败')
						}
					}).catch(err => {
						Message.alert('请求出错', '错误')
						this.$store.dispatch("updatePageLoading", false)
					})

				}

			}).catch((err) => {
				this.$message({
					type: 'info',
					message: '取消输入'
				});
			});
		},

		// 方案名重复检测
		ifRepeatCheck (val) {
			// let value = val.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
			if (val.includes(' ')) {
				return '名字不能含有空格'
			} else if (this.planList.some(item => item.title == val)) {
				return '当前方案名已经存在，请更换'
			} else {
				return true
			}
		},

		// 删除方案
		deletePlan () {
			let that = this;
			if (this.currentEditPlan === this.currentUsePlan) {
				Message.alert('无法删除正在使用中的方案，请更改当前使用方案后重试。', '失败')
				return false
			}
			this.$confirm('此操作将永删除该方案且不可恢复, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$store.dispatch("updatePageLoading", true);
				Service.deletePlan({
					sid: that.$store.state.userInfo.parent_member_id,
					mid: that.$store.state.userInfo.member_id,
					id: that.planList[that.currentEditPlan].id,
					type: that.type,
				}).then(res => {
					this.$store.dispatch("updatePageLoading", false);
					if (res.code == 200) {
						let newPlanList = cloneDeep(that.planList);
						newPlanList.splice(that.currentEditPlan, 1)
						that.modifyPlanList(newPlanList)
						that.currentEditPlan = '';
						that.draggieList.forEach(item => {
							item.destroy()
						});
						that.draggieList = [];
						that.activeList = [];
						that.$message({
							type: 'success',
							message: '删除成功!'
						});
					} else {
						Message.alert(res.msg || '删除失败')
					}
				}).catch(err => {
					this.$store.dispatch("updatePageLoading", false);
					Message.alert('请求出错')
				})

			}).catch((err) => {
				console.log(err)
				that.$message({
					type: 'info',
					message: '已取消删除'
				});
			});
		},

		print () {
			if (this.type == 1) {
				this.$store.dispatch('printReceipt', 24353476)
			} else if (this.type == 2) {
				this.$store.dispatch('printInvoice', 24353248)
			}

		},

		mm2px (val, dir = 'x') {
			if (dir = 'x') {
				return (PPI.x / 25.4) * val
			} else {
				return (PPI.y / 25.4) * val
			}
		},

		// 提交变更
		modifyPlanList (val) {
			this.$emit('modify-planlist', val)
		}
	}

};
