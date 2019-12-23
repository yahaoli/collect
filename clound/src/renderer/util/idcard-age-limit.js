/*
 * @Author: huangzhiyang
 * @Date: 2018-03-05 17:01:20
 * @Last Modified by: huangzhiyang
 * @Last Modified time: 2018-05-09 20:46:14
 *
 * 判断一个身份证号码是否在给定的年龄范围内
 *
 */


/**
 * 通过身份证取得对应的年龄(几岁)
 * 15位身份证号码：第7、8位为出生年份(两位数)，第9、10位为出生月份，第11、12位代表出生日
 * 18位身份证号码：第7、8、9、10位为出生年份(四位数)，第11、第12位为出生月份，
 */
export function getAgeByIDCard(idcard){
    var year = idcard.length==18 ? idcard.substring(6,10) : ("19"+idcard.substring(6,8));
    year = year * 1;
    var month = idcard.substring(10,12) * 1;
    var day = idcard.substring(12,14) * 1;
    var now = new Date();
    var curYear = now.getFullYear();
    var curMonth = now.getMonth()+1;
    var curDay = now.getDate();
    var dis = curYear - year;
    //精确到天
    //例如：今天是2017-06-19   A在2017-06-19当天出生，则A在2017-06-18这天为6岁  在2017-06-19这天为7岁
	if(curMonth<month || (curMonth==month && curDay<day)) dis = dis - 1;

    return dis;
}



/**
 *
 * @param {string} idcard
 * @param {number} ageMax
 * @param {number} ageMin
 * @return {boolean} true==在给定的年龄范围内  false==不在给定的年龄范围内
 */
export default function checkAgeLimit({idcard,ageMax,ageMin}){
    const age = getAgeByIDCard(idcard);
    if(age>=ageMin && age<=ageMax) return true;
    return false;
}
