var fs=require('fs');
var co=require('co')
var readFile = function (fileName){
    return new Promise(function (resolve, reject){
        fs.readFile(fileName, function(error, data){
            if (error) reject(error);
            resolve(data);
        });
    });
};
var gen = function* (){
    var f1 = yield readFile('./1');
    var f2 = yield readFile('./2');
    console.log(f1.toString());
    console.log(f2.toString());
};
co(gen).then(function(){
    console.log('done well')
});