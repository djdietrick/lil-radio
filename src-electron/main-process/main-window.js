// const electron = require('electron');
// const { BrowserWindow } = electron;

import {BrowserWindow} from 'electron';

class MainWindow extends BrowserWindow {
  constructor(url) {
    super({
      height: 500,
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
    this.on('blur', this.onBlur.bind(this));
  }

  onBlur() {
    this.hide();
  }
}

export default MainWindow;
