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
        <q-table class="station__table" dense :data="Station.songs" :columns="columns" :title="Station.name"
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
                    <q-tr class="cursor-pointer" :props="props" @click.native="props.selected = !props.selected">
                        <q-td v-for="col in props.cols" :key="col.name" :props="props">
                            {{ col.value }}
                        </q-td>
                    </q-tr>
                </template>

        </q-table>
    </div>
</template>

<script>
import gql from 'graphql-tag';
import moment from 'moment';

export default {
    props: {
        id: {
            required: true
        }
    },
    data() {
        return {
            sortMode: 'artist',
            selected: [],
            columns: [
                {
                    name: 'title',
                    label: 'Title',
                    sortable: true,
                    field: 'title',
                    align: 'left'
                },
                {
                    name: 'artist',
                    label: 'Artist',
                    field: row => row.artist.name,
                    sortable: true,
                    align: 'left'
                },
                {
                    name: 'album',
                    label: 'Album',
                    field: row => row.album.title,
                    sortable: true,
                    align: 'left'
                },
                {
                    name: 'duration',
                    label: 'Duration',
                    field: 'duration',
                    align: 'left',
                    format: val => `${this.formatTime(val)}`
                },
                {
                    name: 'track',
                    label: 'Track',
                    field: 'track',
                    align: 'left'
                }
            ],
            pagination: {
                page: 1,
                rowsPerPage: 0
            }
        }
    },
    watch: {
        Station: function(val) {
            if(!val) {
                this.$q.loading.show();
            } else {
                this.$q.loading.hide();
            }
        },
        selected: function(val) {
            console.log(val);
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
            console.log(sortBy);
            let ret = [];
            if(this.Station) {
                if(this.sortMode === 'artist') {
                    let byArtist = {};
                    let artistIdToName = {};
                    for(let song of this.Station.songs) {
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
                } else if(this.sortMode === 'title') {

                } else if(this.sortMode === 'album') {

                }
            }
            console.log(ret);
            return ret;
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
    
</style>