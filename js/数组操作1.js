(function(){
    /*var a=[0,1,2,3],b=[0,3],c=[11,15],d=[];
    var e=[];
    b.forEach(function(item,index,array){
       e.push(a.indexOf(item));
    });
    a.forEach(function(item,index,array){
        d[index]=0;
    });
    e.forEach(function(item,index,array){
        d[item]=c[index];
    });
    console.log(d)*/
    var b=['c','d','e','f','c','c','e','e'];
    function unique3(array){
        console.log(array);
        var n = []; //结果数组
        //从第二项开始遍历
        for(var i = 0; i < array.length; i++) {
            //如果当前数组的第i项在当前数组中第一次出现的位置不是i，
            //那么表示第i项是重复的，忽略掉。否则存入结果数组
            var count = 0;
            for(var j=i;j<array.length;j++)
            {

                if(array[i] == array[j])
                {
                    count++;
                }

            }
            if (array.indexOf(array[i]) == i&&count%2!=0){ n.push(array[i])}
            /*else {
                c=array[0];
                if(array[i]==c){
                    ++d
                }else {
                    d=1;
                    c=array[i];
                }
                if(n.indexOf(array[i])>=0){
                    n.splice(n.indexOf(array[i]),1)
                }
            }*/
        }
        return n;
    }
    console.log(unique3(b.sort()));
  /*  var ary =["aaa","ee","bbb","aaa","ccc","ccc","aaa","ee","haha"];
    var res = [];
    ary.sort();
    for(var i = 0;i<ary.length;)
    {

        var count = 0;
        for(var j=i;j<ary.length;j++)
        {

            if(ary[i] == ary[j])
            {
                count++;
            }

        }
        res.push([ary[i],count]);
        i+=count;

    }
//res 二维数维中保存了 值和值的重复数
    for(var  i = 0 ;i<res.length;i++)
    {
        console.log("值:"+res[i][0]+"           重复次数:"+res[i][1]+"<br/>");
    }*/
})();
