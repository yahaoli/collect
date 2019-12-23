/**
 * 获取左边菜单
 * @returns {*}
 */
export function systemListPc() {
  return window.$axios({
    url: "/computer/api/common/systemListPc",
    method: "get"
  });
}

/**
 * 获取
 * @returns {*}
 */
export function getUser() {
  return window.$axios({
    url: "/computer/api/common/user",
    method: "get"
  });
}

/**
 * 获取公司列表
 * @returns {*}
 */
export function getCompanyList(data) {
  return window.$axios({
    url: "/computer/api/corp/selectCorp",
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    data: data || [2]
  });
}

/**
 * 获取景区列表
 * @returns {*}
 */
export function getSubUnitList() {
  return window.$axios({
    url: "/computer/api/common/subUnitList",
    method: "get"
  });
}

/**
 *获取景区公司周报
 * @param query
 * @returns {*}
 */
export function getUnitBusinessReportdata(query) {
  return window.$axios({
    url: "/computer/api/record/getUnitBusinessReportdata",
    method: "post",
    data: query
  });
}

/**
 * 获取内容公司周报
 * @param query
 * @returns {*}
 */
export function getCorpBusinessReportdata(query) {
  return window.$axios({
    url: "/computer/api/record/getCorpBusinessReportdata",
    method: "post",
    data: query
  });
}

/**
 * 获取登录日志
 * @param query
 * @returns {*}
 */
export function getLoginRecord(query) {
  return window.$axios({
    url: "/computer/api/common/loginRecordPage",
    method: "post",
    data: query
  });
}

/**
 * 数据录入>景区数据
 * @param query
 * @returns {*}
 */
export function getItemDailyRecordBill(query) {

  return window.$axios({
    url: "/computer/api/record/getItemDailyRecordBill",
    method: "post",
    data: query
  });
}

/**
 * 数据录入获取所有天气
 * @returns {*}
 */
export function weatherFatherService() {

  return window.$axios({
    url: "/computer/api/weather/weatherFather",
    method: "get"
  });
}

/**
 * 数据录入获取天气的code
 */
export function getWeatherCodeService(query) {
  return window.$axios({
    url: "/computer/api/weather/read",
    method: "post",
    data: query
  });
}

/**
 * 景区数据录入保存
 * @param query
 */
export function updateItemDailyRecordBill(query) {
  return window.$axios({
    url: "/computer/api/record/updateItemDailyRecordBill",
    method: "post",
    loading: true,
    data: query
  });
}

/**
 * 更新天气
 * @param query
 * @returns {*}
 */
export function updateWeatherService(query) {
  return window.$axios({
    url: "/computer/api/weather/update",
    method: "post",
    data: query
  });
}

/**
 * 校验经营数据
 */
export function getUnitDailyRecordCacheService(query) {
  return window.$axios({
    url: "/computer/api/record/getUnitDailyRecordCache",
    method: "post",
    data: query
  });
}

/**
 * 更新校验数据
 * @param query
 * @returns {*}
 */
export function updateUnitDailyRecordService(query) {
  return window.$axios({
    url: "/computer/api/record/updateUnitDailyRecord",
    method: "post",
    data: query,
    loading: true
  });
}

/**
 * 上传校验数据excel
 * @param query
 * @returns {*}
 */
export function templateImportService(query) {
  return window.$upload({
    url: "/computer/api/download/templateImport",
    method: "post",
    data: query,
    loading: true
  });
}

/***
 * 获取校验数据模板
 */
export function getTemplateService(query) {
  return window.$axios({
    url: "/computer/api/common/corpItem/getTemplate",
    method: "post",
    data: query,
    loading: true
  });
}
