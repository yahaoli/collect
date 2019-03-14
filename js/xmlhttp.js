(function () {
    var ajax = {};
    ajax.x = function () {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        var xhr;
        for (var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
    };

    ajax.send = function (url, method, data, success,fail,async) {
        if (async === undefined) {
            async = true;
        }
        var x = ajax.x();
        x.open(method, url, async);
        x.onreadystatechange = function () {
            if (x.readyState == 4) {
                var status = x.status;
                if (status >= 200 && status < 300) {
                    success && success(x.responseText,x.responseXML)
                } else {
                    fail && fail(status);
                }

            }
        };
        if (method == 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data)
    };

    ajax.get = function (url, data, callback, fail, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url + (query.length ? '?' + query.join('&') : ''), 'GET', null, success, fail, async)
    };

    ajax.post = function (url, data, callback, fail, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url,'POST', query.join('&'), success, fail, async)
    };
})();

function post(){
    var request=new XMLHttpRequest();
    request.open('POST','URL');
    request.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
    //request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");//表单格式
    request.send(msg);
    //request.send(encodeFormData(msg));
    //或request.send(JSON.stringify(msg))
}
function get(){
    var request=new XMLHttpRequest();
    request.open('GET','URL&数据');
    request.onreadystatechange=function(){
        if(request.readyState==4&&request.readyState==200){
            var type=request.getResponseHeader('Content-Type');
            /*if(type.match(/^text/))
            callback(request.responseText);*/
            if(type.indexOf("xml")!==-1&&request.responseXML)
                callback(request.responseXML);//Document对象响应
            else if(type==="application/json")
                callback(JSON.parse(request.responseText)); //JSON响应
            else
                callback(request.responseText);   //字符串响应
        }
    };
    request.send(null);
}
//表单序列化的方法
function encodeFormData(data){
    if(!data) return ""; //返回字符串
    var pairs=[]; //为了保存名=值对
    for(var name in data){
        if(!data.hasOwnProperty(name)) continue; //跳过继承属性
        if(typeof data[name]==="function") continue; //跳过方法
        var value=data[name].toString();    //值转换为字符串
        name=encodeURIComponent(name.replace("%20","+")); //编码名字
        value=encodeURIComponent(value.replace("%20","+"));//编码值
        pairs.push(name + "=" +value);  //记住名=值对

    }
    return pairs.join('&'); //返回数据
}
//多文件上传
function postFormData(url,data,callback){
    if(typeof FormData ==='undefined') throw new Error("");
    var request=new XMLHttpRequest();
    request.on('POST',url);
    request.onreadystatechange=function(){
        if(request.readyState===4&&callback)
            callback(request)
    };
    var formdata=new FormData();
    for (var name in data){
        if(!data.hasOwnProperty(name)) continue;
        var value=data[name];
        if(typeof value==='function') continue;
        formdata.append(name,value)
    }
    request.send(formdata); //自动设置Content-Type头
}
//监控HTTP上传进度
//查找所有含有‘fileDropTarget’类的元素
//并注册DnD事件处理程序使它们能够响应文件的拖放
//当文件放下时，上传它们到data-uploadto属性指定的URL
whenReady(function(){
    var elts=document.getElementsByClassName('fileDropTarget');
    for(var i=0;i<elts.length;i++){
        var target=elts[i];
        var url=target.getAttribute('data-uploadto');
        if(!url) continue;
        createFileUploadDropTarget(target,url);
    }
    function  createFileUploadDropTarget(target,url){
        //跟踪当前是否正在上传，因此我们能拒绝放下
        //我们可以处理多个并发上传
        //但对这个例子使用进度条通知太困难了
        var uploading=false;
        target.ondragenter=function(e){
            console.log('dragenter');
            if(uploading) return;//如果正在忙，忽略拖放
            var types= e.dataTransfer.types;
            if(types&&((types.contains&&types.contains('Files'))||(types.indexOf&&types.indexOf('Files')!=-1))){
                target.classList.add('wantdrop');
                return false;
            }
        };
        target.ondrapover=function(e){if(!uploading)return false;};
        target.ondrop=function(e){
            if(uploading) return false;
            var files= e.dataTransfer.types;
            if(files&&files.length){
                uploading=true;
                var message='Uploading files:<ul>';
                for(var i=0;i<files.length;i++)
                    message+='<li>'+files[i].name+'</li>';
                message+='<ul>';
                target.innerHTML=message;
                target.classList.remove('wantdrop');
                target.classList.add('uploading');
                var xhr=new XMLHttpRequest();
                xhr.open('POST',url);
                var body= new FormData();
                for(var j=0;j<files.length;j++) body.append(j,files[j]);
                xhr.upload.onprogress=function(e){
                    if(e.lengthComputable){
                        target.innerHTML=message+Math.round(e.loaded/ e.total*100)+'% Complete'
                    }
                };
                xhr.upload.onload=function(e){
                    uploading=false;
                    target.classList.remove('uploading');
                    target.innerHTML='Drop files to upload';
                };
                xhr.send(body);
                return false;
            }
            target.classList.remove('wantdrop');
        }
    }
});