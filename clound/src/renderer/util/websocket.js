let __uid__ = 0;
let _wscache_ = {};
const getUID = () => ++__uid__;
const isString = (val) => typeof val==="string";
const isObject = (val) => Object.prototype.toString.call(val)==="[object Object]";
const isFunction = (val) => typeof val==="function";

function Ws(url,cbs){
    if(!url) return console.error("url必传");
    const that = this;
    this.ws = null;
    this.__cbs__ = {};
    this.url = url;
    // 0 : "连接还没开启",
    // 1 : "连接已开启并准备好进行通信",
    // 2 : "连接正在关闭的过程中",
    // 3 : "连接已经关闭，或者连接无法建立"
    this.readyState = -1;
    this.cbs = Object.assign({},{
        onopen(e){},
        onclose(e){},
        onerror(e){},
        onmessage(e){return e},
        onsend(data){return data}
    },cbs || {})

    this.init();

}
Ws.prototype.init = function(){
    const that = this;
    let url = this.url;
    let cbs = this.cbs;
    let ws = this.ws = new WebSocket(url);
    ws.onopen = function(e){
        that.readyState = ws.readyState;
        cbs.onopen.call(that,e)
    };
    ws.onclose = function(e){
        that.readyState = ws.readyState;
        cbs.onclose.call(that,e);
    };
    ws.onerror = function(e){
        that.readyState = ws.readyState;
        cbs.onerror.call(that,e)
    };
    ws.onmessage = function(e){
        that.readyState = ws.readyState;
		let data = JSON.parse(e.data);
		let uid = data.req_u_id;
		let type = data.type;
		let id = type=="readidcardinfo" ? type : uid;
		if(!id) return false;
		let fns = that.__cbs__[id];
		if(fns){
			fns.forEach((fn)=>{
				if(isFunction(fn)){
					e = cbs.onmessage(e);
					fn.call(that,e.data,e)
				}
			})
		}

    };
},
Ws.prototype.send = function(data,fn){
    if(!data) return false;
    const uid = getUID();
    data["req_u_id"] = uid;
    if(isFunction(fn)){
		this.__cbs__[uid] = this.__cbs__[uid] || (this.__cbs__[uid]=[])
		this.__cbs__[uid].push(fn);
	}
    const onsend = this.cbs.onsend;
    let _data = onsend(data);
    if(this.ws && this.readyState==1){
        this.ws.send(JSON.stringify(_data));
    }
}

Ws.prototype.close = function(){
    if(this.ws) this.ws.close();
    this.ws = null;
    this.readyState = -1;
}

Ws.prototype.reconnect = function(){
    const that = this;
    const url = this.url;
    let cbs = this.cbs;
    let ws = this.ws = new WebSocket(url);
    return new Promise((resolve,reject)=>{
        ws.onopen = function(e){
            that.readyState = ws.readyState;
            resolve(e);
        };
        ws.onerror = function(e){
            that.readyState = ws.readyState;
            reject(e);
		};
		ws.onclose = function(e){
			that.readyState = ws.readyState;
			cbs.onclose.call(that,e);
		};
		ws.onmessage = function(e){
			that.readyState = ws.readyState;
			let data = JSON.parse(e.data);
			let uid = data.req_u_id;
			let type = data.type;
			let id = type=="readidcardinfo" ? type : uid;
			if(!id) return false;
			let fns = that.__cbs__[id];
			if(fns){
				fns.forEach((fn)=>{
					if(isFunction(fn)){
						e = cbs.onmessage.call(that,e);
						fn.call(that,e.data,e)
					}
				})
			}
		};
    })

}
Ws.prototype.on = function(type,fn){
	if(type && isString(type) && isFunction(fn)){
		this.__cbs__[type] = this.__cbs__[type] || (this.__cbs__[type]=[]);
		this.__cbs__[type].push(fn);
	}
}
Ws.prototype.off = function(type){
	if(type && isString(type) && this.__cbs__[type]){
		this.__cbs__[type] = null;
		delete this.__cbs__[type];
	}
}

export default function(url,cbs){
    if(!url) url = "ws://localhost:12302/printDemo/";
    // if(!url) url = "ws://192.168.0.131:12302/printDemo/";
    if(_wscache_[url]) return _wscache_[url];
    _wscache_[url] = new Ws(url,cbs);
    return _wscache_[url];
}


