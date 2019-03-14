/*function numToRMB(num) {
    var num1=(num*1).toString(),RMB=['仟万','佰万','拾万','万','仟','佰','拾',''].reverse(),CN=['壹','贰','叁','肆','伍','陆','柒','捌','玖'],str='';
    for(var len=num1.length,i=len-1;i>=0;i--){
        str+=num1[len-i-1]>0?CN[num1[len-i-1]-1]+RMB[i]:i>=1&&num1[len-i]>0?"零":'';
    }
    return str+'元';
}*/
function DX(n) {
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
        return "数据非法";
    var unit = "千百拾亿千百拾万千百拾元角分", str = "";
    n += "00";
    var p = n.indexOf('.');
    if (p >= 0) {n = n.substring(0, p) + n.substr(p+1, 2)};
    unit = unit.substr(unit.length - n.length);
    for (var i=0; i < n.length; i++) {
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i)
    };
    console.log(str)
    return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
}
const toChineseNum = (num) => {
    const keys = ['零','一','二','三','四','五','六','七','八','九']
    var count = ['','十','百','千']
    var str ='';
    var nums = num.toString().split('').reverse();
    nums.map(function (a, index) {
        str = (keys[a]+ ( a==0?'': count[index>3 ? index-4 : index]))+(index=='4'?'万':'')+str
    })
    return str.replace(/(零(?=零))|(零$)|(零(?=万))/g,'')
}
console.log(toChineseNum(10101010));
//console.log(DX(101010.01));
//console.log(numToRMB(101010));
//console.log(new Date().getUTCDate());
/*
var a=new Date(),b;
console.log(a);
setTimeout(function () {
    b=new Date()
    console.log(b<a);
},1000);*/
