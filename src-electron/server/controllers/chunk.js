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

export const createOrUpdateChunk = (ctx, chunk) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(chunk.id) {
                await deleteChunk(ctx, chunk.id);
            }
            const res = await ctx.db.run(`INSERT INTO chunk (stationId) VALUES (${chunk.stationId})`);
            chunk.id = res.lastID;
            for(let i = 0; i < chunk.songs.length; i++) {
                await ctx.db.run(`INSERT INTO chunk_song (chunkId, songId, ind) VALUES (${chunk.id}, ${chunk.songs[i]}, ${i})`);
            }
            resolve(await getChunk(ctx, chunk.id));
        } catch(e) {
            reject(e);
        }
    })
}

export const deleteChunk = async (ctx, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await ctx.db.run(`DELETE FROM chunk_song WHERE chunkId=${id}`)
            await ctx.db.run(`DELETE FROM chunk WHERE id=${id}`)
            resolve();
        } catch(e) {
            reject(e);
        }
    })
}