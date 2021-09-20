import {getArtist} from '../controllers/artist';
import {getSongsInAlbum} from '../controllers/songs';

export default class Album {
    constructor({id, title, artistId}) {
        this.id = id;
        this.title = title;
        this.artistId = artistId;
    }

    artist(obj, ctx) {
        return getArtist(ctx, {id: this.artistId});
    }

    songs(obj, ctx) {
        return getSongsInAlbum(ctx, this.id);
    }
}