js方面:
* 函数的防抖节流
* 代码实现发布订阅模式
* es5代码实现es6中的class
* jsonp原理
* 链式调用
* [js继承（6种继承方式）](https://www.cnblogs.com/ranyonsue/p/11201730.html)  
* js执行原理 
    * 微任务：Promise,process.next,MutationObserver,Object.defineProperty,Proxy 优先级：process.nextTick > Promise > MutationObserver
    * 宏任务：setImmediate,setTimeOut，setInterval,MessageChannel,dom点击事件，http请求 优先级：主代码块 > setImmediate > MessageChannel > setTimeout / setInterval
    * 宏任务广义上指所有代码，微任务跟宏任务的进入队列是同步执行，狭义宏任务放到宏任务eventqueue，微任务放到微任务队列
    * 所有同步代码执行完毕后再依次取出微任务和宏任务执行
* promise实现（promise的实现原理，promise.all，promise.finally的实现原理）
* 判断类型 typeof,instanceof,Object.prototype.toString,isArray
    * typeof:
        * 能判断基本类型（除null，null会返回Object，详细原因请百度），Object，Function
    * instanceof:
        * 基于原型链判断
        * 递归查找left.__proto__直到等于null返回false或等于right.prototype返回true
    * isArray:
        * es6判断是否是数组的方法
    * Object.prototype.toString
        * 终极无敌方法（详情请百度）
* 闭包
* bind，apply的实现
* call，apply，bind的区别
* http1 1.1 2 3
* tcp udp
* tcp三次握手与为啥三次握手两次不够吗
* webpack loader与plugins的区别
* js垃圾回收
* js设计模式 单例 工厂
* tcp发包原理 慢启动 拥塞避免 快重传 快恢复
* AMD，CMD，COMMON.JS，import
* 订阅者，发布者模式
* js里的valueOf，toString以及es6中Symbol.toStringTag、Symbol.toPrimitive
* js defineProperty 数据描述符和存取描述符（便于理解方法属性eg：Array.push）
    * 公共属性
        * configurable：是否可以删除目标属性或是否可以再次修改属性的特性
        * enumerable：此属性是否可以被枚举（使用for...in或Object.keys()）。设置为true可以被枚举；设置为false，不能被枚举。默认为false。
    * 数据描述符
        * writable： 属性的值是否可以被重写。设置为true可以被重写；设置为false，不能被重写。默认为false
        * value： 属性对应的值,可以使任意类型的值，默认为undefined
    *  存取描述符
        * getter ：是一种获得属性值的方法
        * setter：是一种设置属性值的方法。
        
算法方面:
* 柯西加法
* 实现版本号比大小  
* JS实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有两个
* 判断同花顺,取5-7张牌，判断其中是否有同花顺
 
vue方面:
* vue的异步操作是Promise>MutationObserver>setTimeOut
* 父子生命周期顺序
    * 一、加载渲染过程
        * 父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted
    * 二、子组件更新过程
        * 父beforeUpdate->子beforeUpdate->子updated->父updated
    * 三、父组件更新过程
        * 父beforeUpdate->父updated
    * 四、销毁过程
        * 父beforeDestroy->子beforeDestroy->子destroyed->父destroyed
* 边界情况处理（组件递归）
* computed与watch的区别
* nextTick实现原理
* extend与component的关系与区别
* 组件通信
* virtual DOM 理解与算法
* key的作用

react方面：
* 生命周期（挂载过程，更新过程，销毁过程）
* 创建组建的几种方法（class，function，createReactClass）
* 父子组件生命周期顺序
* 组件性能优化（shouldComponentUpdate生命周期）
* redux react-redux 及 redux异步
* 函数组件的hook
* createElement 和 cloneElement 区别
* [React Element 和 React Component](https://segmentfault.com/a/1190000011413614)

css方面:
* flex
* 盒布局
* 双飞燕与圣杯布局
* 1px的问题
* 瀑布流
* 垂直居中

其他方面:
* 大数据10万条：
    * 采用现在虚拟列表页面保存一般3页（防止滚动空白问题）数据上拉替换当前dom增加高度控制位的高度来撑开滚动条，下拉替换当前dom减少高度控制位的高度来缩减滚动条
    * 算法采用二分查找法，详细请百度js虚拟列表
* 前端工程化理解
* [微前端-阿里框架](https://qiankun.umijs.org/)
