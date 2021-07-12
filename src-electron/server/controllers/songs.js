import Song from '../models/song';
import {getNextId} from '../utils/utils';

export const getSongs = ctx => {
    return new Promise((resolve, reject) => {
        ctx.db.all('SELECT * FROM song;')
            .then(result => resolve(result.map(r => new Song(r))))
            .catch(err => reject(err))
    })
}

export const getSong = (ctx, {id, title}) => {
    return new Promise((resolve, reject) => {
        if(!id && !title) reject('Provide a parameter');
        let a = id && title;
        ctx.db.all(`SELECT * FROM song WHERE ${id ? 'id=' + id : ''} 
            ${a ? ' AND ' : ''}${title ? 'title="' + title + '"' : ''};`)
            .then(result => resolve(result.map(r => new Song(r))))
            .catch(err => reject(err))
    })
}

export const getSongById = (ctx, id) => {
    return new Promise((resolve, reject) => {
        ctx.db.get(`SELECT * FROM song WHERE id=${id}`)
            .then(result => resolve(new Song(result)))
            .catch(err => reject(err));
    })
}

export const getSongsByArtist = (ctx, id) => {
    return new Promise((resolve, reject) => {
        ctx.db.all(`SELECT * FROM song WHERE artistId=${id};`)
            .then(result => resolve(result.map(r => new Song(r))))
            .catch(err => reject(err))
    })
}

export const getSongsInAlbum = (ctx, id) => {
    return new Promise((resolve, reject) => {
        ctx.db.all(`SELECT * FROM song WHERE albumId=${id};`)
            .then(result => resolve(result.map(r => new Song(r))))
            .catch(err => reject(err))
    })
}

export const doesSongExist = ({db}, title, artist, album) => {
    return new Promise(async (resolve, reject) => {
        try {
            const artistRes = await db.get(`SELECT id FROM artist WHERE name="${artist}"`);
            if(artistRes) resolve(false);

            const albumRes = await db.get(`SELECT id FROM album WHERE title="${album} AND artistId=${artistRes.id}`);
            if(!albumRes) resolve(false);

            const songRes = await db.get(`SELECT id FROM song WHERE title="${title} AND albumId=${albumRes.id} AND artistId=${artistRes.id}`);
            resolve(bool(songRes));
        } catch(err) {
            reject(err);
        }
    })
}

export const insertSong = ({db}, song) => {
    return new Promise(async (resolve, reject) => {
        try {
            const requiredFields = ['title', 'albumId', 'artistId', 'duration', 'track', 'disk'];
            if (!requiredFields.every(f => Object.keys(song).contains(f))) {
                reject('Missing some required fields');
            }
            const res = await db.run(`INSERT INTO song(title, albumId, artistId, duration, track, disk)
                VALUES ("${song.title}", ${song.albumId}, ${song.artistId}, ${song.duration}, ${song.track}, ${song.disk});`)
            song.id = res.lastId;
            resolve(song);
        } catch(e) {
            reject(e);
        }
    });
}

export const getSongsInChunk = (ctx, chunkId) => {
    return new Promise((resolve, reject) => {
        ctx.db.all(`SELECT songId FROM chunk_song WHERE chunkId=${chunkId}`)
            .then(result => resolve(Promise.all(result.map(r => getSongById(ctx, r.songId)))))
            .catch(err => reject(err));
    });
}

export const searchSongs = (ctx, title) => {
    return new Promise((resolve, reject) => {
        ctx.db.all(`SELECT * FROM song WHERE title LIKE '%${title}%'`)
            .then(result => resolve(result.map(r => new Song(r))))
            .catch(err => reject(err));
    })
}