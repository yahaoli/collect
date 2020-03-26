js方面:
* js继承（6种继承方式）  
* js执行原理 
    * 微任务：Promise,process.next,MutationObserver,Object.defineProperty,Proxy 优先级：process.nextTick > Promise > MutationObserver
    * 宏任务：setImmediate,setTimeOut，setInterval,MessageChannel,dom点击事件，http请求 优先级：主代码块 > setImmediate > MessageChannel > setTimeout / setInterval
    * 宏任务广义上指所有代码，微任务跟宏任务的进入队列是同步执行，狭义宏任务放到宏任务eventqueue，微任务放到微任务队列
    * 所有同步代码执行完毕后再依次取出微任务和宏任务执行
* promise实现（promise的实现原理，promise.all，promise.finally的实现原理）
* 判断类型 typeof instanceof String.prototype.toString() isArray
    * typeof:
        * 能判断基本类型（除null，null会返回Object，详细原因请百度），Object，Function
    * instanceof:
        * 基于原型链判断
        * 递归查找left.__proto__直到等于null返回false或等于right.prototype返回true
* 闭包
* call，apply，bind的区别
* http1 1.1 2 3
* tcp udp
* tcp三次握手与为啥三次握手两次不够吗
* webpack loader与plugins的区别
* js垃圾回收
* js设计模式 单例 工厂
* tcp发包原理 慢启动 拥塞避免 快重传 快恢复
* AMD，CMD，COMMON.JS，import

vue方面:
* vue的异步操作是Promise>MutationObserver>setTimeOut
* 父子组件通信
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

css方面:
* flex
* 盒布局
* 双飞燕与圣杯布局
* 1px的问题
* 瀑布流
* 垂直居中
其他方面:
* 大数据10万条：
    * 采用现在虚拟列表页面保存一般3页（防止滚动空白问题）数据上拉替换当前dom增加高度控制位高度来撑开滚动条，下拉替换当前dom
    * 算法采用二分查找法，详细请百度js虚拟列表
