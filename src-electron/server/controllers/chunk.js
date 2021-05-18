import { Chunk } from "../models/chunk"

export const getChunk = (ctx, id) => {
    return new Promise((resolve, reject) => {
        ctx.db.get(`SELECT * FROM chunk WHERE id=${id}`)
            .then(result => resolve(new Chunk(result)))
            .catch(err => reject(err));
    })
}

export const getChunksForStation = (ctx, stationId) => {
    return new Promise((resolve, reject) => {
        ctx.db.all(`SELECT * FROM chunk WHERE stationId=${stationId}`)
            .then(result => resolve(result.map(r => new Chunk(r))))
            .catch(err => reject(err));
    })
}

export const insertChunk = (ctx, chunk) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await ctx.db.run(`INSERT INTO chunk (stationId) VALUES (${chunk.stationId})`);
            chunk.id = res.lastID;
            resolve(chunk);
        } catch(e) {
            reject(e);
        }
    })
}

export const deleteChunk = (ctx, id) => {
    return new Promise((resolve, reject) => {
        ctx.db.run(`DELETE FROM chunk WHERE id=${id}`)
            .then(result => resolve())
            .catch(err => reject(err));
    })
}