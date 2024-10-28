import {
	ipcMain,
	dialog,
	Notification,
	BrowserWindow
} from 'electron'
import createLoginWindow from './windows/login.mjs'
import createControlWindow from './windows/control.mjs'
import {db,defaultData} from './db/index.mjs'
import fs from 'node:fs'


export default function() {
	ipcMain.handle('notice', async (event, type,msg) => {
		 if(type===1){
			dialog.showMessageBoxSync({
				type: 'warning',
				message: msg
			})
		} if (type === 2) {
			dialog.showMessageBoxSync({
				type: 'error',
				message: msg
			})
		}else if(type===3){
			const id = dialog.showMessageBoxSync({
				type: 'question',
				message:msg,
				buttons:['确定','取消'],
				defaultId :1,
				cancelId :1
			})
			return id
		}
	})

	ipcMain.handle('tabWindow', async (event, type) => {
		let win = BrowserWindow.getFocusedWindow()
		win.hide()
		if (type === 1) {
			createLoginWindow()
		} else if (type === 2) {
			createControlWindow()
		}
		win.destroy()
	})

	ipcMain.handle('dbRead', async (event) => {
		return await db.data
	})

	ipcMain.handle('dbWrite', async (event, data) => {
		db.data = data;
		await db.write()
	})
	
	ipcMain.handle('dbReset', async (event, data) => {
		db.data = defaultData;
		await db.write()
	})
	
	ipcMain.handle('logError', (event, data) => {
		
		function generateData(data){
			function getDate(stamp) {
			  let date = new Date(stamp);
			  function formate(v) {
			    return v < 10 ? "0" + v : v;
			  }
			  let y = date.getFullYear();
			  let m = formate(date.getMonth() + 1);
			  let d = formate(date.getDate());
			  let h = formate(date.getHours());
			  let mm = formate(date.getMinutes());
			  let s = formate(date.getSeconds());
			
			  return `${m}-${d} ${h}:${mm}:${s}`;
			}
			
			const time  = getDate(Date.now())
			
			return `[${time}] ${data}\n`
		}
		fs.appendFile('errorLog.txt',generateData(data),(err=>{
			if(err){
				console.log(err)
			}
		}))
	})
}