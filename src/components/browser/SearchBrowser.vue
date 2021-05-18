<template>
    <div class="teset">
            SEARCH!

    </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
    props: {
        term: {
            type: String,
            default: ''
        }
    },
    apollo: {
        SearchArtist: {
            query() {
                return gql`query{
                    SearchArtist(name: "${this.term}") {
                        id,
                        name
                    }
                }`;
            }
        },
        SearchAlbum: {
            query() {
                return gql`query{
                    SearchAlbum(title: "${this.term}") {
                        id,
                        title,
                        artist {
                            name
                        }
                    }
                }`;
            }
        },
        SearchSong: {
            query() {
                return gql`query {
                    SearchSongs(title: "${this.term}") {
                        id,
                        title,
                        artist {
                            name
                        },
                        album {
                            title
                        }
                    }    
                }`;
            }
        }
    }
}
</script>