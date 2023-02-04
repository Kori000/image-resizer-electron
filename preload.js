const { contextBridge, ipcRenderer } = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const Toastify = require('toastify-js')

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir()
})

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
  dirname: (...args) => path.dirname(...args)
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args))
})

contextBridge.exposeInMainWorld('toastify', {
  toast: options => Toastify(options).showToast()
})
