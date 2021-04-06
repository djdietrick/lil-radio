import * as graphql from 'graphql';
import {ChunkType} from './chunk';
import { getStation, getStations, insertStation, updateStation, deleteStation } from '../controllers/station';

export const StationType = new graphql.GraphQLObjectType({
    name: 'Station',
    fields: () => ({
        id: {type: graphql.GraphQLID},
        name: {type: graphql.GraphQLString},
        chunks: {type: graphql.GraphQLList(ChunkType)}
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
            station: {type: StationType}
        },
        resolve: (root, {station}, context, info) => {
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
    }
}