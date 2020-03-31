const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { autoUpdater } = require("electron-updater")

let _win;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
  return win
}

// Auto Updater

const sendStatusToWindow = text => _win.webContents.send('message', text)

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
  sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
  console.log('update-available', info)
  sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', (info) => {
  console.log('update-not-available', info)
  sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (err) => {
  console.error('autoupdater', err)
  sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('update-downloaded', info)
  sendStatusToWindow('Update downloaded');
  autoUpdater.quitAndInstall();
});

// APP

app.whenReady().then(() => {
  _win = createWindow();
  _win.webContents.on('did-finish-load', ()=>{
    autoUpdater.checkForUpdates();
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on('get-version', (event) => {
  event.returnValue = app.getVersion()
})