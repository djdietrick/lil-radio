import Album from '../models/album';
import {getNextId} from '../utils/utils';

export const getAlbums = ctx => {
    return new Promise((resolve, reject) => {
        ctx.db.all('SELECT * FROM album;')
            .then(result => resolve(result.map(r => new Album(r))))
            .catch(err => reject(err))
    })
}

export const getAlbum = (ctx, {id, title}) => {
    return new Promise((resolve, reject) => {
        if(!id && !title) reject('Provide a parameter');
        let a = id && title;
        ctx.db.all(`SELECT * FROM album WHERE ${id ? 'id=' + id : ''} 
            ${a ? ' AND ' : ''}${title ? 'title="' + title + '"' : ''};`)
            .then(result => resolve(result.map(r => new Album(r))))
            .catch(err => reject(err))
    })
}

export const getAlbumByArtist = (ctx, title, artistId) => {
    return new Promise((resolve, reject) => {
        ctx.db.get(`SELECT * FROM album WHERE title="${title}" AND artistId=${artistId}`)
            .then(result => result ? resolve(new Album(result)) : resolve(null))
            .catch(err => reject(err))
    })
}

export const getAlbumsByArtist = (ctx, id) => {
    return new Promise((resolve, reject) => {
        ctx.db.all(`SELECT * FROM album WHERE artistId=${id};`)
            .then(result => resolve(result.map(r => new Album(r))))
            .catch(err => reject(err))
    })
}

export const insertAlbum = (ctx, title, artistId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Inserting into album: " + title);
            const res = await ctx.db.run(`INSERT INTO album(title, artistId) VALUES("${title}", ${artistId});`)
            resolve(new Album({id: res.lastID, title, artistId}));
        } catch(e) {
            reject(e);
        }
        
    })
}