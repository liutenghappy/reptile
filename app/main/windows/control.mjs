import {
	BrowserWindow
} from 'electron'
import {
	dirname
} from '../utils/index.mjs'
import path from 'node:path'

export default function createWindow() {
	let win = new BrowserWindow({
		width: 650,
		height: 430,
		icon: 'resource/logo.png',
		webPreferences: {
			preload: path.join(dirname(import.meta.url), '../preload.js')
		}
	});
	win.resizable = false;
	win.loadFile("app/renderer/pages/control/index.html");
	//win.webContents.openDevTools();
	return win
};