import express from 'express';
import {graphqlHTTP} from 'express-graphql';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import {schema, rootValue} from './schema';
import getPort from 'get-port';
import {sweep} from './utils/sweep';
import {execFile} from 'child_process';

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
            app.use('/', graphqlHTTP({
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


