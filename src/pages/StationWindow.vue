<template>
    <div class="station" v-if="Station">
        <!-- <div class="station__header">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{Station.name}}</q-toolbar-title>
                <q-btn flat round dense icon="delete" @click="deleteStation"/>
            </q-toolbar>
        </div>
        <div class="station__content">
            
        </div> -->
        <Grid :columns="columns" :data="songList" initialSortedCol="artist" :customSort="customCustomSort" @updateSelected="selected = $event"/>
        <!-- <q-table class="station__table" dense :data="songList" row-key="id" :columns="columns" :title="Station.name"
                :rows-per-page-options="[0]" :pagination.sync="pagination" hide-bottom virtual-scroll
                :virtual-scroll-item-size="48" :virtual-scroll-sticky-size-start="48"
                :sort-method="customSort" selection="multiple" :selected.sync="selected">
                
                <template v-slot:header="props">
                    <q-tr :props="props">
                        <q-th v-for="col in props.cols" :key="col.name" :props="props">
                            {{ col.label }}
                        </q-th>
                    </q-tr>
                </template> 
                <template v-slot:body="props">
                    <q-menu touch-position context-menu>
                        <q-list dense>
                            <q-item clickable v-close-popup @click="removeFromPlaylist">
                                <q-item-section>
                                    Remove From Playlist
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                    <q-tr class="cursor-pointer unselectable" :props="props" @click.native="handleClick(props)">
                        <q-td v-for="col in props.cols" :key="col.name" :props="props">
                            {{ col.value }}
                        </q-td>
                    </q-tr>
                </template>
        </q-table> -->
        <q-dialog v-model="del">
            <q-card class="delete q-pa-md">
                <q-card-section>
                    Are you sure you want to remove {{selected.length}} song{{selected.length > 1 ? 's' : ''}} from {{Station.name}}? 
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn flat label="Remove" @click="removeFromPlaylist" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import gql from 'graphql-tag';
import moment from 'moment';
import Selectable from '../mixins/Selectable';
import Grid from '../components/grid/Grid.vue';

export default {
    props: {
        id: {
            required: true
        }
    },
    components: {
        Grid
    },
    data() {
        return {
            sortMode: 'artist',
            columns: [
                {
                    name: 'title',
                    label: 'Title',
                    sortable: true,
                    field: 'title',
                    align: 'left',
                    width: 30
                },
                {
                    name: 'artist',
                    label: 'Artist',
                    field: row => row.artist.name,
                    sortable: true,
                    align: 'left',
                    width: 20
                },
                {
                    name: 'album',
                    label: 'Album',
                    field: row => row.album.title,
                    sortable: true,
                    align: 'left',
                    width: 30
                },
                {
                    name: 'duration',
                    label: 'Duration',
                    field: 'duration',
                    align: 'left',
                    format: val => `${this.formatTime(val)}`,
                    width: 7
                },
                {
                    name: 'track',
                    label: '#',
                    field: 'track',
                    align: 'left',
                    width: 3
                }
            ],
            pagination: {
                page: 1,
                rowsPerPage: 0
            },
            del: false,
            songList: [],
            selected: []
        }
    },
    watch: {
        Station: function(val) {
            if(!val) {
                this.$q.loading.show();
            } else {
                this.$q.loading.hide();
                this.songList = val.songs;
            }
        },
        songList: function(val) {
            console.log(val)
        }
    },
    methods: {
        deleteStation() {
            this.$q.dialog({
                title: "Confirm",
                message: "Are you sure you want to delete this station?",
                cancel: true
            }).onOk(() => {
                this.$apollo.mutate({
                    mutation: gql`mutation ($stationId: ID!) {
                        deleteStation(id: $stationId)
                    }`,
                    variables: {
                        stationId: parseInt(this.id)
                    }
                }).then(() => {
                    this.$q.electron.ipcRenderer.send('closeStation')
                }).catch(err => {
                    this.$q.notify({
                        message: err,
                        type: 'negative'
                    })
                })
            })
        },
        formatTime(seconds) {
            let m = moment.duration(seconds, 'seconds');
            return `${m.minutes()}:${m.seconds() < 10 ? '0' : ''}${m.seconds()}`
        },
        customSort(rows, sortBy, descending) {
            let ret = [];
            console.log(descending);
            if(this.Station) {
                if(sortBy === 'artist') {
                    let byArtist = {};
                    let artistIdToName = {};
                    for(let song of rows) {
                        if(!byArtist[song.artist.id]) byArtist[song.artist.id] = [];
                        byArtist[song.artist.id].push(song);
                        artistIdToName[song.artist.id] = song.artist.name;
                    }
                    
                    for(let key of Object.keys(byArtist)) {
                        byArtist[key].sort((l, r) => {
                            if(l.album.id === r.album.id) {
                                if(l.disk === r.disk) {
                                    return l.track - r.track;
                                } else {
                                    return l.disk - r.disk;
                                }
                            } else {
                                return l.album.title < r.album.title;
                            }
                        })
                    }
                    let sortedIds = Object.keys(byArtist).sort((l, r) => {
                        let lname = artistIdToName[l], rname = artistIdToName[r];
                        if(lname < rname) return -1;
                        else if (lname > rname) return 1;
                        return 0;
                    })
                    console.log(byArtist);
                    for(let id of sortedIds) {
                        ret.push(...byArtist[id])
                    }
                } else if(sortBy === 'title') {
                    ret = rows.sort((l, r) => {
                        if(l.title < r.title) {
                            return -1;
                        } else if (l.title > r.title) {
                            return 1;
                        } 
                        return 0;
                    })
                } else if(sortBy === 'album') {
                    let byAlbum = {};
                    let albumIdToTitle = {};
                    for(let song of rows) {
                        if(!byAlbum[song.album.id]) byAlbum[song.album.id] = [];
                        byAlbum[song.album.id].push(song);
                        albumIdToTitle[song.album.id] = song.album.title;
                    }
                    for(let key of Object.keys(byAlbum)) {
                        byAlbum[key].sort((l, r) => {
                            if(l.disk === r.disk) {
                                return l.track - r.track;
                            } else {
                                return l.disk - r.disk;
                            }
                        })
                    }
                    let sortedIds = Object.keys(byAlbum).sort((l, r) => {
                        let lname = albumIdToTitle[l], rname = albumIdToTitle[r];
                        if(lname < rname) return -1;
                        else if (lname > rname) return 1;
                        return 0;
                    })
                    for(let id of sortedIds) {
                        ret.push(...byAlbum[id])
                    }
                }
            }
            console.log(ret);
            return ret;
        },
        customCustomSort(data, sortBy, desc) {
            let ret = [];
            let mult = desc
            if(sortBy === 'artist') {
                let byArtist = {};
                let artistIdToName = {};
                for(let song of data) {
                    if(!byArtist[song.artist.id]) byArtist[song.artist.id] = [];
                    byArtist[song.artist.id].push(song);
                    artistIdToName[song.artist.id] = song.artist.name;
                }
                
                for(let key of Object.keys(byArtist)) {
                    byArtist[key].sort((l, r) => {
                        if(l.album.id === r.album.id) {
                            if(l.disk === r.disk) {
                                return (l.track - r.track) * mult;
                            } else {
                                return (l.disk - r.disk) * mult;
                            }
                        } else {
                            return l.album.title < r.album.title;
                        }
                    })
                }
                let sortedIds = Object.keys(byArtist).sort((l, r) => {
                    let lname = artistIdToName[l], rname = artistIdToName[r];
                    if(lname < rname) return -1 * mult; 
                    else if (lname > rname) return 1 * mult;
                    return 0;
                })
                console.log(byArtist);
                for(let id of sortedIds) {
                    ret.push(...byArtist[id])
                }
            } else if(sortBy === 'title') {
                ret = data.sort((l, r) => {
                    if(l.title < r.title) {
                        return -1 * mult;
                    } else if (l.title > r.title) {
                        return 1 * mult;
                    } 
                    return 0;
                })
            } else if(sortBy === 'album') {
                let byAlbum = {};
                let albumIdToTitle = {};
                for(let song of data) {
                    if(!byAlbum[song.album.id]) byAlbum[song.album.id] = [];
                    byAlbum[song.album.id].push(song);
                    albumIdToTitle[song.album.id] = song.album.title;
                }
                for(let key of Object.keys(byAlbum)) {
                    byAlbum[key].sort((l, r) => {
                        if(l.disk === r.disk) {
                            return (l.track - r.track) * mult;
                        } else {
                            return (l.disk - r.disk) * mult;
                        }
                    })
                }
                let sortedIds = Object.keys(byAlbum).sort((l, r) => {
                    let lname = albumIdToTitle[l], rname = albumIdToTitle[r];
                    if(lname < rname) return -1 * mult;
                    else if (lname > rname) return 1 * mult;
                    return 0;
                })
                for(let id of sortedIds) {
                    ret.push(...byAlbum[id])
                }
            }
            return ret;
        },
        handleClick(props) {
            console.log(props);
            this.toggleSelect(props.pageIndex);
        },
        removeFromPlaylist() {
             this.$apollo.mutate({
                mutation: gql`mutation ($stationId: ID!, $songs: [ID]!) {
                    deleteSongsFromStation(stationId: $stationId, songs: $songs)
                }`,
                variables: {
                    stationId: parseInt(this.id),
                    songs: this.selected.map(val => parseInt(val.id))
                }
            }).then(data => {
                let songs = data.data.deleteSongsFromStation
                this.$apollo.queries.Station.refetch()
                this.$q.notify({
                    message: `Removed ${songs.length} song${songs.length > 1 ? 's' : ''}`,
                    type: 'success'
                })
            }).catch(err => {
                this.$q.notify({
                    message: err,
                    type: 'negative'
                })
            })
        }
    },
    apollo: {
        Station: {
            query() {
                if(this.id) {
                     return gql`query {
                        Station(id: ${this.id}) {
                            id
                            name
                            songs {
                                id,
                                title,
                                artist {
                                    id,
                                    name
                                },
                                album {
                                    id, 
                                    title
                                },
                                track,
                                disk,
                                duration
                            }
                        }
                    }`
                } else {
                    return gql`query {
                        Station(id: -1) {
                            id
                            name
                            songs {
                                id
                            }
                        }
                    }`
                }
            }
        }
    },
    mounted() {
        window.addEventListener('keyup', (e) => {
            if(e.key == 'Delete' || e.key == 'Backspace') {
                if(this.selected.length > 0) {
                    this.del = true;
                }
            }
        })
    }
}
</script>

<style lang="scss" scoped>
.station {

    &__table::v-deep {
        height: 100vh;

        thead tr th {
            position: sticky;
            z-index: 3;
        }

        .q-table__top,
        .q-table__bottom,
        thead tr:first-child th {
            background-color: #fff
        }
        thead tr:last-child th {
            top: 48px
        }
        thead tr:first-child th {
            top: 0 
        }
    }
}

.unselectable {
    user-select: none;
}
    
</style>