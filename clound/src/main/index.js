import path from "path";
import { app, BrowserWindow,ipcMain,shell,Menu} from 'electron'
import {autoUpdater} from "electron-updater"
//禁止检测到新版本时就自动下载新版本安装包
autoUpdater.autoDownload = false;

import pck from "../../package.json";
const origin = process.env.ORIGIN;
const updateUrl = pck.updateUrl[origin];

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
	global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow;


const winURL = process.env.NODE_ENV === 'development'
	? `http://localhost:9080`
	: `file://${__dirname}/index.html`;

function createWindow() {

	mainWindow = new BrowserWindow({
		height: 560,
		width: 560,
		webPreferences : {
			webSecurity : false //允许跨域请求
		}
	})

	if(!global.services.setupPlatform()) mainWindow.webContents.send("setup-platform-fail");

	mainWindow.loadURL(winURL)

	mainWindow.on('close', () => {
		mainWindow.webContents.send("window-close");
	})

	mainWindow.on('closed', () => {
		mainWindow = null;
	})



}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		mainWindow.webContents.send("window-all-close");
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})

global.services = {
	winMin: function(){},
	winMax: function(){
		if (mainWindow && !mainWindow.isMaximized()) {
			// mainWindow.restore();
			mainWindow.maximize();
		}
	},
	//设置边框大小
	setWinSize: function ({ width, height }) {
		if (!mainWindow) return false;
		mainWindow.setSize(width, height);
		mainWindow.center();
	},
	//下载到最新版本后安装更新
	quitAndInstall : function(){
		autoUpdater.quitAndInstall();
	},
	//检查更新
	checkForUpdate : function(){
		// if(process.env.NODE_ENV=='development') return false;
		autoUpdater.setFeedURL(updateUrl);
		//执行自动检查更新
		autoUpdater.checkForUpdatesAndNotify();
	},
	//检测到最新版本后，下载最新版本的安装包
	downloadUpate : function(){
		autoUpdater.downloadUpdate();
	},
	//启动应用时就启动硬件服务
	setupPlatform : function(){
		const extraPath = process.env.NODE_ENV=='development' ?
			path.resolve(__dirname, '../../extra') :
			path.resolve(__dirname, '../../../app.asar.unpacked/extra');
		const exePath = path.resolve(extraPath,"./service/PFT.Platform.exe");
		const result = shell.openItem(exePath);
		return result;
	}
};

/**
 * huangzhiyang 20180517
 * Auto Updater 自动更新功能
 */
const sendUpdateMessage = (type,data) => {
	if(!mainWindow) return false;
	mainWindow.webContents.send("update-message",{type:type,data:data});
}

// 监听检查更新出错事件
autoUpdater.on('error',function(error){
	sendUpdateMessage('error',error.toString());
});
// 监听正在检查更新事件
autoUpdater.on('checking-for-update',function(){
	sendUpdateMessage("checking-for-update",arguments[0]);
});
// 监听不需要更新事件
autoUpdater.on('update-not-available', function(info){
	sendUpdateMessage('update-not-available',info);
});
// 监听需要更新事件
autoUpdater.on('update-available',function(info){
	sendUpdateMessage('update-available',info);
});
// 监听下载进度事件
autoUpdater.on('download-progress',function(progressObj){
	sendUpdateMessage('download-progress',progressObj);
})
//监听下载完成事件
autoUpdater.on('update-downloaded',function(info){
	sendUpdateMessage("update-downloaded",info);
});
