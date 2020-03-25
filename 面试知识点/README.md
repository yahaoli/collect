####js方面
    1.js继承  
    2.js执行原理 
        微任务：Promise,process.next,MutationObserver,Object.defineProperty,Proxy 优先级：process.nextTick > Promise > MutationObserver
        宏任务：setImmediate,setTimeOut，setInterval,MessageChannel,dom点击事件，http请求 优先级：主代码块 > setImmediate > MessageChannel > setTimeout / setInterval
        宏任务广义上指所有代码，微任务跟宏任务的进入队列是同步执行，狭义宏任务放到宏任务eventqueue，微任务放到微任务队列
        所有同步代码执行完毕后再依次取出微任务和宏任务执行
    3. promise
    4. 判断类型 typeof instanceof String.prototype.toString() isArray
    5. http1 1.1 2 3
    6. tcp udp
    7. tcp三次握手与为啥三次握手两次不够吗
    8. webpack loader与plugins的区别
    9. js垃圾回收
    10.js设计模式 单例 工厂
    11.tcp发包原理 慢启动 拥塞避免 快重传 快恢复
####vue方面
    1.vue的异步操作是Promise>MutationObserver>setTimeOut
    2.  一、加载渲染过程
        父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted
        二、子组件更新过程
        父beforeUpdate->子beforeUpdate->子updated->父updated
        三、父组件更新过程
        父beforeUpdate->父updated
        四、销毁过程
        父beforeDestroy->子beforeDestroy->子destroyed->父destroyed
####css方面
    flex
    盒布局
    双飞燕与圣杯布局
    1px的问题
####其他方面
    大数据10万条：采用现在虚拟列表页面保存一般3页（防止滚动空白问题）数据上拉替换当前dom增加高度控制位高度来撑开滚动条，下拉替换当前dom
    算法采用二分查找法，详细请百度js虚拟列表
