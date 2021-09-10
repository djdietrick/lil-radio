// const electron = require('electron');
// const { BrowserWindow } = electron;

import {BrowserWindow} from 'electron';

class MainWindow extends BrowserWindow {
  constructor(url, devtools = false) {
    super({
      height: 1000,
      width: 1400,
      //frame: false,
      resizable: false,
      //show: false,
      webPreferences: { 
        backgroundThrottling: false,
        nodeIntegration: true,
        webSecurity: false
    }
    });

    this.loadURL(url);
    if(devtools)
      this.webContents.openDevTools();
    //this.on('blur', this.onBlur.bind(this));
  }
}

export default MainWindow;
