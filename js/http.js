var http=require('http');
http.createServer(function(req,res){
    res.writeHead(200,{'Content-type':'text/html'});
    res.write('<h1>node.js</h1>');
    res.end('<p>hello world</p>')
}).listen(3000);
console.log('server start');
/*
var fs=require('fs');
fs.readFile('text.txt','utf-8',function(err,data){
    if(err){
        console.log( err);
    }else {
        console.log(data)
    }
});*/
//get请求
/*var http = require('http');
var url = require('url');
var util = require('util');
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(util.inspect(url.parse(req.url, true)));
}).listen(3000);*/
//post请求
/*
var http = require('http');
var querystring = require('querystring');
var util = require('util');
http.createServer(function(req, res) {
    var post='';
    req.on('data',function(chunk){
       post+=chunk
    });
    req.on('end',function(){
        post=querystring.parse(post);
        res.end(util.inspect(post))
    });
}).listen(3000);*/
//console.log(require.extensions);