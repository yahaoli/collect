function list() {
    // 将arguments转成数组
    var a= Array.prototype.slice.call(arguments);
    console.log(a)
}
list(1,2,3);  // [1, 2, 3]
/*var numbers = [5, 6, 2, 3, 7];
var max = Math.max.apply(Math, numbers);
console.log(max) ; */// 7
/*function list1() {
    // 将arguments转成数组
    return Array.prototype.slice.call(arguments);
}
var leadingThirtysevenList = list1.bind(undefined, 37); // 绑定函数
var list1 = leadingThirtysevenList(1, 2, 3); // 调用绑定函数
console.log(list1); // [37, 1, 2, 3]
Function.prototype.construct = function(aArgs) {
    var fConstructor = this,
        fNewConstr = function() {
            fConstructor.apply(this, aArgs);
        };
    fNewConstr.prototype = fConstructor.prototype;
    console.log(new fNewConstr());
    return new fNewConstr();
};
function MyConstructor () {
    console.log(22222);
    for (var nProp = 0; nProp < arguments.length; nProp++) {
        //console.log(arguments,this);
        this["property" + nProp] = arguments[nProp];
    }
}
var myArray = [4, "Hello world!", false];
var myInstance = MyConstructor.construct(myArray);*/
//console.log(myInstance.property1);                // logs "Hello world!"
//console.log(myInstance instanceof MyConstructor); // logs "true"
//console.log(myInstance.constructor);              // logs "MyConstructor"