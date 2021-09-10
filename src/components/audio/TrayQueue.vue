<template>
    <div class="queue">
        <div class="queue__album q-ma-sm q-pa-sm" v-for="albumId in byAlbum.keys()" :key="albumId">
            <div class="queue__album__title" @click="onAlbumClick(albumId)">
                <span class="queue__album__title--album">{{byAlbum.get(albumId)[0].album.title}}</span>
                <span class="queue__album__title--artist">{{byAlbum.get(albumId)[0].artist.name}}</span>
            </div>
            <div class="queue__album__song" v-for="song in byAlbum.get(albumId)" @click="onSongClick(song)" :class="{'selected': song.index === index}">
                <span class="queue__album__song__track">{{song.track}}</span>
                <span class="queue__album__song__title">{{song.title}}</span>
                <span class="queue__album__song__duration">{{formatTime(song.duration)}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';
import _ from 'lodash';
import gql from 'graphql-tag';
import Vue from 'vue';
import moment from 'moment';
export default {
    props: {
        station: {
            required: true,
            type: Object
        }
    },
    data() {
        return {
            songList: [],
            byAlbum: new Map()
        }
    },
    computed: {
        ...mapGetters({
            isPlaying: 'isPlaying',
            queue: 'getQueue',
            index: 'getIndex'
        }),
    },
    methods: {
        ...mapActions(['setQueue', 'selectSong', 'setIsPlaying']),
        shuffleStation() {
            let currentAlbum = null;
            let s = [];
            if(this.isPlaying) {
                //currentAlbum = this.queue[this.index].id;
            }
            let byAlbum = {};
            for(let song of this.songList) {
                if(!byAlbum[song.album.id]) {
                    byAlbum[song.album.id] = [];
                }
                byAlbum[song.album.id].push(song);
            }
            for(let key of _.shuffle(Object.keys(byAlbum))) {
                byAlbum[key].sort((l,r) => {
                    if(l.disk === r.disk) {
                        return l.track - r.track;
                    } else {
                        return l.disk - r.disk
                    }
                })
                if(key === currentAlbum) {
                    s.unshift(...byAlbum[key]);
                } else {
                    s.push(...byAlbum[key]);
                }
            }
            this.setQueue(s);
            this.selectSong(0);
            this.setIsPlaying(true);
        },
        getByAlbum() {
            let byAlbum = new Map();
            for(let i = 0; i < this.queue.length; i++) {
                let song = this.queue[i];
                if(!byAlbum.has(song.album.id)) {
                    byAlbum.set(song.album.id, []);
                }
                let a = byAlbum.get(song.album.id);
                a.push({
                    ...song,
                    index: i
                })
                byAlbum.set(song.album.id, a);
            }
            for(let album of byAlbum.keys()) {
                let a = byAlbum.get(album);
                a.sort((l,r) => {
                    if(l.disk === r.disk) {
                        return l.track - r.track;
                    } else {
                        return l.disk - r.disk
                    }
                })
                byAlbum.set(album, a);
            }
            Vue.set(this, 'byAlbum', byAlbum);
        },
        formatTime(seconds) {
            let m = moment.duration(seconds, 'seconds');
            return `${m.minutes()}:${m.seconds() < 10 ? '0' : ''}${m.seconds()}`
        },
        onSongClick(song) {
            this.selectSong(song.index);
        },
        onAlbumClick(albumId) {
            this.selectSong(this.byAlbum.get(albumId)[0].index);
        }
    },
    async created() {
        let stationId = this.station.id;
        const res = await this.$apollo.query({
            query: gql`query($stationId: ID!) {
                Station(id: $stationId) {
                    songs {
                        id
                        title
                        artist {
                            id
                            name
                        }
                        album {
                            id
                            title
                        }
                        duration
                        track
                        disk
                        path
                    }
                }    
            }`,
            variables: {
                stationId: stationId
            }
        })
        this.songList = res.data.Station.songs;
        this.shuffleStation();
        this.getByAlbum();
    }
}
</script>

<style lang="scss" scoped>
    
.queue {
    width: 100%;
    height: 60vh;
    overflow-y: auto;
    &__album {
        background-color: $area;
        border-radius: 1rem;
        &__title {
            margin-left: 0.5rem;
            cursor: pointer;
            &--album {
                font-weight: 500;
            }
            &--artist {
                margin-left: 1rem;
                opacity: 0.7;
            }
        }

        &__song {
            display: grid;
            grid-template-columns: 35px 1fr 50px;
            margin-top: 3px;
            cursor: pointer;
            transition: 0.2s ease-in-out;
            border-radius: 5px;

            &:hover {
                background-color: $hover;
                transform: scale(1.01);
            }

            &__track {
                opacity: 0.5;
                justify-self: center;
                align-self: center;
            }
            &__duration {
                opacity: 0.5;
            }
        }
    }

    // Disable highlighting
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
}

.selected {
    background-color: $selected;
    transform: scale(1.01);
}

</style>