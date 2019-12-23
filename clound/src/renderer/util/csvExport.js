const FileSaver = require("file-saver");
import { Message } from "element-ui";

// thead：表头  ['A','B','C']
// tbody: 表格对应表头的字段顺序 ['propA','propB','propC']
// tableData: 表格数组数据 [{propA:'这是A',propB:'这是V',propC:'这是C',} ... ]
// fileName： 导出文件名

export default function(
	thead = [],
	tbody = [],
	tableData = [],
	fileName = "导出"
) {
	if (tableData.length == 0 || !tableData) {
		Message.error("没有可供导出的数据！");
		return false;
	}

	let preContent = "\uFEFF"; //防乱码

	let theadPart =
		thead.reduce((pre, cur, index) => {
			return pre + (index == 0 ? "" : ",") + cur;
		}, "") + "\n";

	let tbodyPart = tableData.reduce((pre, cur, index) => {
		let lineStr = tbody.reduce((linePre, lineCur, index) => {
			return (
				linePre +
				(index == 0 ? "" : ",") +
				(cur[lineCur] === undefined ? "" : cur[lineCur])
			);
		}, "");
		return pre + (index == 0 ? "" : "\n") + lineStr;
	}, "");

	let blob = new Blob([preContent + theadPart + tbodyPart], {
		type: "text/plain;charset=utf-8"
	});

	FileSaver.saveAs(blob, `${fileName}.csv`);
}
