<template>
    <div class="station" v-if="Station">
        <SongGrid :songList="songList" @updateSelected="selected = $event"/>

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
import SongGrid from '../components/grid/SongGrid.vue';

export default {
    props: {
        id: {
            required: true
        }
    },
    components: {
        SongGrid
    },
    data() {
        return {
            sortMode: 'artist',
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