<template>
    
</template>

<script>
import Grid from './Grid.vue';
export default {
    props: {
        songList: {
            required: true,
            type: Array
        }
    },
    components: [
        Grid
    ]
}
</script>