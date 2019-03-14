// function fibonacci(n){
//   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
// }
//
// console.log(fibonacci(5))
var curry = function (fn) {
  var args = [].slice.call(arguments, 1);
  return function() {
    console.log(args)
    var newArgs = args.concat([].slice.call(arguments));
    console.log([].slice.call(arguments))
    return fn.apply(this, args);
  };
};
function aaa (a,b) {
  console.log(a+b)
}
curry(aaa, 1, 2)()