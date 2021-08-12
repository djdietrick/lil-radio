<template>
    <div class="artists__browser">
        <div class="artists__list">
            <div class="artists__list__item" v-for="artist in sortedArtists" :key="artist.id"
                @click="selectedArtist = artist.id" :class="{ 'selected': selectedArtist == artist.id }">
                <span>{{artist.name}}</span>
                <span v-if="selectedArtist == artist.id" class="selected__icon"><q-icon name="chevron_right"></q-icon></span>
            </div>
        </div>

        <div class="artists__info">
            <div class="artists__info__albums" v-if="Artist">
                <div class="artists__info__albums__item" v-for="album in Artist.albums" :key="album.id"
                    @mousedown="selectedAlbum = album.id" :class="{ 'selected': selectedAlbum == album.id }"
                    @dragstart="dragAlbum(album.id, $event)" draggable="true">
                    {{album.title}}
                </div>
            </div>
            <div class="artists__info__songs" v-if="Album">
                <h5>{{Album.title}}</h5>
                <div class="artists__info__songs__list" ref="songlist" id="songlist">
                    <div v-for="(song, i) in songList" :key="song.id" class="artists__info__songs__list__item"
                        :class="{'artists__info__songs__list__item--seperator': needSeperator(i), 'selected': isSelected(i)}"
                        @click="onClick(i)" draggable="true" @dragstart="drag(song.id, $event)">
                        <span class="track">{{song.track}}</span> 
                        <span class="title">{{song.title}}</span>
                        <span class="duration">{{formatTime(song.duration)}}</span>
                        <span class="id">{{song.id}}</span> 
                    </div>
                </div>
            </div>
        </div>

        <div class="station">
            <div class="station__header">Add to Station</div>
            <div class="station__add" ref="stationlist">
                <div class="station__entry" v-for="station in Stations" :key="station.id" @drop="drop($event, station)" 
                    @dragover.prevent="dragover($event)" @dragenter.prevent @dragleave="dragleave($event)">
                    {{station.name}}
                </div>
            </div>
        </div>
    </div>
</template>



<script>
import gql from 'graphql-tag';
import moment from 'moment';
import DoubleClickHandler from '../../mixins/DoubleClickHandler'
import Selectable from '../../mixins/Selectable';
import {mapActions, mapGetters} from 'vuex';
export default {
    data() {
        return {
            selectedArtist: null,
            selectedAlbum: null,
            songList: [],
            shift: false,
            ctrl: false,
            selectedPivot: null
        }
    },
    methods: {
        ...mapActions(['setQueue', 'selectSong', 'togglePlaying']),
        formatTime(seconds) {
            let m = moment.duration(seconds, 'seconds');
            return `${m.minutes()}:${m.seconds() < 10 ? '0' : ''}${m.seconds()}`
        },
        needSeperator(i) {
            return i > 0 && this.Album && this.Album.songs[i].disk != this.Album.songs[i-1].disk
        },
        drag(id, e) {
            if(this.selected.length == 0 || (this.selected.length == 1 && this.selected[0] != id)) {
                this.selected = [id];
            }
            e.dataTransfer.dropEffect = "move";
            e.dataTransfer.effectAllowed = "move";
        },
        dragAlbum(id, e) {
            e.dataTransfer.dropEffect = "move";
            e.dataTransfer.effectAllowed = "move";
            this.selectedAlbum = id;
            this.selected = [];
            for(let i= 0; i < this.Album.songs.length; i++) {
                this.selected.push(i);
            }
        },
        drop(e, station) {
            e.preventDefault();
            let songs = this.selected.map(i => parseInt(i));
            this.$apollo.mutate({
                mutation: gql`mutation ($stationId: ID!, $songs: [ID]!) {
                    addSongsToStation(stationId: $stationId, songs: $songs)
                }`,
                variables: {
                    stationId: parseInt(station.id),
                    songs
                }
            }).then(() => {
                this.$q.notify({
                    message: `Added ${this.selected.length} song${this.selected.length > 1 ? 's' : ''} to ${station.name}`,
                    type: 'positive',
                    timeout: 1000
                })
            }).catch(err => {
                console.error(err);
                this.$q.notify({
                    message: err,
                    type: 'negative'
                })
            })
            e.target.classList.remove("draghover")
        },
        dragover(e) {
            e.target.classList.add("draghover")
        },
        dragleave(e) {
            e.target.classList.remove("draghover")
        },
        onSingleClick(i) {
            this.toggleSelect(i);
        },
        onDoubleClick(i) {
            this.setQueue(this.songList);
            this.selectSong(i);
        },
    },
    watch: {
        selectedArtist: function(val) {
            this.selectedAlbum = null;
        },
        Album: function(album) {
            this.selected = [];
            if (album && album.songs) {
                this.songList = [...album.songs].sort((l, r) => {
                    if(l.disk === r.disk) {
                        return l.track - r.track;
                    } else {
                        return l.disk - r.disk;
                    }
                });
            }
            else this.songList = [];
        },
    },
    computed: {
        ...mapGetters(['isPlaying']),
        sortedArtists() {
            if(!this.Artists) return [];
            let copy = [...this.Artists];
            copy.sort((l,r) => {
                if(l.name < r.name) return -1;
                else if (l.name > r.name) return 1;
                return 0;
            });
            console.log(copy)
            return copy;
        }
    },
    apollo: {
        Artists: gql`query {
            Artists {
                id,
                name
            }
        }`,
        Artist: {
            query() {
                if (this.selectedArtist) {
                    return gql`query {
                        Artist(id: ${this.selectedArtist}) {
                            id,
                            name,
                            albums {
                                id
                                title
                            }
                        }
                    }`
                }
                return gql`query {
                    Artist(id: -1) {
                        id
                    }
                }`;
            }
        },
        Album: {
            query() {
                if(this.selectedAlbum) {
                    return gql`query {
                        Album(id: ${this.selectedAlbum}) {
                            id,
                            title,
                            artist {
                                name
                            }
                            songs {
                                id,
                                title,
                                path,
                                track,
                                disk,
                                duration,
                                artist {
                                    name
                                },
                                album {
                                    title
                                }
                            }
                        }
                    }`;
                }
                return gql`query {
                    Album(id: -1) {
                        id
                    }
                }`
            }
        },
        Stations: gql`query{
            Stations {
                id
                name
            }    
        }`
    },
    created() {
        window.addEventListener('keydown', (e) => {
            if(e.key == "Shift") {
                this.shift = true;
            } else if(e.key == "Control") {
                this.ctrl = true;
            }
        })
        window.addEventListener('keyup', (e) => {
            if(e.key == "Shift") {
                this.shift = false;
            } else if(e.key == "Control") {
                this.ctrl = false;
            }
        })
    },
    mixins: [
        DoubleClickHandler,
        Selectable
    ]
}
</script>

<style lang="scss" scoped>
.artists {
    &__browser {
        display: grid;
        grid-template-columns: 15rem 1fr 20rem;        
        height: 85vh;
    }

    &__list {
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(0,0,0,0.2);
        overflow-y: auto;
        height: 85vh;
        box-shadow: 3px 0 0 rgba(0,0,0,0.2);
        
        &__item {
            display: flex;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid rgba(0,0,0,0.2);
            cursor: pointer;
            transition: 0.2s ease-in-out;

            &:hover {
                background-color: $grey-3;
            }

            &--selected {
                background-color: $blue-2 !important;
            }
        }
    }
    &__info {
        display: grid;
        grid-template-columns: 20rem 1fr;

        &__albums {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            border-right: 1px solid rgba(0,0,0,0.2);
            height: 85vh;

            &__item {
                padding: 1rem;
                border-bottom: 1px solid rgba(0,0,0,0.2);
                cursor: pointer;
                transition: 0.2s ease-in-out;

                &:hover {
                    background-color: $grey-3;
                }

                &--selected {
                    background-color: $blue-2 !important;
                }
            }
        }

        &__songs {
            padding: 1rem 1rem;
            overflow-y: auto;
            height: 85vh;

            &__list {
                display: flex;
                flex-direction: column;

                &__item {
                    border-radius: 1rem;
                    padding: 0.3rem 1rem;
                    //height: 1rem;
                    position: relative;
                    

                    background-color: $grey-2;

                    .track {
                        color: $grey-7;
                    }
                    .title {
                        margin-left: 1rem;
                    }
                    .duration {
                        position: absolute;
                        right: 1rem;
                        color: $grey-7;
                    }
                    .id {
                        display: none;
                    }

                    &:not(:last-child) {
                        margin-bottom: 0.5rem;
                    }

                    &--seperator::before {
                        content: "";
                        width: 100%;
                        border-top: 1px red solid;
                        padding-top: 0.5rem;
                    }
                }
            }
        }
    }
}

.selected {
    background-color: $blue-2 !important;
}

.station {
    display: grid;
    grid-template-rows: 5rem 1fr;

    &__header {
        display: grid;
        place-items: center;
        background-color: $primary;
        font-size: 1.5rem;
    }

    &__add {
        padding: 1rem;
        background-color: $grey-2;
        //box-shadow: 3px 3px 0 rgba(0,0,0,0.5);
    }

    &__entry {
        width: 100%;
        background-color: $grey-4;
        border-radius: 0.5rem;
        height: 3rem;
        display: grid;
        place-items: center;
        transition: 0.2s ease-in-out;
    }
}

.draghover {
    background-color: rgba($primary, 0.6);
    transform: scale(1.02);
}

.selected__icon {
    display: inline-block;
    align-self: flex-end;
}

</style>