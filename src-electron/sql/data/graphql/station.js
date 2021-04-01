import * as graphql from 'graphql';
import {ChunkType} from './chunk';
import { getStation, getStations } from '../controllers/station';

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