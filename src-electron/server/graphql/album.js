import * as graphql from 'graphql';
import {getAlbum, getAlbums, getAlbumsByArtist, insertAlbum, searchAlbum} from '../controllers/album';
import {ArtistType} from './artist';
import {SongType} from './song';

export const AlbumType = new graphql.GraphQLObjectType({
    name: 'Album',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        title: {type: graphql.GraphQLString },
        artistId: {type: graphql.GraphQLID},
        artist: { type: ArtistType },
        songs: {type: graphql.GraphQLList(SongType)}
    })
})

export const AlbumQueries = {
    Albums: {
        type: graphql.GraphQLList(AlbumType),
        resolve: (root, args, context, info) => {
            return getAlbums(context);
        }
    },
    Album: {
        type: AlbumType,
        args: {
            id: { type: graphql.GraphQLID },
            title: { type: graphql.GraphQLString }
        },
        resolve: (root, {id, title}, context, info) => {
            return getAlbum(context, {id, title})
        }
    },
    AlbumsByArtist: {
        type: graphql.GraphQLList(AlbumType),
        args: {
            artistId: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) }
        },
        resolve: (root, {artistId}, context, info) => {
            return getAlbumsByArtist(context, artistId);
        }
    },
    SearchAlbum: {
        type: graphql.GraphQLList(AlbumType),
        args: {
            title: { type: graphql.GraphQLString }
        },
        resolve: (root, {title}, context, info) => {
            return searchAlbum(context, title);
        }
    }
}

export const AlbumMutations = {
    addAlbum: {
        type: AlbumType,
        args: {
            title: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
            artistId: {type: new graphql.GraphQLNonNull(graphql.GraphQLID)}
        },
        resolve: (root, {title, artistId}, context, info) => {
            return insertAlbum(context, title, artistId);
        }
    }
}