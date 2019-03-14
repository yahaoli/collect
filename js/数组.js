var a=[{val:1},{val:3},{val:5},{val:4}];
console.log(a.sort(compare1));
/*function compare(value1,value2){
    if(value1<value2){
        return -1;
    }else if(value1>value2){
        return 1;
    }else {
        return 0;
    }
}*/
function compare1(value1,value2){
    return value1.val-value2.val
}
//连接数组
/*console.log(a.concat(11));
//获取起始位置到结束位置（不包括）
console.log(a.slice(1,4));
console.log(a.splice(0,1));//删除数组元素
console.log(a.indexOf(5));*/
//遍历所有元素
/*var everya= a.every(function(item,index,array){
    return (item>2);
});
console.log(everya);
//某个满足即可
var somea= a.some(function(item,index,array){
    return (item>2);
});
console.log(somea);
//匹配
var filtera= a.filter(function(item,index,array){
    return (item>2);
});
console.log(filtera);
//数组整体操作
var mapa= a.map(function(item,index,array){
    return (item+2);
});
console.log(mapa);
//遍历数组
a.forEach(function(item,index,array){

});
console.log(a);
//归并数组
var sum= a.reduce(function(prev,cur,index,array){
   return prev+cur;
});
//reduceRight 从尾开始遍历
console.log(sum);*/



