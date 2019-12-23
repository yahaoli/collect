//测试
//const a = 'a:6:{i:0;i:193;i:1;s:5:\"11185\";i:2;s:3:\"690\";i:4;s:22:\"2018-05-05 20:00-21:30\";i:5;s:7:\"5-5_5-6\";i:6;s:59:\"演出时间:20:00,座位分区:普通区,座位号:5-5_5-6\";}';
//const b = "a:6:{i:0;i:193;i:1;s:5:\"11185\";i:2;s:1:\"0\";i:4;s:22:\"2018-05-05 20:00-21:30\";i:5;s:0:\"\";i:6;s:18:\"演出时间:20:00\";}"
//const c = 'a:6:{i:0;i:193;i:1;i:11189;i:2;s:3:"688";i:4;s:22:"2018-05-07 20:00-21:30";i:5;s:15:"色头发热1-7";i:6;s:64:"演出时间:20:00,座位分区:VIP区,座位号:色头发热1-7";}';


export default function getShowInfoFromOrder(info){
	if(!info || typeof info!=="string") return null;
	const arr = info.split(";");
	let dateTime = arr[7];
	dateTime = dateTime.split(":");
	dateTime = dateTime.slice(2);
	dateTime[0] = dateTime[0].substring(1);
	dateTime[2] = dateTime[2].substring(0,dateTime[2].length-1);
	const date = dateTime[0].split(" ");
	dateTime = date[0] + " " + date[1]+ ":" +dateTime[1] + ":" +dateTime[2];
	let seatArr = arr[9] ? arr[9].split(":")[2] : null;
	let areaArr = arr[11] ? arr[11].split(":")[5] : null;
	let seat = null;
	let area = null;
	if(seatArr && seatArr!='""'){
		seat = seatArr.split("_").map((item)=>{
			let str = item;
			if(str.charAt(0)=='"') str = str.substring(1);
			if(str.charAt(str.length-1)=='"') str = str.substring(0,str.length-1);
			return str;
		});
	}
	if(areaArr) area = areaArr.split(",")[0];
	return{dateTime,seat,area}
}

