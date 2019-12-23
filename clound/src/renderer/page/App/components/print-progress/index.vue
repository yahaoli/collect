<template>
	<el-dialog
		:close-on-click-modal='false'
		:close-on-press-escape='false'
		:show-close='false'
		:visible.sync="visible">
		<div flex='dir:top' class='container'>
			<h1 flex='main:center' v-if='status == 0' style='color:#409eff;'><i class="el-icon-loading"></i> 打印进行中</h1>
			<h1 flex='main:center' v-if='status == 1 && failTasks.length == 0' style='color:#67c23a;'><i
				class="el-icon-success"></i> 打印完成</h1>
			<h1 flex='main:center' v-if='status == 1 && failTasks.length != 0' style='color:#f56c6c;'><i
				class="el-icon-error"></i> 有票类打印失败</h1>

			<p v-if="status == 0" class='printInfo'>您有 <span style='color:#409eff;font-size:24px;'>{{this.total}}</span>
				张门票要打印，
				正在为您打印第 <span style='color:#67c23a;font-size:24px;'>{{this.finish + this.fail}}</span> 张</p>
			<p v-else class='printInfo'>已完成所有打印任务共 <span style='color:#409eff;font-size:24px;'>{{this.total}}</span> 项，
				其中成功 <span style='color:#67c23a;font-size:24px;'>{{this.finish}}</span> 张，失败
				<span style='color:#f56c6c;font-size:24px;'>{{this.fail}}</span> 张
			</p>

			<el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"
						 v-if='status == 0'></el-progress>
			<el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"
						 v-if='status == 1 && failTasks.length > 0' status="exception"></el-progress>
			<el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"
						 v-if='status == 1 && failTasks.length == 0' status="success"></el-progress>

			<ul class='detailTask'>
				<li flex='main:justify cross:center' v-for="(item,index) in taskList" :key='index'>
					<p style='color:#409eff' v-if='item.status == 0 || item.status == 1 || item.status == -1'>
						{{item.orderInfo.ttitle+'(订单号：'+ item.orderInfo.ordernum+')' }}</p>
					<span style='color:#409eff' v-if='item.status == 0'><i class="el-icon-loading"></i> 打印中</span>
					<span style='color:#67c23a' v-if='item.status == 1'><i class="el-icon-check"></i> 打印完成</span>
					<span style='color:#f56c6c;margin-left:20px;' v-if='item.status == -1'><i class="el-icon-close"></i> {{item.msg || '打印失败'}}</span>

				</li>
			</ul>
		</div>
		<div slot="footer" style="text-align: center">
			<el-button v-if='failTasks.length >= 1 && status==1' style="width: 200px" type="primary" size='medium'
					   @click='printFail'>
				重打印失败任务
			</el-button>
			<el-button v-if='failTasks.length >= 1 && status==1' style="width: 200px" type="warning"
					   :disabled="status == 0" @click='finishPrint(1)'>放弃打印
			</el-button>
			<el-button v-if='failTasks.length === 0 && status==1' style="width: 200px" type="success"
					   :disabled="status == 0" @click='finishPrint()'>确
				认{{countNum ? '('+countNum+'S)':''}}
			</el-button>
		</div>
	</el-dialog>
</template>
<script>
	import onfire from "onfire.js";
	import {CloudSummaryUploadPrintInfo} from "@/service";

	export default {
		name: "printProgress",
		data() {
			return {
				visible: false,
				total: 0,
				count: 4,
				taskList: [],
				countNum: 0,
				countInterval: '',
				callback: ""
			};
		},
		watch: {
			total: function (val) {
				console.log(val)
			}
		},
		computed: {
			status: function () {
				if (this.total !== 0 && this.total === this.finish + this.fail) {
					if (this.fail === 0) {
						this.countInterval = setInterval(() => {
							let countNum = this.countNum || 2;
							countNum = countNum - 1;
							if (countNum === 0) {
								this.finishPrint();
								clearInterval(this.countInterval);
								this.countNum = 0;
								return;
							}
							this.countNum = countNum;
						}, 1000);
					}
					return 1
				}
				return 0;
			},
			fail: function () {
				return this.taskList.filter(item => item.status == -1).length;
			},
			finish: function () {
				return this.taskList.filter(item => item.status == 1).length;
			},
			failTasks: function () {
				return this.taskList.filter(item => item.status == -1);
			},
			percentage: function () {
				if (this.total == 0) {
					return 0;
				} else {
					return this.$NP.times(
						this.$NP.round((this.finish + this.fail) / this.total, 2),
						100
					);
				}
			}
		},
		mounted() {
			onfire.on("StartProgress", (taskList, callback) => {
				console.log(taskList)
				this.startProgress(taskList, callback);
			});
			onfire.on("increseProgress", data => {
				this.increseProgress(data);
			});
			// onfire.on("endProgress", this.endProgress);
		},
		beforedestroy() {
			onfire.un("StartProgress");
			onfire.un("increseProgress");
			// onfire.un("endProgress");
		},
		methods: {
			startProgress(taskList, callback) {
				// 参数初始化
				this.visible = true;
				this.total = taskList.length;
				this.count = 4;
				this.callback = callback;
				this.taskList = taskList.map((item, index) => {
					return {status: 0, taskIndex: index, ...item};
				});
				// 进行打印任务
				//更改打印方式打印队列超过10条的话，第一次传十条每成功一个新增一条，以防止打印过多打印服务会挂掉

				this.printTask(this.total > 5 ? this.taskList.slice(0, 5) : this.taskList)
			},
			printTask(taskList) {
				let total = this.total;
				taskList.forEach(item => {
					item
						.task()
						.then(res => {
							// 上报打印汇总的信息
							CloudSummaryUploadPrintInfo({
								type: item.type,
								num: 1,
								order: item.orderInfo.ordernum,
								landID: item.orderInfo.lid
							});

							// 更新进度条
							this.increseProgress({
								status: "success",
								taskIndex: item.taskIndex,
								msg: ""
							});
						})
						.catch(err => {
							this.increseProgress({
								status: "fail",
								taskIndex: item.taskIndex,
								msg: err.toString()
							});
						})
						.finally(() => {
							let count = this.count;
							if (total > count + 1) {
								count = count + 1;
								this.count = count;
								this.printTask([this.taskList[count]])
							}
						});
				});
			},
			increseProgress(data) {
				this.$set(
					this.$data.taskList[data.taskIndex],
					"status",
					data.status == "success" ? 1 : -1
				);
				this.$set(this.$data.taskList[data.taskIndex], "msg", data.msg);
				document
					.querySelectorAll(".detailTask li")
					[data.taskIndex].scrollIntoView();
			},
			finishPrint(type) {
				if (!type && this.fail > 0) {
					this.$message('请先重打印失败任务');
					return
				}
				this.visible = false;
				this.callback && this.callback();
			},
			printFail() {
				this.failTasks.forEach(item => {
					this.$set(this.$data.taskList[item.taskIndex], "status", 0);
					item
						.task()
						.then(res => {
							// 上报打印汇总的信息
							CloudSummaryUploadPrintInfo({
								type: item.type,
								num: 1,
								order: item.orderInfo.ordernum,
								landID: item.orderInfo.lid
							});
							this.increseProgress({
								status: "success",
								taskIndex: item.taskIndex,
								msg: ""
							});
						})
						.catch(err => {
							this.increseProgress({
								status: "fail",
								taskIndex: item.taskIndex,
								msg: err.toString()
							});
						});
				});
			}
		}
	};
</script>
<style lang="scss" scoped>
	.container {
		padding: 0 20px;
		h1 {
			font-size: 30px;
			margin-bottom: 20px;
			i {
				font-weight: bolder;
				font-size: 30px;
				margin-right: 10px;
			}
		}

		.printInfo {
			padding: 20px 0;
			font-size: 18px;
		}

		.detailTask {
			background: #f0f3f5;
			margin: 20px 0;
			padding: 10px;
			max-height: 400px;
			overflow-y: auto;
			li {
				padding: 10px;
			}
		}
	}
</style>



