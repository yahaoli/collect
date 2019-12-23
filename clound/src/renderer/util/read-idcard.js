/*
 * @Author: huangzhiyang 
 * @Date: 2017-11-02 16:10:52 
 * @Last Modified by: huangzhiyang
 * @Last Modified time: 2018-03-01 15:31:53
 * 
 * 身份证读卡服务
 * 
 * 使用：
 * import ReadIDCard from "@/util/read-idcard.js"
 * const rd = new ReadIDCard({
 *      url:           ""                //可选
 *      onopen:        function(e){}     //可选  当连接成功时
 *      onclose:       function(e){}     //可选  当关闭时
 *      onerror:       function(e){}     //可选  当发生错误时
 *      onconnectfail: function(e){}     //可选  无法建立连接或失败时
 *      onmessage:     function(e){}     //可选  当接收到服务器返回的消息时
 * });
 * 
 * 注意：new ReadIDCard()实例化其实什么都没做，没有发起连接请求，需要手动发起：
 * 
 * //发起连接请求
 * rd.connect(); 
 * 
 * rd.close() //断开ws链接 不再读身份证
 * 
 * 
 */






const fn = new Function();
export default function ReadIDCard({
    url = "ws://localhost:12302/printDemo/",
    onopen = fn,
    onerror = fn,
    onconnectfail = fn,  //无法建立连接或失败时
    onmessage = fn,
    onclose = fn
}){
    this.ws = null;
    this.readyState = -1;
    this.url = url;
    this.onopen = onopen;
    this.onerror = onerror;
    this.onconnectfail = onconnectfail;
    this.onmessage = onmessage;
    this.onclose = onclose;
}

//向服务端发给连接请求
ReadIDCard.prototype.connect = function(){


    //readyState的取值
    //CONNECTING：值为0，表示正在连接。
    //OPEN：值为1，表示连接成功，可以通信了。
    //CLOSING：值为2，表示连接正在关闭。
    //CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
    const state = this.readyState;
    if(state==0 || state==1 || state==2) return false;

    const that = this;
    const ws = that.ws = new WebSocket(this.url);
    ws.onopen = function(e){
        var json = {
            cmd : "idread",
            reqid : "2"
        }
        ws.send(JSON.stringify(json));
        that.onopen(e);
    }
    ws.onmessage = function(e){
        that.readyState = e.target.readyState;
        that.onmessage(e)
    }
    ws.onerror = function(e){
        const readyState = e.target.readyState;
        that.readyState = readyState;
        that.onerror(e); 
        //https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
        if(readyState==3 || readyState==2){
            that.ws = null;
            that.onconnectfail(e);
        }
    }
    ws.onclose = function(e){
        that.readyState = e.target.readyState;
        that.onclose(e);
    }
    
    
}
//发送消息给服务端
ReadIDCard.prototype.send = function(params){
    if(!this.ws) return false;
    this.ws.send(JSON.stringify(params));
}
//关闭链接
ReadIDCard.prototype.close = function(){
    if(!this.ws) return false;
    this.ws.close && this.ws.close();
    this.ws = null;
}






