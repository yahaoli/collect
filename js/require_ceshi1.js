require.config({
    baseUrl: "./js/",
    paths: {
        'jquery': "jquery.min",
        'li':'require_ceshi2'
    }
});
//自动设置data-main
require(['jquery','li'],function($,li){
    li.tan();
});
/*
//手动指定data-main
define(['jquery','li'],function($,li){
    li.tan();
});*/
