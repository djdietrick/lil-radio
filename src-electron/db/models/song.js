import path from 'path';
import * as mm from 'music-metadata';

export class Song {
    constructor(path) {
        this.path = path;
    }

    static async build(path) {
        let song = new Song(path);
        const md = await mm.parseFile(path);
        song.name = md.common.title;
        song.length = md.format.duration;
        song.artist = md.common.artist;
        song.album = md.common.album;
        return song;
    }
}
