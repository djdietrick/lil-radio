<template>
    <div class="artists__browser">
        <div class="artists__list">
            <div class="artists__list__item" v-for="artist in Artists" :key="artist.id"
                @click="selectedArtist = artist.id" :class="{ 'selected': selectedArtist == artist.id }">
                <span>{{artist.name}}</span>
                <span v-if="selectedArtist == artist.id" class="selected__icon"><q-icon name="chevron_right"></q-icon></span>
            </div>
        </div>

        <div class="artists__info">
            <div class="artists__info__albums" v-if="Artist">
                <div class="artists__info__albums__item" v-for="album in Artist.albums" :key="album.id"
                    @click="selectedAlbum = album.id" :class="{ 'selected': selectedAlbum == album.id }">
                    {{album.title}}
                </div>
            </div>
            <div class="artists__info__songs" v-if="Album">
                <h5>{{Album.title}}</h5>
                <div class="artists__info__songs__list" ref="songlist" id="songlist">
                <!-- <draggable :list="songList" group="songs" @change="log" selectedClass="selected" multiDrag> -->
                    <div v-for="(song, i) in songList" :key="song.id" class="artists__info__songs__list__item"
                        :class="{'artists__info__songs__list__item--seperator': needSeperator(i), 'selected': isSelected(i)}"
                        @click="toggleSelect(i)" draggable="true" @dragstart="drag(i, $event)">
                        <span class="track">{{song.track}}</span> 
                        <span class="title">{{song.title}}</span>
                        <span class="duration">{{formatTime(song.duration)}}</span>
                        <span class="id">{{song.id}}</span> 
                    </div>
                <!-- </draggable> -->
                </div>
            </div>
        </div>

        <div class="station">
            <div class="station__header">Add to Station</div>
            <div class="station__add" ref="stationlist">
                <div class="station__entry" v-for="station in Stations" :key="station.id" @drop="drop($event)" 
                    @dragover.prevent @dragenter.prevent>
                    {{station.name}}
                </div>
            </div>
        </div>
    </div>
</template>



<script>
import gql from 'graphql-tag';
import moment from 'moment';
import {Sortable, MultiDrag} from 'sortablejs';
import draggable from 'vuedraggable';

Sortable.mount(new MultiDrag());

export default {
    props: {
        search: String
    },
    components: {
        draggable
    },
    data() {
        return {
            selectedArtist: null,
            selectedAlbum: null,
            songSortable: null,
            stationSortable: null,
            songList: [],
            isMounted: false,
            selected: []
        }
    },
    methods: {
        formatTime(seconds) {
            let m = moment.duration(seconds, 'seconds');
            return `${m.minutes()}:${m.seconds() < 10 ? '0' : ''}${m.seconds()}`
        },
        needSeperator(i) {
            return i > 0 && this.Album && this.Album.songs[i].disk != this.Album.songs[i-1].disk
        },
        drag(i, e) {
            if(this.selected.length == 0) {
                this.selected.push(this.songList[i])
            }
            e.dataTransfer.dropEffect = "move";
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("songs", this.selected);
            console.log("dragging!");
        },
        drop(e) {
            e.preventDefault();
            let songs = e.dataTransfer.getData("songs");
            console.log(songs);
            this.selected = [];
        },
        toggleSelect(i) {
            let ind = this.selected.indexOf(i);
            if (ind > -1) {
                this.selected.splice(ind, 1);
            } else {
                this.selected.push(i);
            }
        },
        isSelected(i) {
            return this.selected.includes(i);
        }
    },
    watch: {
        selectedArtist: function(val) {
            this.selectedAlbum = null;
        },
        Album: function(album) {
            if (album && album.songs) this.songList = album.songs;
            else this.songList = [];
        }
    },
    updated() {
        this.$nextTick(() => {
            if(this.$refs.songlist) {
                // this.songSortable = Sortable.create(this.$refs.songlist, {
                //     group: {
                //         name: 'songs',
                //         pull: 'clone',
                //         put: false
                //     },
                //     sort: false,
                //     multiDrag: true,
                //     selectedClass: "selected",
                //     multiDragKey: 'CTRL'
                // });
            } else {
                this.songSortable = null;
            }
        })
    },
    mounted() {
        // this.stationSortable = Sortable.create(this.$refs.stationlist, {
        //     group: {
        //         name: 'songs',
        //         pull: false,
        //         put: true
        //     },
        //     onAdd: function(e) {
        //         for(let item of e.items) {
        //             item.classList.remove('selected');
        //         }
        //     },
        //     onSort: (e) => {
        //         //console.log(this.$refs.stationlist.children);
        //         this.getSongList();
        //     }
        // })
        this.isMounted = true;
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
                                duration
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
    }
}
</script>

<style lang="scss" scoped>
.artists {
    &__browser {
        display: grid;
        grid-template-columns: 15rem 1fr 20rem;        
        height: 92vh;
    }

    &__list {
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(0,0,0,0.2);
        overflow-y: auto;
        height: 92.5vh;
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
            height: 92.5vh;

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
            height: 92vh;

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
        box-shadow: 3px 3px 0 rgba(0,0,0,0.5);
    }

    &__entry {
        width: 100%;
        background-color: red;
        height: 3rem;
        display: grid;
        place-items: center;
    }
}

.selected__icon {
    display: inline-block;
    align-self: flex-end;
}

</style>