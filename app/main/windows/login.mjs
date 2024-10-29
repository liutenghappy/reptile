import {
	BrowserWindow
} from 'electron'
import {
	dirname
} from '../utils/index.mjs'
import path from 'node:path'

export default function createWindow() {
	let win = new BrowserWindow({
		width: 600,
		height: 300,
		icon: 'resource/logo.png',
		webPreferences: {
			preload: path.join(dirname(import.meta.url), '../preload.js')
		}
	});
	win.resizable = false;
	win.loadFile("app/renderer/pages/login/index.html");
	//win.webContents.openDevTools();
	return win
};