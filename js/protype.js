 /*var a=function(name,age){
     this.name=name;
     this.age=age;
 };
 a.prototype={
     return_data:function(){
         return this.name+this.age+this.sex
     }
 };
var b=new a('li','19');
 alert(b.return_data());*/
 //继承  存在调用不变属性species造成内存浪费
 var animal=function(){
     this.species = "动物";
 };
 var cat=function(name,sex){
     this.name=name;
     this.sex=sex
 };
 cat.prototype=new animal();
 cat.prototype.constructor=cat;  //重定向函数指向cat
 var cat1=new cat('xiaohua','female');
 alert(cat1.species);
 //修改成这样
 /*var animal=function(){
 };
 animal.prototype.species='动物';
 var cat=function(name,sex){
     this.name=name;
     this.sex=sex
 };
 cat.prototype=animal.prototype;//
 cat.prototype.constructor=cat;  //重定向函数指向cat,造成animal的函数也指向cat
 var cat1=new cat('xiaohua','female');
 alert(cat1.species);*/
//继续修改为继承函数
 function extend(Child, Parent) {

     var F = function(){};//构造空对象 不占用内存 解决函数指向问题
     F.prototype = Parent.prototype;
     Child.prototype = new F();
     Child.prototype.constructor = Child;
     Child.uber = Parent.prototype;//意思是为子对象设一个uber属性，这个属性直接指向父对象的prototype属性。（uber是一个德语词，意思是"向上"、"上一层"。）这等于在子对象上打开一条通道，可以直接调用父对象的方法
 }
 //复制父类所有东西
 function Animal(){}
 Animal.prototype.species = "动物";
 function extend2(Child, Parent) {
     var p = Parent.prototype;
     var c = Child.prototype;
     for (var i in p) {
         c[i] = p[i];
     }
     c.uber = p;
 }
 //非构造函数的继承
 var Chinese = {
     nation:'中国'
 };
 var Doctor ={
     career:'医生'
 };
 //object方法
 function object(o) {
     function F() {}
     F.prototype = o;
     return new F();
 }
 var Doctor = object(Chinese);
//copy方法
 function deepCopy(p, c) {
     var c = c || {};
     for (var i in p) {
         if (typeof p[i] === 'object') {
             c[i] = (p[i].constructor === Array) ? [] : {};
             deepCopy(p[i], c[i]);
         } else {
             c[i] = p[i];
         }
     }
     return c;
 }
 var Doctor = deepCopy(Chinese);