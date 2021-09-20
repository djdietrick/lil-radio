import {addWatcher, removeWatcher} from '../../src-electron/main-process/electron-main';

export const getSettings = ctx => {
    return new Promise((resolve, reject) => {
        ctx.db.all('SELECT * FROM settings')
            .then(result => resolve(result))
            .catch(err => reject(err))
    })
}

export const getSetting = (ctx, name) => {
    return new Promise((resolve, reject) => {
        ctx.db.get(`SELECT * FROM settings WHERE name='${name}'`)
            .then(result => resolve(result))
            .catch(err => reject(err));
    })
}

export const insertOrUpdateSetting = (ctx, name, value) => {
    return new Promise(async (resolve, reject) => {
        let setting = await getSetting(ctx, name);
        if(setting) {
            ctx.db.run(`UPDATE settings SET value='${value}' WHERE name='${name}'`)
                .then(() => resolve({name, value}))
                .catch(err => reject(err))
        } else {
            ctx.db.run(`INSERT INTO settings (name, value) VALUES ('${name}', '${value}')`)
                .then(() => resolve({name, value}))
                .catch(err => reject(err))
        }
    })
}

export const addDirectoryData = (ctx, dir) => {
    return new Promise(async (resolve, reject) => {
        try {
            addWatcher(dir);
            let name = 'MUSIC_DIRS';
            let setting = await getSetting(ctx, name);
            if(setting) {
                let newVal = setting.value + setting.value > 0 ? ';' : '' + dir;
                await ctx.db.run(`UPDATE settings SET value='${newVal}' WHERE name='${name}'`);
                resolve({name, value: newVal})
            } else {
                ctx.db.run(`INSERT INTO settings (name, value) VALUES ('MUSIC_DIRS', ${dir}`);
                resolve({name, value: dir})
            }
        } catch(e) {
            reject(e);
        }
        
    })
}

export const removeDirectoryData = (ctx, dir) => {
    return new Promise(async (resolve, reject) => {
        try {
            removeWatcher(dir);

            let name = 'MUSIC_DIRS';
            let setting = await getSetting(ctx, name);
            if(setting.value.indexOf(';' + dir) != -1) {
                let newValue = setting.value.replace(';' + dir, '');
                setting.value = newValue
            } else {
                let newValue = setting.value.replace(dir, '');
                console.log(setting.value);
                console.log(newValue)
                console.log(dir);
                setting.value = newValue;
            }
            await ctx.db.run(`UPDATE settings SET value='${setting.value}' WHERE name='${name}'`);

            let data = await ctx.db.all(`SELECT id FROM data WHERE path LIKE '%${dir}%'`);
            data = data.map(d => d.id)
            console.log(`Found ${data.length} data`)
            let songData = await ctx.db.all(`SELECT * FROM song_data WHERE dataId IN (${data.join(",")})`);
            let songIdsStr = songData.map(d => d.songId).join(",")
            let songs = await ctx.db.all(`SELECT DISTINCT artistId, albumId FROM song WHERE id IN (${songIdsStr})`);
            let artistIds = new Set(); let albumIds = new Set();
            for(let song of songs) {
                artistIds.add(song.artistId);
                albumIds.add(song.albumId);
            }
            await ctx.db.run(`DELETE FROM song WHERE id IN (${songIdsStr})`)
            console.log(`Deleted ${songData.length} song(s)`)
            
            songs = await ctx.db.all(`SELECT artistId, albumId AS CNT FROM song WHERE artistId IN (${Array.from(artistIds).join(',')}) OR albumId IN (${Array.from(albumIds).join(',')})`);
            for(let song of songs) {
                artistIds.delete(song.artistId);
                albumIds.delete(song.albumId);
            }
            await ctx.db.run(`DELETE FROM album WHERE id IN (${Array.from(albumIds).join(',')})`);
            console.log(`Deleted ${albumIds.size} album(s)`)
            await ctx.db.run(`DELETE FROM artist WHERE id IN (${Array.from(artistIds).join(',')})`);
            console.log(`Deleted ${artistIds.size} artist(s)`)
            resolve(setting);
        } catch(e) {
            console.log(e);
            reject(e);
        }
        
    })
}