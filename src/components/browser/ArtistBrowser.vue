<template>
    <div class="artists">
        <q-drawer v-model="true" side="left" elevated>
            <div class="artists__list">
                <q-list bordered separator>
                    <q-item clickable v-for="artist in Artists" :key="artist.id"
                        :active="selected == artist.id" @click="selected = artist.id">
                        {{artist.name}}
                    </q-item>
                </q-list>
            </div>
        </q-drawer>
        
        <q-page-container>
            <q-page>
             <div class="artists__discography">
                <q-inifinite-scroll>
                    <q-list v-if="Artist" separator>
                        <q-item v-for="album in Artist.albums" :key="album.id">
                            <q-item-section>
                                <h5>{{album.title}}</h5>
                                <q-list dense>
                                    <q-item v-for="song in album.songs" :key="song.id">
                                        {{song.title}}
                                    </q-item>
                                </q-list>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-inifinite-scroll>
            </div>
            </q-page>
        </q-page-container>
    </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
    props: {
        search: String
    },
    data() {
        return {
            selected: null
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
                if (this.selected) {
                    return gql`query {
                        Artist(id: ${this.selected}) {
                            id,
                            name,
                            albums {
                                id
                                title
                                songs {
                                    id
                                    title
                                }
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
        }
    }
}
</script>

<style lang="scss" scoped>
.artists {
    display: grid;
    grid-template-columns: 1fr 3fr;
    height: 92vh;

    &__discography {
        height: 100%;
        overflow-y: auto;
    }
}
</style>


