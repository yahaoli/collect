<template>
	<el-dialog :visible.sync="showStatus"
			   custom-class="setting-box"
			   width="80%"
			   title="设置"
			   :close-on-click-modal="false"
			   :before-close="beforeClose"
			   @close="closeWindow">
		<main v-if="$store.getters.enterShow" class="enter-box" flex="main:center cross:center">
			<div flex="main:center cross:center">
				<span>请输入密码：</span>
				<div class="el-input">
					<input class="el-input__inner"
						   placeholder="请输入密码"
						   @keyup.enter="enterKey"
						   ref="input"
						   v-model="key"
						   type="password"/>
				</div>
				<span><el-button type="primary" @click="enterKey">确定</el-button></span>
			</div>
		</main>
		<main v-if="!$store.getters.enterShow" class="setting">
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">功能开启：</el-col>
				<el-col :span="19">
					<el-checkbox-group v-model="data.option">
						<el-checkbox v-for="(item,index) in data.options"
									 :key="index"
									 :label="item.type"
									 :disabled="item.disabled"
									 name="options">{{item.name}}
						</el-checkbox>
					</el-checkbox-group>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">套票打印模式：</el-col>
				<el-col :span="19">
					<el-radio-group v-model="data.set_ticket_checked">
						<el-radio v-for="(item,index)  in data.set_tickets"
								  :label="item.type"
								  :key="index"
								  :disabled="item.disabled"
								  name="options">{{item.name}}
						</el-radio>
					</el-radio-group>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">移动支付设备类型</el-col>
				<el-col :span="19">
					<el-radio-group v-model="data.mobile_pay_checked">
						<el-radio v-for="(item,index)  in data.mobile_pay_type"
								  :label="item.type"
								  :key="index"
								  :disabled="item.disabled"
								  name="options">{{item.name}}
						</el-radio>
					</el-radio-group>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">支付类型：</el-col>
				<el-col :span="19">
					<el-checkbox-group v-model="data.pay_type">
						<el-checkbox v-for="(item,index) in data.pay_type_list"
									 :key="index"
									 :label="item.type"
									 :disabled="item.disabled"
									 name="options">{{item.name}}
						</el-checkbox>
					</el-checkbox-group>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">门票打印机：</el-col>
				<el-col :span="19">
					<el-select no-data-text="读取列表失败，请重新开启服务后连接" v-model="data.entrance_ticket" placeholder="请选择">
						<el-option v-for="(item,index) in data.print_list"
								   :key="index"
								   :disabled="item.disabled"
								   :label="item.printname"
								   :value="item.printname">
						</el-option>
					</el-select>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">门票打印机2：</el-col>
				<el-col class="small" :span="19">
					<el-select no-data-text="读取列表失败，请重新开启服务后连接" v-model="data.entrance_ticket2" placeholder="请选择">
						<el-option v-for="(item,index) in data.print_list"
								   :key="index"
								   :disabled="item.disabled"
								   :label="item.printname"
								   :value="item.printname">
						</el-option>
					</el-select>
					<el-select v-model="data.product" popper-class="product"
							   value-key="id" filterable placeholder="请选择">
						<el-option v-for="(item,index) in data.products"
								   :key="index"
								   :label="item.title"
								   :value="item">
						</el-option>
					</el-select>
					<el-button class="refresh" :loading="textLoading" @click="getProducts(true)" type="text">刷新
					</el-button>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">发票打印机：</el-col>
				<el-col :span="19">
					<el-select no-data-text="读取列表失败，请重新开启服务后连接" v-model="data.invoice_print" placeholder="请选择">
						<el-option v-for="(item,index) in data.print_list"
								   :key="index"
								   :disabled="item.disabled"
								   :label="item.printname"
								   :value="item.printname">
						</el-option>
					</el-select>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">身份证读卡器类型：</el-col>
				<el-col :span="19">
					<el-radio-group v-model="data.id_read_type">
						<el-radio v-for="(item,index)  in data.id_read_type_list"
								  :label="item.type"
								  :key="index"
								  :disabled="item.disabled"
								  name="options">{{item.name}}
						</el-radio>
					</el-radio-group>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">购票信息输入项：</el-col>
				<el-col :span="19">
					<el-checkbox-group v-model="data.tickets_buy_insert">
						<el-checkbox v-for="(item,index) in data.tickets_buy_insert_list"
									 :key="index"
									 :label="item.key"
									 :disabled="item.disabled"
									 name="options">{{item.name}}
						</el-checkbox>
					</el-checkbox-group>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">提交身份证信息不打门票：</el-col>
				<el-col :span="5">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.id_no_ticket_disabled"
							   v-model="data.id_no_ticket"></el-switch>
				</el-col>
				<el-col :span="7">现金支付二次确认：</el-col>
				<el-col :span="7">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.cash_confirm_disabled"
							   v-model="data.cash_confirm"></el-switch>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">购票成功后返回散客状态：</el-col>
				<el-col :span="5">
					<el-switch :active-value="1" :inactive-value="0"
							   :disabled="data.tickets_buy_return_tourist_status_disabled"
							   v-model="data.tickets_buy_return_tourist_status"></el-switch>
				</el-col>
				<el-col :span="7">门票打印确认：</el-col>
				<el-col :span="7">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.ticket_print_disabled"
							   v-model="data.ticket_print"></el-switch>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">购票成功后自动打印发票：</el-col>
				<el-col :span="5">
					<el-switch :active-value="1" :inactive-value="0"
							   :disabled="data.ticket_buy_print_disabled"
							   v-model="data.ticket_buy_print"></el-switch>
				</el-col>
				<el-col :span="7">合并打印回执单：</el-col>
				<el-col :span="7">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.merge_receipt_disabled"
							   v-model="data.merge_receipt"></el-switch>
				</el-col>
			<!--
				<el-col :span="7">开具电子发票</el-col>
				<el-col :span="7">
					<el-switch 	:active-value="1" :inactive-value="0"
								:disabled="data.ticket_send_open"
							   v-model="data.ticket_btn_send_open"></el-switch>
				</el-col>
			-->
			</el-row>
			 <el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">开启快捷键：</el-col>
				<el-col :span="5">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.shortcutKeys_disabled"
							   v-model="data.shortcutKeys"></el-switch>
				</el-col>
				<el-col :span="7">总社搜索</el-col>
				<el-col :span="7">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.shortcutKeys_disabled"
							   v-model="data.mainAssnSearch"></el-switch>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">祥源会会员：</el-col>
				<el-col :span="5">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.memberSet_disabled"
							   v-model="data.memberSet"></el-switch>
				</el-col>
				<el-col :span="7">找零：</el-col>
				<el-col :span="7">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.changeMoney_disabled"
							   v-model="data.changeMoney"></el-switch>
				</el-col>
			</el-row>
			<el-row type="flex" :gutter="0" justify="space-around">
				<el-col :span="5">客源地开启后必填：</el-col>
				<el-col :span="5">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.originSet_disabled"
							   v-model="data.originSet"></el-switch>
				</el-col>
				<el-col :span="7">票类分组</el-col>
				<el-col :span="7">
					<el-switch :active-value="1" :inactive-value="0" :disabled="data.ticketGroup_disabled"
							   v-model="data.ticketGroup"></el-switch>
				</el-col>
			</el-row>
		</main>
		<div v-if="!$store.getters.enterShow" slot="footer" class="dialog-footer">
			<el-button @click="settingReset" type="warning" plain>重置</el-button>
			<el-button @click="submit" type="primary">提交</el-button>
		</div>
	</el-dialog>
</template>

<script>
	import * as Type from '../../store/mutation-types';
	import {isObject} from "lodash";

	// 获取当前的window对象
	export default {
		name: "Setting",
		created () {
			this.init();
		},
		data () {
			let checkList = [], {data, repertory} = this.$store.state.setting;
			// console.log(newData);
			for (let prop in data) {
				if (!data.hasOwnProperty(prop)) continue;
				checkList.push(prop)
			}
			// console.log(newData);
			return {
				showList: [],
				changeTypeList: [],
				data: {
					...repertory
				},
				showStatus: false,
				checkList,
				key: '',
				textLoading: false,
			}
		},
		mounted () {
			this.$nextTick(() => {
				this.$refs.input && this.$refs.input.focus();
			})
		},
		methods: {
			beforeClose (done) {
				this.checkChangeStatus();
				if (!this.changeTypeList.length) return done();
				this.$confirm('设置已修改, 是否放弃?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					// center: true
				}).then(() => {
					done()
				}).catch(e => {
					console.log(e);
				})
			},
			init () {
				this.getProducts();
				this.$set(this.$data, 'data', Object.assign({}, this.$store.state.setting.data, this.$store.state.setting.repertory));
				this.showStatus = true;
				this.changeTypeList = [];
			},
			closeWindow () {
				this.$store.commit(Type.CHANGE_SETTING_STATUS, false);
			},
			/**
			 *
			 * @author xiaoqiang
			 * @date 2018/5/11
			 * @description: 获取产品列表
			 * @param {Boolean} [flag]  - true 强制刷新 flag
			 * @default false 不强制刷新
			 * @return undefined
			 * @example
			 *   this.getProducts(true)
			 *   this.getProducts()
			 *
			 */
			getProducts (flag = false) {
				if (this.textLoading) return;
				this.textLoading = true;
				this.$store.dispatch('getScenicList', {flag}).then((products) => {
					// console.log(products);
					this.data = {...this.data, ...{products}};
					flag && this.$message.success('产品刷新成功');
				}).catch(e => {
					console.log(e);
					this.$message.error(e);
				}).finally(() => {
					setTimeout(() => {
						this.textLoading = false;
					}, 1000)
				})
			},
			// 提交修改信息
			submit () {
				this.checkChangeStatus();
				// console.log(this.changeTypeList);
				if (!this.changeTypeList.length) {
					return this.$message.warning('当前设置未修改');
				}
				if (!this.data.pay_type.length) return this.$message.error('请选择至少一种支付方式');
				this.$confirm('此操作将重启软件, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					// center: true
				}).then(() => {
					this.$store.dispatch('submitAction', this.$data).then((res) => {
						this.$message({
							message: res.msg || '修改成功',
							type: 'success',
						});
					}).catch(err => {
						console.log(err);
						this.$message({
							message: err.toString() || '修改失败',
							type: 'error'
						});
					});
				}).catch(() => {
					// console.log(e);
					this.$message({
						message: '取消设置',
						type: 'warning'
					});
				});
			},
			// 判断当前修改状态
			checkChangeStatus () {
				for (let i = 0; i < this.checkList.length; i++) {
					this.changeStatusGet(this.checkList[i])
				}
			},
			// 修改文件放入changeTypeList 数组，未修改移出 changeTypeList
			changeStatusGet (STR) {
				let data = this.$store.state.setting.data[STR], /*this.$store.getters.settingData[STR]*/
					val = this.data[STR];
				// console.log(STR, data, val);

				if (Array.isArray(val)) {
					if (val.length !== data.length) {
						this.changeTypeList.indexOf(STR) >= 0 || this.changeTypeList.push(STR);
						return;
					}
					for (let i = 0; i < val.length; i++) {
						if (data.indexOf(val[i]) < 0) {
							this.changeTypeList.indexOf(STR) >= 0 || this.changeTypeList.push(STR);
							return
						}
					}
					this.changeTypeList.indexOf(STR) >= 0 && (this.changeTypeList.splice(this.changeTypeList.indexOf(STR), 1));
				} else if (typeof (val) === 'string' || typeof (val) === 'boolean' || typeof (val) === 'number') {
					if (data === 'undefined' || typeof (data) === 'undefined') {
						if (val === 0) {
							this.changeTypeList.indexOf(STR) >= 0 && (this.changeTypeList.splice(this.changeTypeList.indexOf(STR), 1));
						} else {
							this.changeTypeList.indexOf(STR) >= 0 || this.changeTypeList.push(STR);
						}
						return
					}
					if (val === data) {
						this.changeTypeList.indexOf(STR) >= 0 && (this.changeTypeList.splice(this.changeTypeList.indexOf(STR), 1));
					} else {
						this.changeTypeList.indexOf(STR) >= 0 || this.changeTypeList.push(STR);
					}

				} else if (isObject(val)) {
					if (JSON.stringify(val) == JSON.stringify(data)) {
						this.changeTypeList.indexOf(STR) >= 0 && (this.changeTypeList.splice(this.changeTypeList.indexOf(STR), 1));
					} else {
						this.changeTypeList.indexOf(STR) >= 0 || this.changeTypeList.push(STR);
					}
				} else {
					this.changeTypeList.indexOf(STR) >= 0 || this.changeTypeList.push(STR);
				}


			},
			enterKey () {
				if (!this.key) return this.$message.error('密码不能为空');
				this.$store.dispatch('enterSettingKeyAction', this.key).then(() => {
					// this.$message.info('进入设置');
				}).catch(() => {
					this.$message.error('输入错误');
					this.$nextTick(() => {
						this.$refs.input && this.$refs.input.select();
					});
				});
			},
			async settingReset () {
				this.$confirm('此操作将丢失所有个人设置, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					// center: true
				}).then(
					() => {
						this.$store.dispatch('resetSettingAction').then((res) => {
							this.$message({
								message: res.msg || '重置成功',
								type: 'success',
							});
						}).catch(err => {
							console.log(err);
							this.$message({
								message: err.toString() || '重置失败',
								type: 'error'
							});
						});
					}
				).catch(() => {
					// console.log(e);
					this.$message({
						message: '取消设置',
						type: 'warning'
					});
				})
			}
		},
		watch: {}
	}
</script>
<style lang="scss">
	.el-select-dropdown.product {
		max-width: 500px;
		margin: 0 auto;
		/*background: #000;*/
	}

	.setting-box {
		max-width: 100vh;
	}


</style>
<style lang="scss" scoped>
	.setting {
		background: #fff;
		height: 50vh;
		overflow-y: scroll;
		padding: 10px 0 20px 0;
		.el-row {
			padding: 2px 5%;
			line-height: 40px;
			.el-col {
				font-size: 14px;
				&:first-of-type {
					text-align: left;
					color: #000;
					min-width: 12em;
					white-space: nowrap;
				}
				&:nth-of-type(3) {
					text-align: right;
					font-size: 14px;
					min-width: 7em;
				}
				.el-select {
					width: 60%;
					min-width: 300px;
					max-width: 600px;
				}
				.el-checkbox, .el-radio-group, .el-select, .el-switch {
					margin: 0 10px;
				}
				/*.el-checkbox {
					&:not(:first-of-type) {
						margin-left: 20px;
					}
				}*/
				.refresh {
					/*width: 1em;*/
				}
				.el-radio-group {
					line-height: inherit;
					.el-radio {
						line-height: inherit;
					}
				}
				&.small {
					.el-select {
						width: 28.75%;
						min-width: 120px;
						max-width: 600px;
						&:not(:first-of-type) {
							margin-left: 1%;
						}
						&:not(:last-of-type) {
							margin-right: 1%;
						}
					}
				}
			}
		}
	}

	.enter-box {
		height: 64vh;
		text-align: center;
		& > div {
			padding: 0 0;
			transform: translateY(-6vh);
		}
		span {
			display: inline-block;
			/*height: 2em;*/
			line-height: 2em;
			width: 6em;
			font: 18px / 1 Microsoft Yahei, Tahoma, Helvetica, Arial, "\5B8B\4F53", sans-serif;
		}
		@media screen and (max-width: 500px) {
			& > div {
				span {
					width: 4em;
				}
				span:first-child {
					display: none;
				}

			}
		}
		.el-input {
			width: 20vw;
			min-width: 120px;
			display: inline-block;
		}

		:not(:first-child) {
			margin-left: 10px;
		}
	}
</style>
