/*//动态原型模式
function Person(name){
   this.name=name;
    if(typeof this.sayName!='function'){
        Person.prototype.sayName=function(){
            console.log(this.name)
        }
    }
}
var friend = new Person('li');
friend.sayName();*/

//寄生构造模式
/*function Person1(name){
    var a=new Object();
    a.name=name;
    a.sayName=function(){
        console.log(this.name);
    };
    return a;
}
var friend1=new Person1('wang');
friend1.sayName();
function SpecialArray(){
    var values = new Array();
    values.push.apply(values, arguments);
    console.log(arguments);
    console.log(values);
    values.toPipedString = function(){
        return this.join("|");
    };
    return values;
}
var colors = new SpecialArray("red", "blue", "green");
console.log(colors.toPipedString());*/
//原型链问题
/*function SuperType(){
    this.colors = ["red", "blue", "green"];

}

function SubType(){
}
//    SuperType
SubType.prototype = new SuperType();
var instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); //"red,blue,green,black" 3
var instance2 = new SubType();
console.log(instance2.colors); //"red,blue,green,black"*/
//call与apply方法实现继承
//call(对象，参数，参数，......)
//apply(对象，[]或者arguments)
/*
function SuperType(){
    this.colors = ["red", "blue", "green"];
}
function SubType(){
//    SuperType
        SuperType.call(this);//用SuperType替换掉this完成继承
    }
    var instance1 = new SubType();
    instance1.colors.push("black");
    console.log(instance1.colors);    //"red,blue,green,black"
    var instance2 = new SubType();
    console.log(instance2.colors);*/
//apply的其他妙处
//比较大小
/*
var a=[1,2,3,4,5];
console.log(Math.max(a));//error Math.max(1,2,3,4)这种格式
console.log(Math.max.apply(null,a));//就能解决问题
var b=[6,7,8]
var values=new Array();
values.push.apply(values,b);
console.log(values);*/
//组合式继承
/*function a(name,age){
    this.name=name;
    this.age=age
}
a.prototype.sayName=function(){
    console.log(this.name);
};
function b(name,age){
    //继承属性
    a.call(this,name); //第二次调用a
    this.age=age
}
//继承方法
b.prototype=new a(); //第一次调动a
//让原型函数指向自己
b.prototype.constructor=b;
b.prototype.sayAge=function(){
    console.log(this.age)
};
var c=new b('li',12);
c.sayName();
c.sayAge();*/
//寄生式继承
/*function createAnother(a){
    var clone=Object(a);
    clone.sayHi=function(){
        console.log('hi');
    };
    return clone;
}
var person = {
    name: "Nicholas",
    friends: ["Shelby", "Court", "Van"]
};
var person1=createAnother(person);
person1.sayHi();*/
//最佳继承方式 寄生组合式继承 不破坏原型链  而且没有多余的属性
function inheritPrototype(subType, superType){
    var prototype = Object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}
function SuperType(name){
    this.name = name;
    this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
   console.log(this.name);
};
function SubType(name, age){
    SuperType.call(this, name);
    this.age = age;
}
inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function() {
    console.log(this.age);
};
var b=new SubType('li',13);
b.sayName();
b.sayAge();
