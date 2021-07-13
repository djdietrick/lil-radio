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
        <q-table class="station__table" dense :data="rows" :columns="columns" row-key="id" :title="Station.name"
                :rows-per-page-options="[0]" :pagination.sync="pagination" hide-bottom virtual-scroll
                :virtual-scroll-item-size="48" :virtual-scroll-sticky-size-start="48"></q-table>
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
    computed: {
        rows() {
            let ret = [];
            if(this.Station) {
                if(this.sortMode === 'artist') {
                    let byArtist = {};
                    for(let song of this.Station.songs) {
                        if(!byArtist[song.artist.id]) byArtist[song.artist.id] = [];
                        byArtist[song.artist.id].push(song);
                    }
                    for(let key of Object.keys(byArtist)) {
                        byArtist[key].sort((l, r) => {
                            if(l.album.id === r.album.id) {
                                if(l.disk === r.disk) {
                                    return l.track < r.track;
                                } else {
                                    return l.disk < r.disk;
                                }
                            } else {
                                return l.album.title < r.album.title;
                            }
                        })
                    }
                    for(let key of Object.keys(byArtist)) {
                        ret.push(...byArtist[key])
                    }
                } else if(this.sortMode === 'title') {

                } else if(this.sortMode === 'album') {

                }
            }
            return ret;
        }
    },
    watch: {
        Station: function(val) {
            if(!val) {
                this.$q.loading.show();
            } else {
                this.$q.loading.hide();
            }
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