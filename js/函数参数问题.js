/*function add(){
    //arguments 参数数组
    if(arguments.length==1){
        return arguments[0];
    }else{
        return arguments[0]+arguments[1];
    }
}
console.log(add(1));
console.log(add(1,2));
function sum(num){
    if(num<1){return 1;}
    else {return num+arguments.callee(num-1);}
}*/
//apply&call函数
window.color='red';
var o={color:'red'};
function color_show(){
    console.log(this.color);
}
color_show.call(this);
color_show.call(window);
color_show.call(o);