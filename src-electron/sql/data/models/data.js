import * as path_lib from 'path';
import fs from 'fs';

export const DataType = Object.freeze({"DIR":1,"FILE":2});

export class Data {
    constructor({id, path, dataTypeId, size}) {
        this.id = id;
        this.path = path;
        this.type = (dataTypeId === 1 ? DataType.DIR : DataType.FILE);
        this.size = size;
    }

    static fromPath(p) {
        let newData = {}
        newData.path = p;
        newData.type = fs.lstatSync(p).isDirectory() ? 
            DataType.DIR : DataType.FILE;
        
        if(newData.type === DataType.FILE) {
            newData.size = fs.lstatSync(p).size;
        }
        return newData;
    }
}