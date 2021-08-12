export const getSettings = ctx => {
    return new Promise((resolve, reject) => {
        ctx.db.all('SELECT * FROM settings;')
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
        console.log(setting);
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