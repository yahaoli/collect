/*
/ /g 全局
/ /i 不区分大小写
/ /m 表示多行模式
元字符
 ( [ { \ ^ $ | ) ? * + .]}
*/

var a=/[bc]at/i;//匹配bat或cat
var a1=/\[bc\]at/i;//匹配[bc]at
var a2=/.at/gi;//匹配at结尾结尾的
var a3=/\.at/gi;//匹配.at结尾结尾的
var pa="cat,bat,rat";
var matches=a2.exec(pa);
console.log(matches.index);
console.log(matches[0]);
console.log(a2.lastIndex);
matches=a2.exec(pa);
console.log(matches.index);
console.log(matches[0]);
console.log(a2.lastIndex);