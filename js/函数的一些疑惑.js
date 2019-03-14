//所有的函数都会进行相应的隐式转换 即调用函数名时而不是执行函数就会相应地调用toString以及valueOf
function fn1() {
    return 20;
}

fn1.toString = function() {
    return 10;
}

console.log(fn1 + 10);
function fn2() {
    return 20;
}

fn2.toString = function() {
    return 10;
}

fn2.valueOf = function() {
    return 5;
}

console.log(fn2 + 10);
function fn3() {
    return 20;
}

fn3.toString = function() {
    return 10;
}

console.log(fn3 + 10);
//函数的柯里化
//柯里化（英语：Currying），又称为部分求值，是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回一个新的函数的技术，新函数接受余下参数并返回运算结果。
function add() {
    // 第一次执行时，定义一个数组专门用来存储所有的参数
    var _args = [].slice.call(arguments);

    // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值
    var adder = function () {
        var _adder = function() {
            [].push.apply(_args, [].slice.call(arguments));
            return _adder;
        };

        // 利用隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
        _adder.toString = function () {
            return _args.reduce(function (a, b) {
                return a + b;
            });
        }

        return _adder;
    }
    return adder.apply(null, [].slice.call(arguments));
}

// 输出结果，可自由组合的参数
console.log(add(1, 2, 3, 4, 5));  // 15
console.log(add(1, 2, 3, 4)(5));  // 15
console.log(add(1)(2)(3)(4)(5));  // 15
