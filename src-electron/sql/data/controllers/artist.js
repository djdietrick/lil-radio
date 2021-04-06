import Artist from '../models/artist';
import {getNextId} from '../utils/utils';

export const getArtists = ctx => {
    return new Promise((resolve, reject) => {
        ctx.db.all('SELECT * FROM artist;')
            .then(result => resolve(result.map(r => new Artist(r))))
            .catch(err => reject(err))
    })
}

export const getArtist = (ctx, {id, name}) => {
    return new Promise((resolve, reject) => {
        if(!id && !name) reject('Provide a parameter');
        let a = id && name;
        ctx.db.get(`SELECT * FROM artist WHERE ${id ? 'id=' + id : ''} 
            ${a ? ' AND ' : ''}${name ? 'name="' + name + '"' : ''};`)
            .then(result => {
                if(result) {
                    resolve(new Artist(result));
                } else {
                    resolve(null);
                }})
            .catch(err => reject(err))
    })
}

export const insertArtist = (ctx, name) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Inserting into artist: " + name);
            const res = await ctx.db.run(`INSERT INTO artist(name) VALUES("${name}");`);
            console.log(res);
            resolve(new Artist({id: res.lastID, name}));
        } catch(e) {
            reject(e);
        }
    })
}