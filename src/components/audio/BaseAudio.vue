<template>
    <div class="baseaudio">
        <Audio />
        <Controller :shuffle="shuffle"/>
    </div>
</template>

<script>
import Controller from './Controller.vue';
import Audio from './Audio.vue';
export default {
    props: {
        shuffle: {
            default: false
        }
    },
    components: {
        Controller,
        Audio
    }
}
</script>