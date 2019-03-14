/*var x=1;
if(!!function f(){}){
    x+=typeof f;
}
console.log(x);
(function f(f){
    console.log(typeof f());    // ???
})(function(){return 1;});
console.log(typeof (2*3));    // ???
console.log(typeof (2+3));    // ???
var a=0,b=0;
console.log(a+++b);     // ???
console.log(a);         // ???
console.log(b);*/
/*var a,b,c;
a=b==c;
console.log(a);
console.log(1 && 3);            // ???
console.log(1 && "foo" || 0);   // ???
console.log(1 || "foo" && 0);*/
/*
var a=1;
var b=(a=(2,4,6))+a++;
console.log(a);
var val = 'smtg';
console.log('Value is ' + (val === 'smtg') ? 'Something' : 'Nothing');*/
/*var num = 0;

outermost:
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            if (i == 5 && j == 5) {
                break outermost;
            }
            num++;
        }
    }

console.log(num);*/
/*
 a:for(var i=0;i<10;i++){
 if(i==5){
 throw new Error("x不能是负数");
 break a;
 }
 }
 console.log(i);*/
/*var k;
for(i=0, j=0; i<10, j<6; i++, j++){
    k = i + j;
}
console.log(k);*/
/*
var i ='';
/!*for (;;) {
    if (i == 2) {
        continue;
    }
    if (i == 20) {
        break;
    }
    i++;
}*!/
console.log(!!i);*/
/*(function(a,b,c){
    console.log(a+b);
    c();
})(10,20,function(){
   console.log(4444);
});*/
//js链式调用
/*(function(){
    var a=function(name){

    };
    a.prototype={
        show1:function(){
            console.log(111);
            return this
        },
        show2:function(){
            console.log(222);
            return this
        }
    };
    var b=new a();
    b.show1().show2();
})();*/
/*window.API=window.API||function(){
        var name="hello world";
        this.setName=function(neName){
            name=neName;
            return this;
        };
        this.getName=function(){
            return name
        }
    };*/
//js构建接口
/*var Interface=function(name,methods){
 console.log(arguments.length);
 if(arguments.length!=2){
 throw new Error("Interface constructor called with"+arguments.length+"arguments,but expected exactly 2")
 }
 this.name=name;
 this.methods=[];
 for(var i= 0,len=methods.length;i<len;i++){
 if(typeof methods[i]!=='string'){
 throw  new Error("Interface constructor expects method names to be"+"passed in as a string")
 }
 this.methods.push(methods[i])
 }
 };
 var z=0;
 var b= new Interface("a",['c','d','f']);*/
//js单体懒加载：用的时候加载
/*
var example={};
example.methods=(function(){
    var flag;
    function constructor(){
        //主要代码
        return{
            showName:function(){
                var name="li";
                return name;
            }
        }
    }
    return{
        call_back:function(){
            if(!flag){
                flag=constructor()
            }
            return flag;
        }
    }
})();
console.log(example.methods.call_back().name());
var API2=API2||function(){
        var name="hello world";
        this.setName=function(neName){
            name=neName;
            return this;
        };
        this.getName=function(callback){
            callback(name);
            return this;
        }
    };
var o2=new API2;
o2.getName(function(data){console.log(data)}).setName('xiaoMing').getName(console.log);*/
/*scope = "global";
function f() {
    console.log(scope);  // 输出"undefined"，而不是"global"
    var scope = "local"; // 变量在这里赋初始值，但变量本身在函数体内任何地方均是有定义的
    console.log(scope);  // 输出"local"
}
f();*/
/*
var obj={
    0:'qian',
    1:'long',
    2:'chu',
    3:'tian',
    length:4
};
var _slice=[].slice;
var objArr=_slice.call(obj);
console.log(_slice);
console.log(objArr);*/
/*var a=["hello","world"];
console.log(Object.keys(a).length);//列举可枚举属性
console.log(Object.getOwnPropertyNames(a).length);//可列举不可枚举属性*/
/*
var a=" ";
console.log(Object.prototype.toString.call(a));//判断数据类型*/
/*var a=11.234;
console.log(a.toPrecision(3));//保留固定位数 可能会四舍五入  尽量避免用*/
/*var languages = [
    { name: "JavaScript", fileExtension: ".js" },
    { name: "TypeScript", fileExtension: ".ts" },
    { name: "CoffeeScript", fileExtension: ".coffee" }
];

console.table(languages);*/
function a (){
    console.count();
}
a();
a();