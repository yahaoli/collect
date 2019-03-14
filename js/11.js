

/*var str=["1.js","3.js","5.css","2.js"];
str.forEach(function (name) {
	//console.log(name);
    var a=name.match(/(.+)\.js$/);
    console.log(a)
})*/
/*
//异步执行
setTimeout(function() {
    console.log(1)
}, 0);
//立即执行
new Promise(function executor(resolve) {
    console.log(2);
    for( var i=0 ; i<10000 ; i++ ) {
        i == 9999 && resolve();
    }
    console.log(3);
}).then(function() {
	//所有同步过程执行完后第一执行
    console.log(4);
});
//同步过程
console.log(5);*/
/*function addX(y) {
    return function (x) {
        return x + y;
    };
}
console.log(addX(2)(1));*/
/*
var async=function(callback){
    //read data
    setTimeout(function(){
        callback('data');
    },1000);//1秒后回调
};
//使用
async(function(data){
    console.log(data);
});
*/
/*
function fn(n) {
    var number;
    if(n===undefined){return '请输入数字'};
    if(typeof n ==='string'){
       if(!isNaN(n)){number=n}else {  return '请输入数字'};
    }
    if(typeof n ==='number'){
        number=parseInt(n)
    }
	var arr=[];
	for(var i=0;i<number;i++){
	    var a=getrandom();
	    var b=check(arr,a);
	    if(b){
	        i--
        }else {
	        arr.push(a)
        }
    }
    return arr;
}
function getrandom() {
	var a=parseInt(Math.random()*31)+2;
	return parseInt(a);
}
function check(arr,b) {
	if(arr.length===0){return false}else {
		for(var i=0,length=arr.length;i<length;i++){
			if(arr[i]===b){
				return true;
			}
		}
	}
}
console.log(fn(1.2));*/
// console.log((1/2).toFixed(2)*100+'%');
// function GetRequest() {
//     var url = location.search; //获取url中"?"符后的字串
//     var theRequest = new Object();
//     if (url.indexOf("?") != -1) {
//         var str = url.substr(1);
//         strs = str.split("&");
//         for(var i = 0; i < strs.length; i ++) {
//             theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
//         }
//     }
//     return theRequest;
// }
// var a=function () {
// 	var a='li';
// 	this.name='1111';
// 	//return a
// }
// console.log(a())
// var b=new a()
// console.log(b)
// function createFunction (){
//     var result = [];
//     for(var i=0;i<10;i++){
//         result[i] = function(){
//             return i;
//         }
//     }
//     return result;
// }
// function say888() {
//     var num = 887;
//     var sayAlert = function() { console.log(num); }
//     num++;
//     return sayAlert;
// }
// say888()();
// var a = 20;
// function fn() {
//     function foo() {
//         console.log(this.a);
//     }
//     foo();
// }
// fn();
// function fn() {
//     return 20;
// }
//
// console.log(fn+ 10);
// function fn() {
//     return 20;
// }
//
// fn.toString = function() {
//     return 10;
// }
//
// console.log(fn + 10);
// function aaa() {
// 	console.log([].slice.call(arguments,1))
// }
// aaa(1,2,3);
/*
console.log('1');

setImmediate(function () {
    console.log('2');
});

setTimeout(function () {
    console.log('3');
},0);

process.nextTick(function () {
    console.log('4');
});

//1 4 2 3也可能是1 4 3 2*/
// window.a=1;
// console.log(a);
/*
function aaa() {
	console.log(this.name)
}
var a={name:'123'};
aaa.apply(a);*/
// for(var i=0;i<5;i++){
// 	if(i===2){break;}
// }
// [1,2,3,4].forEach(function (index,val) {
//
// });
/*let arr = ['b', 'c'];
console.log(...arr)*/
//console.log(['a', ...arr, 'd'])
/*
var arr=[1,2,3]
var arr1=arr;
arr.length=0
console.log(arr1)*/

/*
var twice = {
    apply (target, ctx, args) {
        //console.log(...arguments);
        console.log( Reflect.apply(...arguments) * 2)
    }
};
function sum (left, right) {
    return left + right;
};
var proxy = new Proxy(sum, twice);
proxy(1, 2)// 6
proxy.call(null, 5, 6) // 22
proxy.apply(null, [7, 8]) // 30*/
// var x = 1;
// function foo(x, y = function() { x = 2; }) {
//     var x = 3;
//     y();
//     console.log(x);
// }
//
// foo() // 3
// console.log(x) // 1
// var a=function aaa() {
// 	return 3333
// }
// var x=1314
// console.log(x.toString(16))
'use strict';
var a = 20;
function foo () {
    var a = 1;
    var obj = {
        a: 10,
        c: this.a + 20,
        fn: function () {
            return this.a;
        }
    }
    return obj.c;

}
console.log(foo());    // ？
console.log(window.foo());  // ?
