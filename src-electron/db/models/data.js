import path from 'path';
import fs from 'fs';

const DataType = Object.freeze({"DIR":1,"FILE":2});

export class Data {
    constructor(path) {
        this.path = path;
        this.type = fs.lstatSync(path).isDirectory() ? 
            DataType.DIR : DataType.FILE;
        console.log(fs.lstatSync(path));
        this.children = [];
        this.size = 0;
    }
}