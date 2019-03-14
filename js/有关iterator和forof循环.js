var someString = "hi";
typeof someString[Symbol.iterator]
// "function"

var iterator = someString[Symbol.iterator]();

console.log(iterator.next()) // { value: "h", done: false }
console.log(iterator.next()) // { value: "i", done: false }
console.log(iterator.next())