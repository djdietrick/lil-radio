import * as graphql from "graphql";
import { getSettings, getSetting, insertOrUpdateSetting } from "../controllers/settings";

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
            insertOrUpdateSetting(context, name, value);
        }
    }
}
