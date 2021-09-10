<template>
    <div class="tray" :class="{'tray--audio': queue && queue.length > 0}">
        <template v-if="!selectedStation">
            <div class="tray__header">
                <q-btn outline color="primary" icon="music_note" class="full-width tray__header__btn" @click="openBrowser"/>
                <q-btn outline color="primary" icon="add" class="full-width tray__header__btn" @click="newStation"/>
                <q-btn outline color="primary" icon="settings" class="full-width tray__header__btn" @click="openSettings"/>
            </div>
            <div class="tray__stations">
                <div class="tray__stations__entry" v-for="station in stations">
                    <div class="tray__stations__entry__name">{{station.name}}</div>
                    <q-btn flat round icon="play_arrow" size="xs" class="tray__stations__entry__edit" @click="selectStation(station)"/>
                    <q-btn flat round icon="edit" size="xs" class="tray__stations__entry__edit" @click="editStation(station)"/>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="tray__header">
                <q-btn outline color="primary" icon="arrow_back" class="tray__header__btn" @click="unselectStation()"/>
                <div class="tray__header__title">
                    {{selectedStation.name}}
                </div>
                <q-btn outline color="primary" icon="music_note" class="tray__header__btn tray__header__btn--right" @click="openBrowser"/>
                <q-btn outline color="primary" icon="edit" class="tray__header__btn tray__header__btn--right" @click="editStation(selectedStation)"/>
            </div>
            <TrayQueue :station="selectedStation"/>
        </template>
        <BaseAudio v-if="queue && queue.length > 0" :shuffle="true"/>
    </div>
</template>

<script>
import gql from 'graphql-tag';
import {mapActions, mapGetters} from 'vuex';
import DoubleClickHandler from '../mixins/DoubleClickHandler';
import SongGrid from '../components/grid/SongGrid.vue';
import TrayQueue from '../components/audio/TrayQueue.vue';
import BaseAudio from '../components/audio/BaseAudio.vue';

export default {
    data() {
        return {
            selectedStation: null,
            songList: []
        }
    },
    computed: {
        ...mapGetters({
            stations: 'getStations',
            queue: 'getQueue'
        })
    },
    methods: {
        ...mapActions(['fetchStations']),
        newStation() {
            this.$q.dialog({
                title: 'New Station',
                prompt: {
                    model: '',
                    type: 'text'
                },
                cancel: true,
                persistant: false
            }).onOk(async (data) => {
                await this.$apollo.mutate({
                    mutation: gql`mutation ($name: String!) {
                        createStation(name: $name) {
                            id
                        }
                    }`,
                    variables: {
                        name: data
                    }
                })
                await this.fetchStations();
            })
        },
        openBrowser() {
            this.$q.electron.ipcRenderer.send('openBrowser')
        },
        openSettings() {
            this.$q.electron.ipcRenderer.send('openSettings');
        },
        editStation(station) {
            this.$q.electron.ipcRenderer.send('editStation', station);
        },
        async selectStation(station) {
            this.selectedStation = station;
            console.log(station);
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
                        }
                    }    
                }`,
                variables: {
                    stationId: station.id
                }
            })
            this.songList = res.data.Station.songs;
        },
        unselectStation() {
            this.selectedStation = null;
            this.songList = [];
        }
    },
    async created() {
        await this.fetchStations();
    },
    mixins: [
        DoubleClickHandler
    ],
    components: {
        SongGrid,
        TrayQueue,
        BaseAudio
    }
}
</script>

<style lang="scss" scoped>
.tray {
    display: grid;
    grid-template-rows: 3rem 1fr;
    height: 100vh;
    width: 100%;

    &--audio {
        grid-template-rows: 3rem 2fr 1fr;
    }

    &__header {
        display: flex;
        padding: 5px;
        justify-content: space-between;

        &__title {
            align-self: center;
            font-size: 1.6rem;
        }
        
        &__btn {
            &:not(:last-child) {
                margin-right: 10px !important;
            }
        }
    }

    &__stations {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        padding: 0.5rem;

        &__entry {
            background-color: $grey-4;
            height: 3rem;
            width: 100%;
            border-radius: 5px;
            display: flex;
            align-items: center;
            padding: 0 1rem;
            transition: 0.2s ease-in-out;

            &:hover {
                background-color: $grey-5;
            }

            &__edit {
                margin-left: auto;
            }
        }
    }

    &__container {
        display: grid;
        grid-template-rows: 5fr 1fr;
    }


}
</style>