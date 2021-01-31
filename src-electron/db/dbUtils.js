import db from './index.js';
import fs from 'fs';
import path, { join } from 'path';

import {Song} from './models/song';

export async function getChunk(path) {
    return await db.findOne({_id: path});
}

export async function sweep() {
    db.settings.findOne({name: 'MUSIC_DIRS'}, (err, doc) => {
        let dirSizes = new Map();
        for(let dir of doc.value) {
           findSizeRec(dir, dirSizes, dir);
        }
        //console.log(dirSizes);
    })

    let song = await Song.build('D:/Dropbox/Music/Artists/Phish/2009.06.05 Live In Wantagh, NY/1-01 Wilson.mp3');
    console.log(song);
}

function findSizeRec(dir, dirSizes, startDir) {
    let stat = fs.lstatSync(dir);
    if(stat.isDirectory()) {
        dirSizes[dir] = 0;
        let children = fs.readdirSync(dir);
        for(let child of children) {
            findSizeRec(path.join(dir, child), dirSizes, startDir);
        }
    } else {
        const size = stat.size;
        let p = dir;
        while(p !== startDir) {
            p = path.join(p, '..');
            dirSizes[p] += size;
        }   
    }
    return;
}

function getFileInfo(path) {
    
}