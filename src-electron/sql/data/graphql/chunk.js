import * as graphql from 'graphql';
import {getChunk, getChunksForStation} from '../controllers/chunk';
import {SongType} from './song';

export const ChunkType = new graphql.GraphQLObjectType({
    name: 'Chunk',
    fields: () => ({
        id: {type: graphql.GraphQLID },
        stationId: {type: graphql.GraphQLID},
        songs: {type: graphql.GraphQLList(SongType)}
    })
})

export const ChunkQueries = {
    Chunk: {
        type: ChunkType,
        args: {
            id: {type: graphql.GraphQLID}
        },
        resolve: (root, id, context, info) => {
            return getChunk(context, id);
        }
    },
    ChunksInStation: {
        type: graphql.GraphQLList(ChunkType),
        args: {
            stationId: {type: graphql.GraphQLID}
        },
        resolve: (root, stationId, context, info) => {
            return getChunksForStation(context, stationId);
        }
    }
}