import * as graphql from 'graphql';
import {getArtist, getArtists, insertArtist} from '../controllers/artist';
import {AlbumType} from './album';
import {SongType} from './song';

export const ArtistType = new graphql.GraphQLObjectType({
    name: 'Artist',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        name: {type: graphql.GraphQLString },
        albums: {type: graphql.GraphQLList(AlbumType)},
        songs: {type: graphql.GraphQLList(SongType)}
    })
});

export const ArtistQueries = {
    Artists: {
        type: graphql.GraphQLList(ArtistType),
        resolve: (root, args, context, info) => {
            return getArtists(context);
        }
    },
    Artist: {
        type: ArtistType,
        args: {
            id: { type: graphql.GraphQLID },
            name: { type: graphql.GraphQLString }
        },
        resolve: (root, args, context, info) => {
            return getArtist(context, args);
        }
    }
}

export const ArtistMutations = {
    addArtist: {
        type: ArtistType,
        args: {
            name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
        },
        resolve: (root, {name}, context, info) => {
            return insertArtist(context, name);
        }
    }
}
