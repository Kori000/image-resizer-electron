const path = require('path');
console.log(path);
const { app, BrowserWindow } = require('electron');

function createMainWindow(params) {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: 500,
    height: 600
  });

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

app.whenReady().then(() => {
  createMainWindow();
});
