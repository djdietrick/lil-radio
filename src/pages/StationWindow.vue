<template>
    <div class="station" v-if="Station">
        <div class="station__header">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{Station.name}}</q-toolbar-title>
                <q-btn flat round dense icon="delete" @click="deleteStation"/>
            </q-toolbar>
        </div>
        <div class="station__content">
            <Chunk v-for="(chunk, i) in Station.chunks" :key="i" :id="parseInt(chunk.id)" :i="i"/>
        </div>
    </div>
</template>

<script>
import gql from 'graphql-tag'
import Chunk from '../components/station/Chunk.vue';

export default {
    props: {
        id: {
            required: true
        }
    },
    components: {
        Chunk
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
                            chunks {
                                id
                                songs {
                                    id
                                    title
                                }
                            }
                        }
                    }`
                } else {
                    return gql`query {
                        Station(id: -1) {
                            id
                            name
                            chunks {
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
    display: grid;
    grid-template-rows: 5rem 1rem;
}
    
</style>