// const electron = require('electron');
// const { BrowserWindow } = electron;

import {BrowserWindow} from 'electron';

class StationWindow extends BrowserWindow {
  constructor(url, devtools = false) {
    super({
      height: 600,
      width: 800,
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
    this.setMenu(null);
    if(devtools)
      this.webContents.openDevTools();
    //this.on('blur', this.onBlur.bind(this));
  }

}

export default StationWindow;
