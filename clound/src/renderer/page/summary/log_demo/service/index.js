import service from './request'
import store from '@/store' // 不能删除  ！！ 删掉不报错，请求失败

/**
 * @author xiaoqiang
 * @date 2018/4/27
 * @description log
 * @param {String} bt 开始时间
 * @param {String} et 结束时间
 * @param {String,Number} page 第几页
 * @param {String,Number} [pageSize] - 每页数量
 * @param print 是否打印模式
 * @name getLog
 *
 */
export function getLog ({bt, et, page, pageSize = 10, print} = {}) {
	return new Promise((resolve, reject) => {
		service({
			url: 'PCService.svc',
			method: 'post',
			data: `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetOperationLogs xmlns="http://12301.cc"><oman>${store.state.userInfo.account}</oman><beginTime>${bt} 00:00:00</beginTime><endTime>${et || bt} 23:59:59</endTime><pageIndex>${page || 1}</pageIndex><pageSize>${pageSize || 10}</pageSize></GetOperationLogs></s:Body></s:Envelope>`
		}).then(res => {
			// 测试新修改检测最后一页
			/*setTimeout(() => {
				resolve(parseDom(res.data, data.print))
			}, 5000);*/
			resolve(parseDom(res.data, print))
		}, err => {
			reject(err)
		})
	})
}

/**
 * @author xiaoqiang
 * @name parseDom
 * @date 2018/4/27
 * @Description: 解析dom，是否为打印模式
 * @param dom 传入XML字符串
 * @param print 是否打印模式
 */
function parseDom (dom, print = '') {
	if (!dom) return false;
	let xmlDom, obj;
	try {
		xmlDom = loadXML(dom);
		obj = {
			pageIndex: xmlDom.querySelector('PageIndex').innerHTML || '',
			pageSize: xmlDom.querySelector('PageSize').innerHTML || '',
			total: xmlDom.querySelector('TotalCount').innerHTML || '',
		};
	} catch (e) {
		console.log(e);
		return false
	}

	let OperationLogs = xmlDom.querySelectorAll('OperationLogs'), list = [],
		props = ['Log', 'OType', 'Orders', 'ProductName', 'TrMan', 'TrTime'];
	for (let i = 0; i < OperationLogs.length; i++) {
		let obj = {}, OperationLog = OperationLogs[i];
		for (let j = 0; j < props.length; j++) {
			let prop = props[j];
			if (print) {
				obj[prop] = OperationLog.querySelector(prop).innerHTML.replace(/[\n|\r]/g, '   ') || '';
			} else {
				obj[prop] = OperationLog.querySelector(prop).innerHTML || '--';
			}
		}
		list.push(obj);
	}
	obj.list = list;
	return obj;
}

/**
 * @author xiaoqiang
 * @date 2018/4/27
 * @Description: 解析xml为dom
 * @param {String} xmlString xml字符串
 * @return xml dom|null
 */
function loadXML (xmlString) {
	let xmlDoc = null;
	//判断浏览器的类型
	//支持IE浏览器
	if (!window.DOMParser && window.ActiveXObject) {   //window.DOMParser 判断是否是非ie浏览器
		let xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
		for (let i = 0; i < xmlDomVersions.length; i++) {
			try {
				xmlDoc = new ActiveXObject(xmlDomVersions[i]);
				xmlDoc.async = false;
				xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
				break;
			} catch (e) {
				console.log(e);
			}
		}
	}
	//支持Mozilla浏览器
	else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
		try {
			/* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
             * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
             * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
             * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
             */
			let domParser = new DOMParser();
			xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
		} catch (e) {
			console.log(e);
			return null
		}
	}

	return xmlDoc;
}
