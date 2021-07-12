<template>
    <div class="chunk" v-if="chunk && chunk.songs">
        <div class="chunk__song" v-for="song in chunk.songs">
            {{song.title}}
        </div>
    </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
    props: {
        id: {
            type: Number,
            required: true
        },
        i: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            chunk: null
        }
    },
    apollo: {
        Chunk() {
            return {
                query: gql`query Chunk($chunkId: ID!) {
                    Chunk(id: $chunkId) {
                        songs {
                            title
                        }
                    }
                }`,
                variables: {
                    chunkId: this.id
                }
            }  
        }
    },
    watch: {
        Chunk: function(c) {
            this.chunk = c;
        }
    }
}
</script>

<style lang="scss" scoped>
    
</style>