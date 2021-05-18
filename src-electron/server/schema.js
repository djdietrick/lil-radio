import * as graphql from 'graphql';
import {ArtistQueries, ArtistMutations} from './graphql/artist';
import {AlbumQueries, AlbumMutations} from './graphql/album';
import {SongQueries, SongMutations} from './graphql/song';
import {DataQueries} from './graphql/data';
import {StationQueries, StationMutations} from './graphql/station';
import {ChunkQueries} from './graphql/chunk';

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
       ...ArtistQueries,
       ...AlbumQueries,
       ...SongQueries,
       ...DataQueries,
       ...StationQueries,
       ...ChunkQueries
    }
})

const mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...ArtistMutations,
        ...AlbumMutations,
        ...SongMutations,
        ...StationMutations
    }
})

export const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType
})
