/*
 * @Author: huangzhiyang
 * @Date: 2018-07-10 11:27:18
 *
 * 校验给定的身份证是否在给定的年龄限制范围内
 * @param {string} idcard    身份证
 * @param {array}  ageLimit  身份证的年龄限制   ageLimit = [{low:5,high:20},{low:50,high:60}]
 * @return {object}
 * {code:200,msg:""} => 校验通过，在年龄限制内
 * {code:0,msg:"错误信息"} => 校验不通过，不在年龄限制内
 */

import getAgeByIDCard from "@/util/getAgeByIDCard";

function _checkAgeLimit({idcard,ageMax,ageMin}){
    const age = getAgeByIDCard(idcard);
    if(age>=ageMin && age<=ageMax) return true;
    return false;
}


export default function checkIDCardInAgeLimit ({ idcard, ageLimit }) {
	if (!ageLimit || ageLimit.length == 0) return { code: 200, msg: "" };
	const result = ageLimit.some((limit) => {
		const min = limit.low;
		const max = limit.high;
		return _checkAgeLimit({ idcard, ageMin: min, ageMax: max });
	});
	const ageLimitToText = (ageLimit) => ageLimit.map((limit) => {
		return `${limit.low}-${limit.high}周岁`;
	}).join("或");

	return {
		code: result ? 200 : 0,
		msg: result ? "" : `限制游客年龄在 ${ageLimitToText(ageLimit)} 内`
	}

}
