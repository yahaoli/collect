import {isString, isArray} from "lodash";
import {
	FetchTicketList,
	FetchTicketStorage,
	FetchChangCiList,
} from "@/service";

import Message from "@/util/message";

import Config from "@/config";

/**
 * 根据产品id，从产品列表中找到对应的产品
 */
function getPordByID(prodID, prodList) {
	if (!isString(prodID) || !isArray(prodList) || prodList.length == 0) return null;
	return prodList.find(item => item.id == prodID);
}


/**
 * 获取票类列表及每张票对应的价格、库存、获取场次列表
 * @param {string} account       登录用户的帐号
 * @param {string} aid           供应商ID  散客的时候，aid传产品列表里的sapply_did
 * @param {string} date          请求哪一天的
 * @param {string} lid           产品id
 * @param {string} fid           分销商id  散客的时候，fid传登陆者的主帐号ID
 * @param {string} ptype         产品类型
 * @param {string} channel       购票方是散客时，channel==7；是分销商时，channel==9
 * @param siteId
 * @return {object} {code:"",list:[],msg:""}
 */
export default function fetchTicketAndRound({ account, aid, date, lid, fid, ptype, channel = 7, siteId, groupId}) {
	return new Promise(async (resolve, reject) => {

		//拉取票类
		const ticketRes = await FetchTicketList({ aid, lid, fid, date, channel, siteId, sourceType: 1, groupId });
		const ticketData = ticketRes.data || {};
		const ticketList = ticketData.list || [];

		let roundList = [];
		let venueID = "";

		if (ticketRes.code != 200) {
			return resolve({
				code: ticketRes.code,
				msg: ticketRes.code == 400 ? (ticketRes.msg || "暂无可预订票类") : (ticketRes.msg || Config.AJAX_ERROR_TEXT),
				ticketList,
				roundList,
				venueID
			})
		}

		if (!isArray(ticketList) || ticketList.length == 0) return resolve({
			code: 200,
			msg: "",
			ticketList,
			roundList,
			venueID
		})


		//如果是演出类产品，先拉取场次列表
		if (ptype == "H") {
			const changciRes = await FetchChangCiList({lid, memberId: aid, date});
			if (!changciRes) return resolve({
				code: -4,
				msg: "请求场次列表接口失败",
				ticketList,
				roundList,
				venueID
			})

			if (changciRes.code == 200) {
				const changciData = changciRes.data;
				const changciTickets = changciData.tickets;
				roundList = changciData.rounds ? changciData.rounds : [];
				const roundTickets = changciData.tickets;
				const firstRound = roundList[0];
				venueID = firstRound ? firstRound.venus_id : "";
				ticketList.forEach((item) => {
					const tid = item.tid;
					const ticket = roundTickets.find(item => item.tid == tid);
					//zoneID==0 说明是站票
					const zoneID = ticket ? String(ticket.zone_id) : "0";
					const storage = zoneID == 0 ? Config.MAX_STORAGE_NUM : (function (roundList, zoneID) {
						if (!roundList || roundList.length == 0) return 0;
						const firstChangci = roundList[0];
						let areaStorage = firstChangci ? firstChangci.area_storage : "";
						if (!areaStorage) return 0;
						const storageItem = areaStorage.split("|").find((item) => {
							item = item.split(",");
							const zone_id = item[0];
							const storage = item[1];
							return zone_id == zoneID;
						});
						if (storageItem) {
							return storageItem.split(",")[1];
						}
						return 0;
					})(roundList, zoneID);

					item["zone_id"] = zoneID;
					item["storage"] = storage * 1;

				})
				resolve({
					code: roundList.length > 0 ? 200 : -2,
					msg: roundList.length > 0 ? "" : "该产品当天暂无场次安排",
					ticketList,
					roundList,
					venueID
				})
			} else {
				resolve({
					code: -3,
					msg: changciRes.msg,
					ticketList,
					roundList,
					venueID
				})
			}
		} else {
			//拉完票类再拉票类对应的库存
			const storageRes = await FetchTicketStorage({date, lid});
			const storageList = storageRes.data;
			if (storageRes.code != 200) return resolve({
				code: storageRes.code,
				msg: storageRes.msg || Config.AJAX_ERROR_TEXT,
				ticketList,
				roundList,
				venueID
			})

			//库存获取成功后，开始设置票类列表的库存字段
			ticketList.forEach((item) => {
				const tid = item.tid;
				const storageItem = storageList.find(item => item.tid === tid);
				item["storage"] = storageItem ? storageItem.remain : Config.MAX_STORAGE_NUM;
			});
			resolve({
				code: 200,
				msg: "",
				ticketList,
				roundList,
				venueID
			})
		}
	})
}

