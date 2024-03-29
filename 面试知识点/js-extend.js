function Person(name) {
    this.name=name;
    this.sum=function () {
        alert(this.name);
    }
}
Person.prototype.age=10;
//1原型链继承
//无法传参，构造函数指向父级，新实例共用父亲实例属性
function Per (name) {
    this.name=name;
}
Per.prototype=new Person()
//2借用构造函数
//无法使用父元素原型链
function Per(name) {
    Person.call(this,name);
}
//3组合继承
//调用两次父构造函数，还是会产生新实例共用父实例属性
function Per(name) {
    Person.call(this,name);
}
Per.prototype=new Person()
//4原型式继承
//跟原型链继承差不多只是用函数封装了一下
function content(obj) {
    function F() {
        ;
    };
    F.prototype=new obj()
    return new F()
}
person=content(new Person())
//5寄生式继承
//没什么鸟用只是把原型式继承又增加了一层函数
function content(obj) {
    function F() {
        ;
    };
    F.prototype=new obj()
    return new F()
}
function create(obj) {
    var sub=content(obj);
    sub.name=555;
    return sub
}
//寄生组合式继承
//完美
function content(obj) {
    function F() {
        ;
    };
    F.prototype=new obj()
    return new F()
}
function Per(name) {
    Person.call(this,name);
}
Per.prototype=content(Person.prototype)
Per.constructor=Per