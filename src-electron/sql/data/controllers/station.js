import Station from '../models/station';

export const getStations = ctx => {
    return new Promise((resolve, reject) => {
        ctx.db.all('SELECT * FROM station;')
            .then(result => resolve(result.map(r => new Station(r))))
            .catch(err => reject(err));
    })
}

export const getStation = (ctx, {id, name}) => {
    return new Promise((resolve, reject) => {
        if(!id && !name) reject('Provide a parameter');
        let a = id && name;
        ctx.db.all(`SELECT * FROM station WHERE ${id ? 'id=' + id : ''} 
            ${a ? ' AND ' : ''}${name ? 'name="' + name + '"' : ''};`)
            .then(result => resolve(result.map(r => new Station(r))))
            .catch(err => reject(err))
    })
}

export const insertStation = (ctx, station) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await ctx.db.run(`INSERT INTO station (name) 
                VALUES ("${station.name}")`);
            station.id = res.lastID;
            resolve(station);
        } catch(e) {
            reject(e);
        }
    })
}

export const updateStation = (ctx, station) => {
    return new Promise((resolve, reject) => {
        ctx.db.run(`UPDATE station SET name="${station.name}" WHERE id=${station.id}`)
            .then(result => resolve(station))
            .catch(e => reject(e));
    })
}

export const deleteStation = (ctx, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await ctx.db.run(`DELETE FROM chunk_song WHERE chunkId IN (SELECT id FROM chunk WHERE stationId=${id})`);
            await ctx.db.run(`DELETE FROM chunk WHERE stationId=${id}`);
            await ctx.db.run(`DELETE FROM station WHERE id=${id}`);
            resolve(id);
        } catch(e) {
            reject(e);
        }
        
    })
}