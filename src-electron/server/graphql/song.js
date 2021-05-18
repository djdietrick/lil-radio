import * as graphql from "graphql";
import {AlbumType} from './album';
import {ArtistType} from './artist';
import {getSongs, getSong, getSongsByArtist, getSongsInAlbum, searchSongs} from '../controllers/songs';

export const SongType = new graphql.GraphQLObjectType({
    name: 'Song',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        title: {type: graphql.GraphQLString },
        album: {type: AlbumType},
        artist: {type: ArtistType},
        duration: {type: graphql.GraphQLInt },
        track: {type: graphql.GraphQLInt },
        disk: {type: graphql.GraphQLInt },
        path: {type: graphql.GraphQLString}
    })
})

export const SongQueries = {
    Songs: {
        type: graphql.GraphQLList(SongType),
        resolve: (root, args, context, info) => {
            return getSongs(context);
        }
    },
    Song: {
        type: graphql.GraphQLList(SongType),
        args: {
            id: { type: graphql.GraphQLID },
            title: { type: graphql.GraphQLString }
        },
        resolve: (root, args, context, info) => {
            return getSong(context, args);
        }
    },
    SongsByArtist: {
        type: graphql.GraphQLList(SongType),
        args: {
            artistId: {type: new graphql.GraphQLNonNull(graphql.GraphQLID)}
        },
        resolve: (root, {artistId}, context, info) => {
            return getSongsByArtist(context, artistId);
        }
    },
    SongsInAlbum: {
        type: graphql.GraphQLList(SongType),
        args: {
            albumId: {type: new graphql.GraphQLNonNull(graphql.GraphQLID)}
        },
        resolve: (root, {albumId}, context, info) => {
            return getSongsInAlbum(context, artistId);
        }
    },
    SearchSongs: {
        type: graphql.GraphQLList(SongType),
        args: {
            title: {type: graphql.GraphQLString}
        },
        resolve: (root, {title}, context, info) => {
            return searchSongs(context, title);
        }
    }
}

export const SongMutations = {

}