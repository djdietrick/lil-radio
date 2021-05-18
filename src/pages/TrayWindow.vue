<template>
    <div class="tray">
        <div class="tray__header">
            <q-btn outline color="primary" icon="music_note" class="full-width tray__header__btn" @click="openBrowser"/>
            <q-btn outline color="primary" icon="add" class="full-width tray__header__btn" @click="newStation"/>
        </div>
        <div class="tray__stations">
            <div class="tray__stations__entry" v-for="station in Stations">
                <div class="tray__stations__entry__name">{{station.name}}</div>
                <q-btn flat round icon="edit" size="xs" class="tray__stations__entry__edit" @click="editStation(station.id)"/>
            </div>
        </div>
    </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
    methods: {
        newStation() {
            this.$q.dialog({
                title: 'New Station',
                prompt: {
                    model: '',
                    type: 'text'
                },
                cancel: true,
                persistant: false
            }).onOk(data => {
                this.$apollo.mutate({
                    mutation: gql`mutation ($name: String!) {
                        createStation(name: $name) {
                            id
                        }
                    }`,
                    variables: {
                        name: data
                    }
                })
            })
        },
        openBrowser() {
            this.$q.electron.ipcRenderer.send('openBrowser')
        },
        editStation(id) {
            this.$q.electron.ipcRenderer.send('editStation', id);
        }
    },
    apollo: {
        Stations: gql`query {
            Stations {
                id
                name
            }
        }`
    }
}
</script>

<style lang="scss" scoped>
.tray {
    display: grid;
    grid-template-rows: 3rem 1fr;
    height: 100vh;
    width: 100vw;

    &__header {
        display: flex;
        padding: 5px;
        
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
}
</style>