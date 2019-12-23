/**
* @author xiaoqiang
* @date 2018/3/16
* @description:
*/
<template>
	<section class="details" v-loading="loading">
		<h3>详细信息</h3>
		<main>
			<div class="top-flex" flex="main:justify">
				<ul>
					<li>
						<span>订单号：</span>
						<span> {{ orderDetails.ordernum || "--" }}</span>
					</li>
					<li>
						<span>远端订单号：</span>
						<span> {{ orderDetails.remotenum || "--" }}</span>
					</li>
					<li>
						<span>下单时间：</span>
						<span> {{ orderDetails.ordertime || "--" }}</span>
					</li>
					<li>
						<span>有效期：</span>
						<span> {{ orderDetails.begintime || "--" }} 至 {{ orderDetails.endtime || "--" }}</span>
					</li>
					<li>
						<span>支付状态：</span>
						<span> {{ orderDetails.paystatus || "--" }}</span>
					</li>
					<li>
						<span>支付方式：</span>
						<span> {{ orderDetails.paymode || "--" }}</span>
					</li>
					<li>
						<span>订单实付金额：</span>
						<span> {{ orderDetails.sellmoney || "--" }}</span>
					</li>
					<li>
						<span>订单备注：</span>
						<span> {{ orderDetails.memo || "--" }}</span>
					</li>
				</ul>
				<ul>
					<li>
						<span>凭证号：</span>
						<span>{{ orderDetails.code || "--" }}</span>
						<el-button type="text" v-if="orderDetails.code_info && orderDetails.code_info.length"
								   @click="voucherShow = !voucherShow">
							{{voucherShow|buttonText}}
						</el-button>
					</li>
					<el-collapse-transition>
						<div v-if="voucherShow" class="show-hide-list">
							<el-table :data="orderDetails.code_info"
									  :header-cell-style="{background: '#f3f1f1',padding: '0 0'}"
									  :cell-style="{background: '#f3f1f1',padding: '0 0'}">
								<el-table-column min-width="120" prop="ttitle" label="票名称">
									<template slot-scope="scope">
										<el-popover class="code" trigger="hover" placement="top">
											<p><span>票名称: </span>{{ scope.row.ttitle }}</p><br>
											<p><span>身份证: </span>{{ scope.row.idcard }}</p>
											<p><span>凭证码: </span>{{ scope.row.code }}</p>
											<p><span>状态: </span>{{ scope.row.checked }}</p>
											<div slot="reference">
												{{ scope.row.ttitle }}
											</div>
										</el-popover>
									</template>
								</el-table-column>
								<el-table-column min-width="150" prop="idcard" label="身份证"/>
								<el-table-column min-width="115" prop="code" label="凭证码"/>
								<el-table-column min-width="60" prop="checked" label="状态"/>
							</el-table>
						</div>

					</el-collapse-transition>
					<li>
						<span>短信发送次数：</span>
						<span>{{ orderDetails.remsg || "--" }}</span>
					</li>
					<li>
						<span>取票人(手机号)：</span>
						<span>{{ orderDetails.ordername || '' }} {{ orderDetails.contact_tel || "--" }}</span>
					</li>
					<li>
						<span>取票地址：</span>
						<span>{{ orderDetails.addr || "--" }}</span>
					</li>
					<li>
						<span>身份证：</span>
						<span style="display: inline-block;">{{ orderDetails.ordername || '' }} <br> {{orderDetails.person_id}}</span>
						<el-button type="text"
								   v-if="orderDetails.tourist_info && orderDetails.tourist_info.constructor === Object ||
								 (orderDetails.tourist_info instanceof Array && orderDetails.tourist_info.length)"
								   @click="identityCodeShow = !identityCodeShow">
							{{ identityCodeShow|buttonText }}
						</el-button>
					</li>
					<el-collapse-transition>
						<div class="show-hide-list" v-if="identityCodeShow">
							<ul>
								<li v-for="(item,key) in orderDetails.tourist_info">{{item}} : {{key}}</li>
								<li class="none"> 暂无数据</li>
							</ul>
						</div>
					</el-collapse-transition>
					<li>
						<span>供应商/分销商：</span>
						<span> {{ orderDetails.split_list || "--" }}</span>
					</li>
					<li>
						<span>第三方订单号：</span>
						<span>{{ orderDetails.api_order || "--" }}</span>
					</li>
					<li>
						<span>第三方消费码：</span>
						<span>{{ orderDetails.api_code || "--" }}</span>
					</li>
					<li v-if="orderDetails.seat">
						<span>座位号：</span>
						<span>{{ orderDetails.seat || "--" }}</span>
					</li>
					<li v-if="orderDetails.performance">
						<span>演出场次：</span>
						<span>{{orderDetails.performance || "--"}}</span>
					</li>
					<li v-if="orderDetails.partition">
						<span>座位分区：</span>
						<span>{{orderDetails.partition || "--"}}</span>
					</li>
					<li v-if="orderDetails.ass_stations">
						<span>集合地点：</span>
						<span>{{orderDetails.ass_stations || "--"}}</span>
					</li>
					<li v-if="orderDetails.order_province && orderDetails.order_city">
						<span>客源地：</span>
						<span>
							{{orderDetails.order_province+" / "+orderDetails.order_city}}{{orderDetails.order_county ? (" / "+orderDetails.order_county) : ""}}
						</span>
					</li>
					<li v-if="orderDetails.order_serial">
						<span>票面流水号：</span>
						<span>{{orderDetails.order_serial}}</span>
					</li>

				</ul>
			</div>
			<div class="my-table table">

				<table>
					<thead>
						<tr>
							<th>产品</th>
							<th>订单号</th>
							<th>订单状态</th>
							<th>单价</th>
							<th>数量</th>
							<th>已验证数</th>
							<th>验证时间</th>
							<th>退票手续费</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in orderDetails.land_module">
							<td>{{ item.pid || "--" }}</td>
							<td>{{ item.order_num || "--" }}</td>
							<td>{{ item.status || "--" }}</td>
							<td>{{ item.sell_money || "--" }}</td>
							<td>{{ item.tnum || "--" }}</td>
							<td>{{ item.checked || "--" }}</td>
							<td>{{ item.dtime || "--" }}</td>
							<td>{{ item.hand_fee || "--" }}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<section class="table-change table">
				<h4>变更记录</h4>
				<table>
					<thead>
						<tr>
							<th>时间</th>
							<th>操作</th>
							<th>票名称</th>
							<th>本次操作</th>
							<th>操作后</th>
							<th>手续费</th>
							<th>人员</th>
							<th>渠道</th>
							<th>备注</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in orderDetails.change_log || []">
							<td>{{ item.insertTime || "--" }}</td>
							<td>{{ item.action || "--" }}</td>
							<td>{{ item.tid || "--" }}</td>
							<td>{{ item.tnum || "--" }}</td>
							<td>{{ item.left_num || "--" }}</td>
							<td>{{ item.cancel_service || "--" }}</td>
							<td>{{ item.oper_member || "--" }}</td>
							<td>{{ item.source || "--" }}</td>
							<td>{{ item.msg || "--" }}</td>
						</tr>
					</tbody>
				</table>
			</section>
		</main>
	</section>
</template>

<script>
	import {getOrderDetail} from "../service";

	export default {
		name: "OrderDetails",
		filters: {
			buttonText: function (status) {
				return status ? '收起' : '展开'
			}
		},

		created () {
			this.init();
		},

		data () {
			return {
				voucherShow: false,
				identityCodeShow: false,
				orderDetails: {},
				loading: true,
			}
		},
		watch: {
			ordernum: {
				handler () {
					this.init()
				},
				immediate: true
			}
		},
		methods: {
			init () {
				this.voucherShow = false;
				this.identityCodeShow = false;
				this.loading = true;
				this.queryDetails();
			},
			queryDetails () {
				if (!this.ordernum) return this.$message({
					showClose: true,
					message: '订单号有误',
					type: 'error'
				});

				getOrderDetail({order_num: this.ordernum}).then(res => {
					if (res.code + '' === '200') {
						// console.log(res);
						this.orderDetails = res.data || {};
						/*
						// 加载测试数据
						this.orderDetails.code_info = this.dataCode;
						this.orderDetails.tourist_info = this.data;
						*/
					} else {

						this.$message({
							showClose: true,
							message: res.msg || '出了点问题',
							type: 'error'
						});
					}
				}, (res) => {
					this.$message({
						showClose: true,
						message: res.msg || '出了点问题',
						type: 'error'
					});
				}).finally(() => {
					this.$nextTick(() => {
						this.loading = false;
					})
				})
			},
		},
		props: {
			ordernum: {
				type: String,
				default () {
					return ''
				}
			},
			order: {
				type: Object
			}
		}
	}
</script>

<style lang="scss" scoped>
	.el-button.el-button--text {
		margin-left: 5px;
	}

	.details {
		background: #fff;
		padding: 20px;
		max-height: 60vh;
		overflow-y: scroll;
		h3 {
			display: none;
		}
		main {
			.top-flex {
				ul {
					display: block;
					/*width: 50%;*/
					line-height: 28px;
					font-size: 12px;
					vertical-align: top;
					&:not(:last-child) {
						border-right: 1px solid #e5e5e5;
					}
					&:not(:first-child) {
						padding: 0 0 0 20px;
					}
					li {
						span:first-child {
							vertical-align: top;
							display: inline-block;
							width: 7.5em;
						}
					}
				}
				& > ul:first-child {
					min-width: 260px;
					width: 30%;
				}
				& > ul:last-child {
					width: 70%;
					li {
						span:first-child {
							width: 10em;
						}
					}
				}
			}
			.show-hide-list {
				background: #f3f1f1;
				font-size: 12px;
				.code {
					display: inline-block;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				ul {
					display: block;
					overflow: hidden;
					width: 100%;
					li {
						width: 48%;
						text-align: center;
						float: left;
						&:nth-of-type(2n) {
							float: right;
						}
						&.none {
							display: none;
							line-height: 60px;
							width: 100%;
							color: #909399;
						}
						&.none:first-child {
							display: block;
						}
					}
					&:after {
						content: '';
						clear: both;
					}
				}
				& > .el-table {
					background: #f3f1f1;
					font-size: 12px;
					line-height: 16px;
				}
			}
			& > .el-table {
				margin-top: 20px;
			}
			.table {
				margin-top: 30px;
				h4 {
					line-height: 30px;
					padding: 0 5px;
					font-weight: normal;
					color: #111;
				}
				background: #dfe5ed;
				border: 1px solid #e5e5e5;
				tr {
					&:not(:last-child) {
						border-bottom: 1px solid #e5e5e5;
					}
					td {
						background: #fff;
					}
				}

				table {
					width: 100%;
					font-size: 12px;
					border-radius: 50px;
					text-align: center;
					td, th {
						padding: 0 8px;
					}
					thead {
						width: 100%;
						background: #e5e5e5;
						th {
							font-weight: normal;
							&:first-child {
								min-width: 200px;
								text-align: left;
							}
						}
					}
					tbody {
						td {
							&:first-child {
								text-align: left;
							}
						}
					}
				}
			}
		}
	}
</style>
