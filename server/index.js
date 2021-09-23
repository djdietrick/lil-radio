import express from 'express';
import {graphqlHTTP} from 'express-graphql';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import {schema} from './graphql';
import getPort from 'get-port';
import {getPathFromSongId} from './controllers/data';
import chokidar from 'chokidar';
import {sweepDir} from './utils/sweep'
import { format } from 'url';
import {createSettingsWindow} from '../src-electron/main-process/electron-main';

const isDev = process.env.NODE_ENV === 'developement';

//sqlite3.verbose();

class Server {
    constructor() {
        this.watchers = [];
        this.app = express();
        
        //const availPort = await getPort();
        //const port = isDev ? 5000 : availPort
        this.port = 5000;

        this.init();
    }

    init() {
        sqlite.open({
            filename: path.join(__dirname, '../db/db/test.db'),
            driver: sqlite3.Database
        })
        .then(async db => {
            try {
                this.app.use('/api', graphqlHTTP({
                    graphiql: true,
                    pretty: true,
                    schema,
                    context: {
                        db: {
                            get: (...args) => db.get(...args),
                            all: (...args) => db.all(...args),
                            run: (...args) => db.run(...args)
                        }
                    }
                }))
                
                let musicDirs = '';
                try {
                    musicDirs = await db.get("SELECT value FROM settings WHERE name='MUSIC_DIRS'");
                    musicDirs = musicDirs.value;
                } catch(e) {
                    console.log('DB does not exist, creating...');
                }
                
                // let p = process.platform === 'win32' ? 'D:/Dropbox/Music/Artists/' : '/Users/djdietrick/Dropbox/Music/Artists';
                // sweepDir(p);

                if(musicDirs.length > 0) {
                    for(let dir of musicDirs.split(';')) {
                        this.addWatcher(dir);
                    }
                } else {
                    // Empty sweep will just create db
                    sweepDir(musicDirs);
                    createSettingsWindow();
                }
                
            } catch(e) {
                console.log(e);
            }
        }).catch(e => console.log(e));
    }

    async addWatcher(dir) {
        await sweepDir(dir);
        this.watchers.push(chokidar.watch(dir, {persistent: true, ignoreInitial: true}).on('all', (e, p) => {
            console.log(`Detected update in location [${p}]`);
            sweepDir(p);
        }).on('ready', () => {
            console.log(`Now watching ${dir} for updates`);
        }))
    }

    removeWatcher(dir) {
        for(let i = 0; i < this.watchers.length; i++) {
            let watched = this.watchers[i].getWatched();
            let watchedDir = Object.keys(watched)[0];
            if(watchedDir.indexOf(dir) != -1) {
                console.log(`Unwatching ${dir}`)
                this.watchers[i].unwatch(dir);
                this.watchers.splice(i, 1);
                return;
            }            
        }
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server now up on http://localhost:${this.port}`);
        })
    }
}

export default Server;

// CODE FOR STREAMING OVER THE WEB, NOT WORKING

// app.get('/', (req, res) => {
//     res.send(path.join(__dirname, '../../dist/spa/index.html'))
// })
// app.get('/song/:id', async (req, res) => {
//     const range = req.headers.range;
//     if (!range) {
//         res.status(400).send("Requires Range header");
//     }
    
//     try {
//         let path = await getPathFromSongId({db}, req.params.id);
        
//         const songSize = fs.statSync(path).size;
//         const chunkSize = 10 ** 5;
//         const start = Number(range.replace(/\D/g, ""));
//         const end = Math.min(start + chunkSize, songSize - 1);

//         const contentLength = end - start + 1;
//         const headers = {
//             "Content-Range": `bytes ${start}-${end}/${songSize}`,
//             "Accept-Ranges": "bytes",
//             "Content-Length": contentLength,
//             "Content-Type": "audio/mp3",
//         };

//         // HTTP Status 206 for Partial Content
//         res.writeHead(206, headers);

//         // create video read stream for this particular chunk
//         const audioStream = fs.createReadStream(path, { start, end });

//         // Stream the video chunk to the client
//         audioStream.pipe(res);

//     } catch(e) {
//         return res.status(500).send("Could not find song with id " + req.params.id);
//     }
// });