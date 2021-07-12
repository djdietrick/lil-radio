<template>
    <div class="baseaudio">
        <Audio />
        <Controller />
    </div>
</template>

<script>
import Controller from './Controller.vue';
import Audio from './Audio.vue';
export default {
    components: {
        Controller,
        Audio
    }
}
</script>