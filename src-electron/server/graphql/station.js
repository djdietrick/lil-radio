import * as graphql from 'graphql';
import {SongType} from './song';
import { getStation, getStations, insertStation, updateStation, deleteStation, insertSongsIntoStation, removeSongFromStation } from '../controllers/station';

export const StationType = new graphql.GraphQLObjectType({
    name: 'Station',
    fields: () => ({
        id: {type: graphql.GraphQLID},
        name: {type: graphql.GraphQLString},
        songs: {type: graphql.GraphQLList(SongType)}
    })
})

export const StationQueries = {
    Stations: {
        type: graphql.GraphQLList(StationType),
        resolve: (root, args, context, info) => {
            return getStations(context);
        }
    },
    Station: {
        type: StationType,
        args: {
            id: {type: graphql.GraphQLID},
            name: {type: graphql.GraphQLString}
        },
        resolve: (root, args, context, info) => {
            return getStation(context, args);
        }
    }
}

export const StationMutations = {
    createStation: {
        type: StationType,
        args: {
            name: {type: graphql.GraphQLString}
        },
        resolve: (root, {name}, context, info) => {
            return insertStation(context, {name});
        }
    },
    updateStation: {
        type: StationType,
        args: {
            id: {type: graphql.GraphQLID},
            name: {type: graphql.GraphQLString}
        },
        resolve: (root, station, context, info) => {
            return updateStation(context, station);
        }
    },
    deleteStation: {
        type: graphql.GraphQLID,
        args: {
            id: {type: graphql.GraphQLID}
        },
        resolve: (root, {id}, context, info) => {
            return deleteStation(context, id);
        }
    },
    addSongsToStation: {
        type: graphql.GraphQLList(graphql.GraphQLID),
        args: {
            songs: {type: graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLID))},
            stationId: {type: graphql.GraphQLNonNull(graphql.GraphQLID)}
        },
        resolve: (root, args, context, info) => {
            return insertSongsIntoStation(context, args);
        }
    },
    deleteSongFromStation: {
        type: graphql.GraphQLID,
        args: {
            songId: {type: graphql.GraphQLNonNull(graphql.GraphQLID)},
            stationId: {type: graphql.GraphQLNonNull(graphql.GraphQLID)}
        },
        resolve: (root, args, context, info) => {
            return removeSongFromStation(context, args);
        }
    }
}