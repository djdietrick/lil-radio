import {getSongsInChunk} from '../controllers/songs';

export class Chunk {
    constructor({id, stationId}) {
        this.id = id;
        this.stationId = stationId;
    }

    songs(obj, ctx) {
        return getSongsInChunk(ctx, this.id);
    }
}