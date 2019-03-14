function createCurry(func, args) {

  var arity = func.length;
  var args = args || [];
  return function() {
    var _args = [].slice.call(arguments);
    [].push.apply(_args, args);

    // 如果参数个数小于最初的func.length，则递归调用，继续收集参数
    if (_args.length < arity) {
      return createCurry.call(this, func, _args);
    }

    // 参数收集完毕，则执行func
    return func.apply(this, _args);
  }
}
function a (a,b,c) {
  return a+b+c
}
var b=createCurry(a)
console.log(b(1)(2,3))
