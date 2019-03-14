function Foo() {
    getName = function () { console.log (1); };
    return this;
}
Foo.getName = function () { console.log (2);};
Foo.prototype.getName = function () { console.log (3);};
var getName = function () { console.log (4);};
function getName() { console.log (5);}

//答案：
Foo.getName();//2
getName();//4
Foo().getName();//1
getName();//1
new Foo.getName();//2
new Foo().getName();//3
new new Foo().getName();//3
/*
function fun(n,o) {
    console.log(o);
    return {
        fun:function(m){
            return fun(m,n);
        }
    };
}
var a = fun(0);  a.fun(1);  a.fun(2);  a.fun(3);//undefined,?,?,?
var b = fun(0).fun(1).fun(2).fun(3);//undefined,?,?,?
var c = fun(0).fun(1);  c.fun(2);  c.fun(3);//undefined,?,?,?*/
