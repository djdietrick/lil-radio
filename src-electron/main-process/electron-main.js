import { app, nativeTheme, ipcMain, dialog } from 'electron'
// import db from '../db';
import server from '../server';
import MainWindow from './windows/main-window';
import MainTray from './windows/tray';
import TrayWindow from './windows/tray-window';
import StationWindow from './windows/station-window';
import path from 'path';

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow = null;
let stationWindow = null;
let settingsWindow = null;
let graqhqlWindow;
let tray;
let trayWindow;

function createBrowserWindow () {
  if(mainWindow === null) {
    mainWindow = new MainWindow(process.env.APP_URL, true);
    mainWindow.on('close', () => {
      mainWindow = null;
    })
  }
  mainWindow.focus();
}

function createSettingsWindow () {
  if(settingsWindow === null) {
    settingsWindow = new StationWindow(process.env.APP_URL + '/#/settings/', true);
    settingsWindow.on('close', () => {
      settingsWindow = null;
    })
  }
  settingsWindow.focus();
}

function createStationWindow(station) {
  stationWindow = new StationWindow(process.env.APP_URL + '/#/station/' + station.id, true);
  stationWindow.on('page-title-updated', function(e) {
    e.preventDefault();
  })
  stationWindow.setTitle(station.name);
  stationWindow.on('close', () => {
    stationWindow = null;
  })
}

async function start() {
  await server();
  graqhqlWindow = new MainWindow("http://localhost:5000/api", false);

  trayWindow = new TrayWindow(process.env.APP_URL + '/#/tray', true);
  tray = new MainTray(path.join(__dirname, '../icons/icon.ico'), trayWindow);

  //createBrowserWindow();
}

app.on('ready', () => {
  require('vue-devtools').install();
  start();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createBrowserWindow()
  }
})

ipcMain.on('openBrowser', () => {
  createBrowserWindow()
});

ipcMain.on('openSettings', () => {
  createSettingsWindow()
});

ipcMain.on('editStation', (event, arg) => {
  createStationWindow(arg);
});

ipcMain.on('closeStation', () => {
  if(stationWindow) {
    stationWindow.close();
  }
  stationWindow = null;
})