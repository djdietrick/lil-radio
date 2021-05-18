<template>
    <div class="station">
        <div class="station__header">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{Station.name}}</q-toolbar-title>
            </q-toolbar>
        </div>
        <div class="station__content">
            <div class="station__content__chunk" v-for="(chunk, i) in Station.chunks" :key="i">
                <div class="station__content__chunk__song" v-for="(song, i) in chunk.songs" :key="i">
                    {{song.title}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import gql from 'graphql-tag'
export default {
    props: ['id'],
    apollo: {
        Station: {
            query() {
                if(this.id) {
                     return gql`query {
                        Station(id: ${this.id}) {
                            id,
                            name,
                            chunks {
                                songs {
                                    id,
                                    title
                                }
                            }
                        }
                    }`
                } else {
                    return gql`query {
                        Station(id: -1) {
                            id,
                            name
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