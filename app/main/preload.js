const {
	contextBridge,
	ipcRenderer
} = require('electron/renderer')

contextBridge.exposeInMainWorld('notice', {
	warning: (msg) => ipcRenderer.invoke('notice', 1, msg),
	error: (msg) => ipcRenderer.invoke('notice', 2, msg),
	confirm: (msg) => ipcRenderer.invoke('notice', 3, msg),
})

contextBridge.exposeInMainWorld('tabWindow', {
	tabLogin: () => ipcRenderer.invoke('tabWindow', 1),
	tabControl: () => ipcRenderer.invoke('tabWindow', 2)
})

//数据库操作
contextBridge.exposeInMainWorld('dbOperation', {
	read: () => ipcRenderer.invoke('dbRead'),
	write: (data) => ipcRenderer.invoke('dbWrite', data),
	reset: () => ipcRenderer.invoke('dbReset') //重置
})

//打印日志
contextBridge.exposeInMainWorld('log', {
	error: (error) => ipcRenderer.invoke('logError', error),
})