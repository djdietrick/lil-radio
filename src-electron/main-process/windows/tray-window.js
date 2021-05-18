// const electron = require('electron');
// const { BrowserWindow } = electron;

import {BrowserWindow} from 'electron';

class TrayWindow extends BrowserWindow {
  constructor(url, devtools = false) {
    super({
      height: 400,
      width: 300,
      frame: false,
      resizable: false,
      show: false,
      webPreferences: { 
        backgroundThrottling: false,
        nodeIntegration: true,
        webSecurity: false
    }
    });

    this.loadURL(url);
    if(devtools)
      this.webContents.openDevTools();
    this.on('blur', this.onBlur.bind(this));
  }

  onBlur() {
    this.hide();
  }
}

export default TrayWindow;
