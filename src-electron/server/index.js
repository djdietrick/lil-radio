import express from 'express';
import {graphqlHTTP} from 'express-graphql';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import {schema} from './schema';
import getPort from 'get-port';
import {execFile} from 'child_process';
import {getPathFromSongId} from './controllers/data';
import fs from 'fs';

const isDev = process.env.NODE_ENV === 'developement';

//sqlite3.verbose();

export default async () => {
    sqlite.open({
        filename: path.join(__dirname, '../sql/db/test.db'),
        driver: sqlite3.Database
    })
    .then(async db => {
        try {
            
            execFile(path.join(__dirname, '../../rust/target/release/lil-radio-rust.exe'),
                [path.join(__dirname, '../sql/db/test.db'), 'D:/Dropbox/Music/Artists'],
                (err, stdout, stderr) => {
                    console.log(stdout);
                    if(err) {
                        console.log(`Error: ${stderr}`);
                    }
                    console.log("Finished sweeping directories!");
                });
    
            const app = express();
            app.get('/', (req, res) => {
                res.send(path.join(__dirname, '../../dist/spa/index.html'))
            })

            app.use('/api', graphqlHTTP({
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

            app.get('/song/:id', async (req, res) => {
                const range = req.headers.range;
                if (!range) {
                    res.status(400).send("Requires Range header");
                }
                
                try {
                    let path = await getPathFromSongId({db}, req.params.id);
                    
                    const songSize = fs.statSync(path).size;
                    const chunkSize = 10 ** 5;
                    const start = Number(range.replace(/\D/g, ""));
                    const end = Math.min(start + chunkSize, songSize - 1);

                    const contentLength = end - start + 1;
                    const headers = {
                        "Content-Range": `bytes ${start}-${end}/${songSize}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": contentLength,
                        "Content-Type": "audio/mp3",
                    };

                    // HTTP Status 206 for Partial Content
                    res.writeHead(206, headers);

                    // create video read stream for this particular chunk
                    const audioStream = fs.createReadStream(path, { start, end });

                    // Stream the video chunk to the client
                    audioStream.pipe(res);

                } catch(e) {
                    return res.status(500).send("Could not find song with id " + req.params.id);
                }
            });
            
            const availPort = await getPort();
            //const port = isDev ? 5000 : availPort
            const port = 5000;
        
            app.listen(port, () => {
                console.log(`Server now up on http://localhost:${port}`);
            })
        } catch(e) {
            console.log(e);
        }
        
    })
    .catch(err => console.log(err))
}


