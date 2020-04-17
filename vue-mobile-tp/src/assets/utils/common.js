//import { Toast } from 'vant'
//import wx from 'weixin-js-sdk'

export default {
    /**
     * 获取设备类型
     */
    device() {
        let ua = navigator.userAgent
        return {
            isChrome: ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
            isAndroid: ua.match(/(Android);?[\s/]+([\d.]+)?/),
            isIphone: ua.indexOf('iPhone') !== -1,
            isIpad: ua.indexOf('iPad') !== -1,
            isWeixin: ua.match(/MicroMessenger/i),
            isInWechatMP: (ua.match(/micromessenger/i) && ua.match(/miniprogram/i)) || window.__wxjs_environment === 'miniprogram'
        }
    },
    getWxSignUrl(store) {
        let device = this.device()
        if (((device.isIphone || device.isIpad) && device.isWeixin) || device.isInWechatMP) {
            return store.firstEnterUrl || location.href.split('#')[0]
        } else {
            return location.href.split('#')[0]
        }
    },
   /* // 微信扫码相关
    getWxConfig(_this, jsApiList, callback) {
        // 获取锚点之前的链接
        let url = this.getWxSignUrl(_this.$store)
        wechatSign({
            data: { url: encodeURIComponent(url) }
        }).then((res) => {
            if (res.code === '0') {
                let result = res.result;
                setTimeout(() => {
                    wx.config({
                        debug: false,
                        appId: result.appId,
                        timestamp: result.timestamp,
                        nonceStr: result.noncestr,
                        signature: result.signature,
                        jsApiList: jsApiList || []
                    })

                    wx.error(function (err) {
                        Toast(err.errMsg)
                    })

                    wx.ready(() => {
                        _this.isWxReady = true;
                        typeof callback === 'function' && callback(wx)
                    })
                }, 0)
            } else {
                Toast(res.message + res.code)
            }
        })
    }*/
}