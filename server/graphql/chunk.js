import * as graphql from 'graphql';
import {getChunk, getChunksForStation, createOrUpdateChunk, deleteChunk} from '../controllers/chunk';
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
        resolve: (root, {id}, context, info) => {
            return getChunk(context, id);
        }
    },
    ChunksInStation: {
        type: graphql.GraphQLList(ChunkType),
        args: {
            stationId: {type: graphql.GraphQLID}
        },
        resolve: (root, {stationId}, context, info) => {
            return getChunksForStation(context, stationId);
        }
    }
}

export const ChunkMutations = {
    CreateOrUpdateChunk: {
        type: ChunkType,
        args: {
            id: {type: graphql.GraphQLID},
            stationId: {type: graphql.GraphQLNonNull(graphql.GraphQLID)},
            songs: {type: graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLID))}
        },
        resolve: (root, args, context, info) => {
            return createOrUpdateChunk(context, args);
        }
    },
    DeleteChunk: {
        type: graphql.GraphQLBoolean,
        args: {
            id: {type: graphql.GraphQLNonNull(graphql.GraphQLID)}
        },
        resolve: (root, {id}, context, info) => {
            return deleteChunk(context, id);
        }
    }
}