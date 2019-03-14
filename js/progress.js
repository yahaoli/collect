//上传进度条
function uploadFile(){
    var pic = $("#pic").get(0).files[0];
    var formData = new FormData();
    formData.append("file" , pic);

    /**
     * 必须false才会避开jQuery对 formdata 的默认处理
     * XMLHttpRequest会对 formdata 进行正确的处理
     */
    $.ajax({
        type: "POST",
        url: "upload",
        data: formData ,
        processData : false,
        //必须false才会自动加上正确的Content-Type
        contentType : false ,
        xhr: function(){
            var xhr = $.ajaxSettings.xhr();
            if(onprogress && xhr.upload) {
                xhr.upload.addEventListener("progress" , onprogress, false);
                return xhr;
            }
        }
    });
}


/**
 *    侦查附件上传情况    ,这个方法大概0.05-0.1秒执行一次
 */
function onprogress(evt){
    var loaded = evt.loaded;                  //已经上传大小情况
    var tot = evt.total;                      //附件总大小
    var per = Math.floor(100*loaded/tot);      //已经上传的百分比
    $("#son").html( per +"%" );
    $("#son").css("width" , per +"%");
}
//上传及下载进度条第一种方法
$.ajax({
    type: 'POST',
    url: "/",
    data: {},
    beforeSend: function(XMLHttpRequest)
    {
        //Upload progress
        XMLHttpRequest.upload.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                //Do something with upload progress
            }
        }, false);
        //Download progress
        XMLHttpRequest.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                //Do something with download progress
            }
        }, false);
    },
    success: function(data){
        //Do something success-ish
    }
});
//第二种
$.ajax({
    xhr: function()
    {
        var xhr = new window.XMLHttpRequest();
        //Upload progress
        xhr.upload.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                //Do something with upload progress
                console.log(percentComplete);
            }
        }, false);
        //Download progress
        xhr.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                //Do something with download progress
                console.log(percentComplete);
            }
        }, false);
        return xhr;
    },
    type: 'POST',
    url: "/",
    data: {},
    success: function(data){
        //Do something success-ish
    }
});