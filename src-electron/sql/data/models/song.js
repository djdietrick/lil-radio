import {getArtist, insertArtist} from '../controllers/artist';
import {getAlbum, insertAlbum, getAlbumByArtist} from '../controllers/album';
import {getPathFromSongId} from '../controllers/data';

import * as mm from 'music-metadata';

export default class Song {
    constructor({id, title, albumId, artistId, duration, track, disk}) {
        this.id = id;
        this.title = title;
        this.albumId = albumId;
        this.artistId = artistId,
        this.duration = duration;
        this.track = track;
        this.disk = disk;
    }

    artist(obj, ctx) {
        return getArtist(ctx, {id: this.artistId});
    }

    album(obj, ctx) {
        return getAlbum(ctx, {id: this.albumId});
    }

    path(obj, ctx) {
        return getPathFromSongId(ctx, this.id);
    }

    static async build(db, p) {
        let song = {};
        song.path = p;

        const md = await mm.parseFile(p);
        song.title = md.common.title;
        song.duration = md.format.duration;
        song.track = md.common.track.no;
        song.disk = md.common.disk.no;

        let artist = await getArtist({db}, {name: md.common.artist});
        if(!artist) {
            artist = await insertArtist({db}, md.common.artist);
        } 
        song.artistId = artist.id;

        let album = await getAlbumByArtist({db}, md.common.album, artist.id);
        if(!album) {
            album = await insertAlbum({db}, md.common.album, artist.id)
        }
        song.albumId = album.id;

        return song;
    }
}