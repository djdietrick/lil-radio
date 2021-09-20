import db from '../db/index.js';
import fs from 'fs';
import path, { join } from 'path';

import Song from '../db/models/song';
import {Data, DataType} from '../db/models/data';

import {getData, createOrUpdateData} from '../db/controllers/data';
import {createOrUpdateSong} from '../db/controllers/songs';

export async function getChunk(path) {
    return await db.findOne({_id: path});
}

export async function sweep() {
    db.settings.findOne({name: 'MUSIC_DIRS'}, async (err, doc) => {
        let dirSizes = new Map();
        for(let dir of doc.value) {
           findSizeRec(dir, dirSizes, dir);
        }
        for(let p in dirSizes) {
            await updateDir(p, dirSizes);
        }
        console.log("Music library loaded!");
        // db.albums.find({_id: '2009.06.05 Live In Wantagh, NY-Phish'}, (err, doc) => {
        //     console.log(doc);
        // }) 
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

async function updateDir(path, dirSizes) {
    getData(path).then(async (prevData) => {
        if(!prevData) {
            const data = new Data(path);
            if(data.type === DataType.DIR) {
                data.size = dirSizes[path];
            } else {
                try {
                    let song = await Song.build(path);
                    await createOrUpdateSong(song);
                } catch(e) {
                    console.log(`Error creating song ${path}: ${e}`);
                }
                
            }
            //console.log(`Creating new ${data.type == DataType.DIR ? 'Dir' : 'File'} data: ${data}`);
            await createOrUpdateData(data);
            for(let child of data.children) 
                updateDir(child, dirSizes);
        } else if(prevData.type === DataType.DIR && prevData.size != dirSizes[path]) {
            prevData.size = dirSizes[path];
            prevData.children = fs.readdirSync(path);
            await createOrUpdateData(prevData);
            //console.log(`Updating existing data: ${prevData}`);
            for(let child of prevData.children) 
                updateDir(child, dirSizes);
        }
        return;
    })
    .catch(err => {console.log(err)});  
}