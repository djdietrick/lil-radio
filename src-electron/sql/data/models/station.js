import {getChunksForStation} from '../controllers/chunk';

export default class Station {
    constructor({id, name}) {
        this.id = id;
        this.name = name;
    }

    chunks(obj, ctx) {
        return getChunksForStation(ctx, this.id);
    }
}