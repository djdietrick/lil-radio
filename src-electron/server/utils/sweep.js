import Song from '../models/song';
import fs from 'fs';
import path from 'path';
import {getDataFromPath, insertData, updateDataSize} from '../controllers/data';
import { insertSong } from '../controllers/songs';
import {Data, DataType} from '../models/data';
import {getNextId} from './utils';

export function sweep(db) {
    return new Promise(async (resolve, reject) => {
        try {
            let musicDirRes = await db.get(`SELECT * FROM settings WHERE name="MUSIC_DIRS"`);
            if(!musicDirRes) reject("No music directory specified");

            let dirSizes = new Map();
            for(let dir of musicDirRes.value.split(';')) {
                findSizeRec(dir, dirSizes, dir);
            }
            for(let p in dirSizes) {
                await updateDir(db, p, dirSizes);
            }
            console.log("Music library loaded!");
            resolve();
        } catch(e) {
            reject(e);
        }   
    })
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

async function updateDir(db, p, dirSizes) {
    getDataFromPath(db, p).then(async (prevData) => {
        if(!prevData) {
            let data = Data.fromPath(p);
            if(data.type === DataType.DIR) {
                data.size = dirSizes[p];
                data = await insertData({db}, data);
                for(let child of fs.readdirSync(p))
                    await updateDir(db, path.join(p, child), dirSizes);
            } else {
                let song = await Song.build(db, p);
                song = await insertSong({db}, song);
                data = await insertData({db}, data);
                await db.run(`INSERT INTO song_data(songId, dataId) 
                    VALUES (${song.id}, ${data.id})`);
                console.log(`Added song: ${song.title} by ${song.artistId}`);
            }
        } else if (prevData.type === DataType.DIR && prevData.size != dirSizes[p]) {
            prevData.size = dirSizes[path];
            await updateDataSize({db}, prevData);
            let children = fs.readdirSync(p);
            for(let child of children) 
                await updateDir(db, path.join(p, child), dirSizes);
        }
    })
}