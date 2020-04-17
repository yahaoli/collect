import Common from "./common";

const initRouteHooks = router => {

    // iOS端微信浏览器签名处理
    router.beforeEach((to, from, next) => {
        let device = Common.device();

        if (((device.isIphone || device.isIpad) && device.isWeixin) || device.isInWechatMP) {
            if (!window.firstEnterUrl) {
                window.firstEnterUrl = location.href.split("#")[0];
            }
        }
        next();
    });

};
export {
    initRouteHooks as InitRouteHooks
};