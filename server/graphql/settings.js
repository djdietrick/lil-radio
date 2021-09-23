import * as graphql from "graphql";
import { getSettings, getSetting, insertOrUpdateSetting, removeDirectoryData, addDirectoryData} from "../controllers/settings";
import fs from 'fs';

export const SettingType = new graphql.GraphQLObjectType({
    name: 'Setting',
    fields: () => ({
        name: {type: graphql.GraphQLString},
        value: {type: graphql.GraphQLString}
    })
})

export const SettingsQueries = {
    Settings: {
        type: graphql.GraphQLList(SettingType),
        resolve: (root, args, context, info) => {
            return getSettings(context);
        }
    },
    Setting: {
        type: SettingType,
        args: {
            name: {type: graphql.GraphQLString}
        },
        resolve: (root, {name}, context, info) => {
            return getSetting(context, name);
        }
    }
}

export const SettingsMutations = {
    updateSetting: {
        type: SettingType,
        args: {
            name: {type: graphql.GraphQLString},
            value: {type: graphql.GraphQLString}
        },
        resolve: (root, {name, value}, context, info) => {
            return insertOrUpdateSetting(context, name, value);
        }
    },
    addDirectory: {
        type: SettingType,
        args: {
            dir: {type: graphql.GraphQLString}
        },
        resolve: (root, {dir}, context, info) => {
            return addDirectoryData(context, dir);
        }
    },
    removeDirectory: {
        type: SettingType,
        args: {
            dir: {type: graphql.GraphQLString}
        },
        resolve: (root, {dir}, context, info) => {
            return removeDirectoryData(context, dir)
        }
    },
    checkDirectory: {
        type: graphql.GraphQLBoolean,
        args: {
            dir: {type: graphql.GraphQLString}
        },
        resolve: (root, {dir}, context, info) => {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fs.existsSync(dir) && fs.lstatSync(dir).isDirectory())
                } catch(e) {
                    resolve(false);
                }
            })
        }
    }
}
