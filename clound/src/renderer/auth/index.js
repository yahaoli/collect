import Storage,{KEY} from "@/util/storage";
import Config from "@/config";
export function checkLogin(){
    let userInfo = Storage.Session.get(KEY.USER_INFO);
	let lastRequestTime = Storage.Session.get(KEY.LAST_REQUEST_TIME_KEY);
    if(!userInfo) return false;
    if(!lastRequestTime) return false;
    userInfo = JSON.parse(userInfo);
    const {token,expire} = userInfo;
    if(!token) return false;
    const nowTime = new Date().getTime();
    if(nowTime-lastRequestTime>=Config.expire){//如果最近一次与服务器交互数据的时间距离现在已经超过1个小时，则判定为登录状态已过期
        return false;
    }
    return true;
}
