import {MessageBox,Message,Loading,Notification} from "element-ui";
const AJAX_ERROR_TEXT = "请求出错，请稍后重试";
const AJAX_TIMEOUT_TEXT = "请求超时，请稍后重试";
let __loadingInstance = null;
export default{
    alert : function(message,title,opt){
        return MessageBox(message || AJAX_ERROR_TEXT,title || "",opt)
    },
	confirm: function (message, title, opt) {
		//默认关闭点击蒙版或者Esc关闭
		opt = opt || {};
		opt.closeOnClickModal = opt.closeOnClickModal || false;
		opt.closeOnPressEscape = opt.closeOnPressEscape || false;
		return MessageBox.confirm(message, title, opt);
	},
    error : function(content){
        return Message.error(content || AJAX_ERROR_TEXT)
    },
	warning : function(content){
		return Notification.warning(content || AJAX_ERROR_TEXT)
	},
    success : function(content){
        return Message.success(content || AJAX_ERROR_TEXT)
    },
    loading : function(text){
        if(__loadingInstance) return false;
        text = text || "请稍后...";

        __loadingInstance = Loading.service({
            fullscreen : true,
            lock : true,
            text : text,
            customClass : "gLoadingBox"
        });
        return __loadingInstance;

    },
    closeLoading : function(){
        if(__loadingInstance){
            __loadingInstance.close();
            __loadingInstance = null;
        }
    },
    AJAX_ERROR_TEXT,
    AJAX_TIMEOUT_TEXT
}
