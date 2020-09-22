//登录
export const loginApi = (data) => window.$axios.post("/admin/login", data);
//添加管理员
export const addAdminApi = (data) => window.$axios.post("/admin/addAdmin", data);
//重置密码
export const resetPasswordApi = (data) => window.$axios.post("/admin/resetPassword", data);
//修改密码
export const changePasswordApi = (data) => window.$axios.post("/admin/changePassword", data);
//分页查询管理员
export const getPageAdminApi = (data) => window.$axios.post("/admin/getPage", data);
//退出登录
export const logoutApi = (data) => window.$axios.post("/admin/logout", data);
//字典类型添加
export const addDictTypeApi = (data) => window.$axios.post("/dict/type/addDictType ", data);
//修改字典类型
export const changeDictTypeApi = (data) => window.$axios.post("/dict/type/changeDictType ", data);
//分页展示字典类型
export const getPageDictTypeApi = (data) => window.$axios.post("/dict/type/getPage", data);
//添加字典项
export const addDictApi = (data) => window.$axios.post("/dict/addDict", data);
//修改字典项
export const changeDictApi = (data) => window.$axios.post("/dict/changeDict", data);
//分页展示字典项
export const getPageDictApi = (data) => window.$axios.post("/dict/getPage", data);