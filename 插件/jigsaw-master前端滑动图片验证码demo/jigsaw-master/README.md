# jigsaw
canvas滑动验证码

### 用法：
1. 引入jigsaw.js 和 jigsaw.css

2. 
```
jigsaw.init({
  el: document.getElementById('container'),
  onSuccess: function () { ... },
  onFail: function () { ... },
  onRefresh: function () { ... }
})
```

jigsaw.init接收一个配置对象，el属性为页面容器元素， 后面三个属性分别为验证成功、验证失败和点击刷新按钮后的回调函数。

### Tips：

1. 图片由 https://picsum.photos/ 随机产生，然后使用canvas裁剪生成。

2. 未编译ES6语法，建议使用现代浏览器体验。
3.  jigsaw babel编译过的试用移动端,jigsawMobile移动端,jigsawPc电脑端,这两个es6都未编译过

