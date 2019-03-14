window.common_ = {
    ajax_: function (json) {
        var def = $.Deferred()
        var self=this
        json.url = '../SSM/web/' + json.url
        $.ajax(json).then(function (data) {
            if (data.code === 200) {
                def.resolve(data.data)
            }else if (data.code === 400){
                window.location.href='../SSM/web/wechat/wechatLogin?state='+window.location.href
                def.reject()
            }else {
                $.toast(data.message, 'text')
                def.reject()
            }
        }, function (err) {
            $.toast('请求失败', 'text')
            def.reject()
        })
        return def.promise()
    },
    dateFormat: function (value, type) {
        if (value) {
            var date = new Date(value)
            var year = date.getFullYear()
            var month = date.getMonth() + 1
            month = month < 10 ? ('0' + month) : month
            var Day = date.getDate()
            Day = Day < 10 ? ('0' + Day) : Day
            var hour = date.getHours()
            hour = hour < 10 ? ('0' + hour) : hour
            var minute = date.getMinutes()
            var second = date.getSeconds()
            minute = minute < 10 ? ('0' + minute) : minute
            second = second < 10 ? ('0' + second) : second
            return type === 1 ? year + '-' + month + '-' + Day : year + '-' + month + '-' + Day + ' ' + hour + ':' + minute + ':' + second
        }
    },
    getQueryString: function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
        var r = window.location.search.substr(1).match(reg)
        if (r != null) {
            return decodeURI(r[2])
        }
        return null
    },
    isNull: function (variable1) {
        return variable1 === null || variable1 === undefined || variable1 === ''
    },
    numTo2: function (value) {
        return /^\d+(?:\.\d{1,2})?$/.test(value)
    },
    getCookie: function (name) {
        var arr;
        var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return decodeURI(arr[2]);
        } else {
            return null;
        }
    }
}
$(function () {
    $('.app-back').click(function () {
        if (!$(this).attr('data-back')) { window.history.back(-1) }
    })
})
