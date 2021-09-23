<template>
    <div class="blank">
        <div class="blank__container">
            <div class="blank__text">
            No music, please select a music directory.
            </div>
            <q-btn size="xl" label="Go To Settings" color="primary" class="blank__btn" @click="openSettings"></q-btn>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        openSettings() {
            this.$q.electron.ipcRenderer.send('openSettings');
        }
    }
}
</script>

<style lang="scss" scoped>
    
.blank {
    height: 100vh;
    width: 98vw;
    display: grid;
    place-items: center;
    font-size: 3rem;

    &__container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    &__btn {
        margin-top: 4rem;
    }
}

</style>