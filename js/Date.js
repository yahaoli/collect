var now=new Date();
var a=new Date(Date.parse('2016-12-31'));//转换字符串格式为日期格式
//日期格式化字符串函数  因浏览器不同而不同  尽量不要使用
/*console.log(a.toDateString());
console.log(a.toTimeString());
console.log(a.toLocaleDateString());
console.log(a.toUTCString());
console.log(a.toLocaleTimeString());*/
console.log(Date.parse('2016-12-31 00:00:00'));
//可以设置对应的增加年月日，日期会自动增长
a.setMonth(a.getMonth()+1)
a.setDate(a.getDate()+1)
a.setFullYear(a.getFullYear()+1)
console.log(a.getFullYear());