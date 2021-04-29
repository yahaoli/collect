//登录
export const loginApi = (data) => window.$axios.post("/admin/login", data);
//添加管理员
export const addAdminApi = (data) =>
    window.$axios.post("/admin/addAdmin", data);
//重置密码
export const resetPasswordApi = (data) =>
    window.$axios.post("/admin/resetPassword", data);
//修改密码
export const changePasswordApi = (data) =>
    window.$axios.post("/admin/changePassword", data);
//分页查询管理员
export const getPageAdminApi = (data) =>
    window.$axios.post("/admin/getPage", data);
//退出登录
export const logoutApi = (data) => window.$axios.post("/admin/logout", data);
//字典类型添加
export const addDictTypeApi = (data) =>
    window.$axios.post("/dict/type/addDictType ", data);
//修改字典类型
export const changeDictTypeApi = (data) =>
    window.$axios.post("/dict/type/changeDictType ", data);
//分页展示字典类型
export const getPageDictTypeApi = (data) =>
    window.$axios.post("/dict/type/getPage", data);
//所有字典类型
export const getAllDictTypeApi = (data) =>
    window.$axios.post("/dict/type/getAll ", data, { loading: false });
//添加字典项
export const addDictApi = (data) => window.$axios.post("/dict/addDict", data);
//修改字典项
export const changeDictApi = (data) =>
    window.$axios.post("/dict/changeDict", data);
//分页展示字典项
export const getPageDictApi = (data) =>
    window.$axios.post("/dict/getPage", data);
// 查询字典类型下所有字典项
export const getByDiActTypeValueApi = (data) =>
    window.$axios.post("/dict/getByDictTypeValue", data);
// 分页展示风机上下线记录
export const getPageConnectionApi = (data) =>
    window.$axios.post("/connection/getPage", data);
// 风机上下线记录导出
export const exportConnectionApi = (data) =>
    window.$axios.post("/connection/exportConnection", data, { responseType: 'blob' });
// 分页展示维护人员
export const getPageDevopsApi = (data) =>
    window.$axios.post("/devops/getPage", data);
//查询所有维护人员
export const getAllDevopsApi = (data) =>
    window.$axios.post("/devops/getAll", data, { loading: false });
// 根据维护人员主键删除维护人员
export const deleteByDevopsIdApi = (data) =>
    window.$axios.post("/devops/deleteByDevopsId", data);
// 修改维护人员
export const chaneDevopsApi = (data) =>
    window.$axios.post("/devops/chaneDevops", data);
// 添加维护人员
export const addDevopsApi = (data) =>
    window.$axios.post("/devops/addDevops", data);
// 操作日志分页查询
export const getPageLogApi = (data) =>
    window.$axios.post("/log/getPage", data);

// 操作日志导出
export const getExportLogApi = (data) =>
    window.$axios.post("/log/exportLog", data, { responseType: 'blob' });
// 分页展示风机与维护人员
export const fanDevopsGetPageApi = (data) =>
    window.$axios.post("/fan/fanDevopsGetPage", data);
// 添加风机
export const fanAddApi = (data) =>
    window.$axios.post("/fan/fanAdd", data);
// 修改风机
export const fanChangeApi = (data) =>
    window.$axios.post("/fan/fanChange", data);
// 给风机绑定维护人员
export const fanDevopsAddApi = (data) =>
    window.$axios.post("/fan/fanDevopsAdd", data);
//根据风机主键查询维护人员
export const devopsGetByFanIdApi = (data) =>
    window.$axios.post("/devops/getByFanId", data);
//添加主控模块
export const addMasterControllerApi = (data) =>
    window.$axios.post("/master/addMaster", data);
//修改主控模块
export const changeMasterControllerApi = (data) =>
    window.$axios.post("/master/changeMaster", data);
//查询一个风机的所有主控
export const getByFanIdMasterControllerApi = (data) =>
    window.$axios.post("/master/getByFanId", data);
//查询风机的桨叶
export const getBladeByFanIdApi = (data) =>
    window.$axios.post("/blade/getByFanId", data);
//风机修改桨叶
export const bladeChangeApi = (data) =>
    window.$axios.post("/blade/bladeChange", data);
//分页查询桨叶的传感器
export const getSensorPageApi = (data) =>
    window.$axios.post("/sensor/getSensorPage", data);
//修改传感器
export const changeSensorApi = (data) =>
    window.$axios.post("/sensor/changeSensor", data);
//重启风机主控
export const masterRestartApi = (data) =>
    window.$axios.post("/fan/masterRestart", data);
//重启风机 DTU
export const dtuRestartApi = (data) =>
    window.$axios.post("/fan/dtuRestart", data);
//查询风机简要信息
export const getFanSimpleStatusApi = (data) =>
    window.$axios.post("/fan/getSimpleStatus", data, { loading: false });
//查询风机状态详情
export const getFanStatusApi = (data) =>
    window.$axios.post("/fan/getStatus", data, { loading: false });
//查询风机日报表
export const getFanDailyReportPageApi = (data) =>
    window.$axios.post("/report/getFanDailyReportPage", data);
//查询 3 个桨叶某个编号的小时统计数据
export const getLast12HourReportApi = (data) =>
    window.$axios.post("/hour/report/getLast12HourReport", data);
//查询风机离线和报警百分比
export const getAlarmOffPercentApi = (data) =>
    window.$axios.post("/fan/getAlarmOffPercent", data, { loading: false });
//查询最近的报警记录
export const getLastAlarmApi = (data) =>
    window.$axios.post("/alarm/getLastAlarm", data, { loading: false });
//查询风机信息
export const getFanInfoApi = (data) =>
    window.$axios.post("/fan/getFanInfo", data, { loading: false });
//查询最近 24 小时各类最大值
export const getLast24MaxValueApi = (data) =>
    window.$axios.post("/fan/getLast24MaxValue", data, { loading: false });
//查询风机传感器报警个数和最大值
export const getAlarmCountMaxValueApi = (data) =>
    window.$axios.post("/fan/getAlarmCountMaxValue", data, { loading: false });
//查询每个桨叶报警个数和最大值
export const getBladeAlarmCountMaxValueApi = (data) =>
    window.$axios.post("/fan/getBladeAlarmCountMaxValue", data, { loading: false });