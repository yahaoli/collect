;(function ($) {
    window.ajax = $.ajax;
    $.extend({
        ajax: function(url, options) {
            if (typeof url === 'object') {
                options = url;
                url = undefined;
            }
            options = options || {};
            url = options.url;
            var xsrftoken = $('meta[name=_xsrf]').attr('content');
            var headers = options.headers || {};
            var domain = document.domain.replace(/\./ig, '\\.');
            if (!/^(http:|https:).*/.test(url) || eval('/^(http:|https:)\\/\\/(.+\\.)*' + domain + '.*/').test(url)) {
                headers = $.extend(headers, {'X-Xsrftoken':xsrftoken});
            }
            options.headers = headers;
            return ajax(url, options);
        }
    });
    $('.test').click(function () {
        $.ajax({
            type: 'POST',
            url: '/index',
            dataType: 'json',
            data: {"name":"xiaoming","id":123456},
            success:function (data) {

            },
            err:function () {

            }
        })
    });
    $('.json').click(function () {
        $.ajax({
            type: 'POST',
            url: '/json',
            dataType: 'json',
            success:function (data) {
                console.log(data)
            },
            err:function () {

            }
        })
    });
    $('#submit').click(function () {
        var formData=new FormData();
        var files=$("#file").prop("files");
        for (var i=0;i<files.length;i++){
            formData.append('files',files[i]);
        }
        $.ajax({
            type:'POST',
            url:'/session/upload',
            data:formData,
            processData: false,// *重要,确认为false
            contentType: false,
            timeout:5000,
            dataType: 'json',
            success:function(data){
                console.log(data);
            },
            error:function(){
                alert('registajax'+'error');
            }
        })
    })

})(jQuery);
