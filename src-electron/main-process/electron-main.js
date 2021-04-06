import { app, BrowserWindow, nativeTheme } from 'electron'
// import db from '../db';
import server from '../sql/server';
import MainWindow from './main-window';
import MainTray from './tray';
import path from 'path';

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    //require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow;
let graqhqlWindow;
let tray;

async function createWindow () {
  /**
   * Initial window options
   */
  //app.dock.hide();

  await server();

  mainWindow = new MainWindow(process.env.APP_URL, true);
  graqhqlWindow = new MainWindow("http://localhost:5000");

  //tray = new MainTray(path.join(__dirname, '../icons/icon.ico'), mainWindow);

  //mainWindow.on('closed', () => {
  graqhqlWindow.on('closed', () => {
    mainWindow = null;
    tray = null;
  })
}

app.on('ready', () => {
  require('vue-devtools').install();
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// import {sweep} from '../db/dbUtils';
// sweep();