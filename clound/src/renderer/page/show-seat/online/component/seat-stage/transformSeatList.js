/**
 * @Author: huangzhiyang
 * @Date: 2018-06-28 10:23:46
 * 转换后端接口返回的seat_list数据：
 * 1、按row_id值升序排列
 * 2、把连续大于2行的空行压缩成一行空行
 * @param {array} seatList
 * @param {number} rowNum
 * @param {number} colNum
 */

import {cloneDeep} from "lodash";


//缓存连续空行的row_id
let _emptyRowGroup = [];

export function transformSeatList(seatList,rowNum,colNum){
	//首页整理下seatList, 按row_id值升序排列
	seatList = seatList.sort((a,b)=>a.row_id-b.row_id);

	//二维数组
	const _db = [];
	for(let row=0; row<rowNum; row++){
		_db.push(new Array(colNum));
	}

	seatList.forEach((seat) => {
		const {row_id,col_id} = seat;
		const cols = _db[row_id-1];
		if(cols){
			cols[col_id-1] = col_id;
		}
	})

	const emptyRowIndexArr = [];
	_db.forEach((row,index) => {
		if(row.every((col)=>!col)){
			emptyRowIndexArr.push(index+1);
		}
	})

	let serCount = 0;
	_emptyRowGroup = [];
	emptyRowIndexArr.forEach((num,index) => {
		if((num+1) === emptyRowIndexArr[index+1]){
			if(!_emptyRowGroup[serCount]) _emptyRowGroup[serCount] = [];
			if(!_emptyRowGroup[serCount].includes(num)){
				_emptyRowGroup[serCount].push(num);
			}
		}else{
			if(_emptyRowGroup[serCount]){
				if(!_emptyRowGroup[serCount].includes(num)) _emptyRowGroup[serCount].push(num);
			}
			serCount++;
			if(typeof emptyRowIndexArr[index+1]!=="undefined"){
				if(!_emptyRowGroup[serCount]) _emptyRowGroup[serCount] = [];
				_emptyRowGroup[serCount].push(emptyRowIndexArr[index+1]);
			}
		}
	})

	//过滤掉只有一个数组无素的
	_emptyRowGroup = _emptyRowGroup.filter((g)=>g.length>1);

	_emptyRowGroup.forEach((g) => {
		const len = g.length;
		const max = g[len-1];
		const dis = len - 1;
		seatList = seatList.map((item) => {
			const {row_id} = item;
			if(row_id>max){
				if(typeof item["_v_row_id"]=="undefined"){
					item["_v_row_id"] = row_id - dis;
				}else{
					item["_v_row_id"] = item["_v_row_id"] - dis;
				}
			}
			return item;
		})
	})

	return seatList;

}

//转换排导航条
export function transformRowList(rowNum){
	const result = [];
	for(let i=1; i<=rowNum; i++) result.push(i);
	const _getStart = (group,index) => {
		let _arr = _emptyRowGroup.slice(0,index);
		let total = _arr.reduce((prev,next) => {
			return prev + next.length - 1
		},0);
		total = (group[0]-1) - total
		return total;
	}
	_emptyRowGroup.forEach((group,index)=>{
		const len = group.length;
		let start = 0;
		if(index==0){
			start = group[0]-1;
		}else{
			start = _getStart(group,index);
		}
		result.splice(start,len,"...");
	})
	return result;
}

//获取最大列的数值
export function getMaxColNum(seatList){
	return cloneDeep(seatList).sort((a,b)=>(b.col_id-a.col_id))[0].col_id;
}

export default{
	transformSeatList,transformRowList,getMaxColNum
}



