import {getSongsInStation} from '../controllers/station';

export default class Station {
    constructor({id, name}) {
        this.id = id;
        this.name = name;
    }

    songs(obj, ctx) {
        return getSongsInStation(ctx, this.id);
    }
}