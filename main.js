const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'development'
const isMac = process.platform === 'darwin'

let mainWindow

// create the main window
function createMainWindow(params) {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    devTools: true,
    width: isDev ? 1300 : 1500,
    height: isDev ? 800 : 1000,
    webPreferences: {
      nodeIntegration: true,
      contexteIsolation: false,
      preload: path.join(__dirname, './preload.js')
    }
  })

  // open dev tools if in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

// create the about window
function createAboutWindow(params) {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    devTools: true,
    width: 300,
    height: 300
  })

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}

// when electron is ready
app.whenReady().then(() => {
  createMainWindow()

  // Remove mainWindow from memory when closed
  mainWindow.on('closed', () => (mainWindow = null))

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})
console.log(app.name)
// create menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: () => createAboutWindow()
            }
          ]
        }
      ]
    : []),
  {
    role: 'fileMenu'
  },
  ...(!isMac
    ? [
        {
          label: 'help',
          submenu: [
            {
              label: 'About',
              click: () => createAboutWindow()
            }
          ]
        }
      ]
    : [])
]

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer')
  resizeImage(options)
})

async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height
    })
    // Create filename
    const filename = path.basename(imgPath)

    // Create dest folder if no exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }

    // Write file to dest folder
    fs.writeFileSync(path.join(dest, filename), newPath)

    // Send sucess to render
    mainWindow.webContents.send('image:done')

    // Open dest folder
    shell.openPath(dest)
  } catch (error) {
    console.log(error)
  }
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})
