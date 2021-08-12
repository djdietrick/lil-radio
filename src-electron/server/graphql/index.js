import * as graphql from 'graphql';
import {ArtistQueries, ArtistMutations} from './artist';
import {AlbumQueries, AlbumMutations} from './album';
import {SongQueries, SongMutations} from './song';
import {DataQueries} from './data';
import {StationQueries, StationMutations} from './station';
import {ChunkQueries, ChunkMutations} from './chunk';
import { SettingsQueries, SettingsMutations } from './settings';

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
       ...ArtistQueries,
       ...AlbumQueries,
       ...SongQueries,
       ...DataQueries,
       ...StationQueries,
       ...ChunkQueries,
       ...SettingsQueries
    }
})

const mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...ArtistMutations,
        ...AlbumMutations,
        ...SongMutations,
        ...StationMutations,
        ...ChunkMutations,
        ...SettingsMutations
    }
})

export const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType
})
