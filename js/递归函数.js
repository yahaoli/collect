//这样的递归函数在严格模式和非严格模式都可以执行
var factorial = (function f(num){
    if (num <= 1){
        return 1;
    } else {
        return num * f(num-1);
    } });