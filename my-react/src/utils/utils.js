/**
 * 保留小数
 * @param val
 * @param num
 * @returns {*}
 */
import moment from 'moment';

export function toFixed2(val, num) {
  if (isNaN(val)) {
    return val;
  }
  num = num === void 0 ? 2 : num;
  return parseFloat(val.toFixed(num));
}

/**
 * 获取最近一周
 * @returns {(*|moment.Moment)[]}
 */
export function getWeekLast() {
  var week = new Date().getDay(),
    currentWeek = week > 0 ? week : 7,
    addDate = function(date, n) {
      date.setDate(date.getDate() + n);
      return date;
    }
    , Monday = moment(addDate(new Date(), -(currentWeek - 1)), 'YYYY-MM-DD')
    , start = moment(addDate(new Date(), -(currentWeek - 1) - 6), 'YYYY-MM-DD');
  return [start, Monday];
}

/**
 * 判断对象是否是空对象
 * @param obj
 * @returns {boolean}
 */
export function isHaveJson(obj) {
  for (var key in obj) {
    return key;
  }
  return false;
}

// 验证小数
export function numTo2(value) {
  return /^\d+(?:\.\d{1,2})?$/.test(value);
}

// 验证整数
export function integer(value) {
  return /^\d+$/.test(value);
}
export function isNull(value) {
  return value === null || value === undefined || value === '';
}
