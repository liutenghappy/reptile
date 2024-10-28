import {
	app,
	BrowserWindow,
	Menu
} from 'electron'
import './server/src/index.mjs'
import handleIpc from './ipc.mjs'
import request from "./server/utils/request.mjs";
import createLoginWindow from './windows/login.mjs'
import createControlWindow from './windows/control.mjs'

let win;

function createWindow() {
	request.get('/iam/api/account/info').then((res) => {
		win = createControlWindow();
	}).catch(() => {
		win = createLoginWindow();
	}).finally(() => {
		 //win.webContents.openDevTools();
	})
}



app.whenReady().then(() => {
	Menu.setApplicationMenu(null)
	createWindow()
	handleIpc()
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0)(createWindow());
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});