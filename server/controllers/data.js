import {Data} from '../models/data';
import {getNextId} from '../utils/utils';

export const getData = (ctx) => {
    return new Promise((resolve, reject) => {
        ctx.db.all("SELECT * FROM data")
            .then(result => resolve(result.map(r => new Data(r))))
            .catch(err => reject(err));
    })
}

export const getDataFromPath = (db, path) => {
    return new Promise((resolve, reject) => {
        if(!path) reject('Provide a path');
        db.get(`SELECT * FROM data WHERE path="${path}"`)
            .then(result => result ? resolve(new Data(result)) : resolve(null))
            .catch(err => reject(err));
    });
}

export const getDataFromId = (ctx, id) => {
    return new Promise((resolve, reject) => {
        if(!id) reject('Provide an id');
        ctx.db.get(`SELECT * FROM data WHERE id=${id}`)
            .then(result => result ? resolve(new Data(result)) : resolve(null))
            .catch(err => reject(err));
    });
}

export const getDataFromSongId = (ctx, id) => {
    return new Promise(async (resolve, reject) => {
        if(!id) reject('Provide an id');
        ctx.db.get(`SELECT dataId from song_data WHERE songId=${id}`)
            .then(dataIdRes => {
                if(!result) reject('No data for songId ' + id);
                ctx.db.get(`SELECT * from data WHERE id=${dataIdRes.dataId}`)
                    .then(dataRes => resolve(new Data(dataRes)))
            })
            .catch(err => reject(err));
    });
}

export const insertData = (ctx, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await ctx.db.run(`INSERT INTO data(path, datatypeId, size)
                VALUES ("${data.path}", ${data.type}, ${data.size})`)
                data.id = res.lastID;
                resolve(data);
        } catch(e) {
            reject(e);
        }
        
    })
}

export const updateDataSize = (ctx, data) => {
    return new Promise(async (resolve, reject) => {
        ctx.db.run(`UPDATE data SET size=${data.size} WHERE id=${data.id}`)
            .then(result => resolve(data))
            .catch(err => reject(err));
    });
}

export const getPathFromSongId = (ctx, id) => {
    return new Promise(async (resolve, reject) => {
        ctx.db.get(`SELECT dataId FROM song_data WHERE songId=${id}`)
            .then(res => {
                if (!res) reject(`No song_data for songId ${id}`);
                ctx.db.get(`SELECT path FROM data WHERE id=${res.dataId}`)
                    .then(res2 => {
                        if(!res2) reject(`Could not find data with id ${res.dataId}`);
                        resolve(res2.path);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}