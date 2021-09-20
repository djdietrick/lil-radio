import {getAlbumsByArtist} from '../controllers/album';
import {getSongsByArtist} from '../controllers/songs';

export default class Artist {
    constructor({id, name}) {
        this.id = id;
        this.name = name;
    }

    albums(obj, ctx) {
        return getAlbumsByArtist(ctx, this.id);
    }

    songs(obj, ctx) {
        return getSongsByArtist(ctx, this.id);
    }
}