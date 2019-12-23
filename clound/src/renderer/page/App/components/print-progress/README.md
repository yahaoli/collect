# 门票打印进度条

## 说明


```
改组件已经在app中引用，由于调用的地方比较广且不一定都在vue组件内，部分在store中调用，所以采用eventBus的方式的方式调用;
没有任何props，调用时传入按下面规则的打印任务序列，会按序列进行进度的显示与结果的反馈以及失败重试

```

## 使用

```
import onfire from "onfire.js";

onfire.fire('StartProgress', taskList, callback))

@taskList : 格式为数组，
包含以下内容
[{
	type: Number        //打印类型 1：售票打印 2：重打印
	task：()=>Promise,	//生成打印promise的方法，用来失败的时候重新调用
	taskInfo: 'String'  //任务信息，一般为`${order.ttitle} ( 订单号： ${order.ordernum} )`
}]
@callback : 打印任务都完成后点击确认后调用的回调方法

```